import OpenAI from "openai";
import { createHash, randomUUID } from "node:crypto";
import Redis from "ioredis";

import { PolicySynthAgentBase } from "../base/agentBase.js";
import sharedRedisClient from "../base/redisClient.js";

export type StoredResponseCleanupRedisClient = {
  eval?: (
    script: string,
    numberOfKeys: number,
    ...args: Array<number | string>
  ) => Promise<unknown>;
  zadd(key: string, score: number | string, member: string): Promise<number>;
  zrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    ...args: Array<number | string>
  ): Promise<string[]>;
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    ...args: Array<number | string>
  ): Promise<unknown>;
  del(...keys: string[]): Promise<number>;
  zrem(key: string, ...members: string[]): Promise<number>;
  quit?: () => Promise<unknown>;
};

export type StoredResponseCleanupRecord = {
  responseIds: string[];
  dueAtMs: number;
  lastActivityAtMs: number;
  responsesStateKey: string;
  modelName: string;
  credentialRef?: string;
  transportBaseUrl?: string;
  regionalProcessing?: PsOpenAiRegionalProcessing;
  createdAtMs: number;
  failureCount?: number;
  lastFailureAtMs?: number;
  lastFailureMessage?: string;
  deadLetteredAtMs?: number;
};

export type StoredResponseCleanupClient = {
  responses: {
    delete(responseId: string): Promise<unknown>;
  };
};

export type StoredResponseCleanupFailure = {
  chainKey: string;
  responseId?: string;
  message: string;
};

export type StoredResponseCleanupSummary = {
  scanned: number;
  chainsDeleted: number;
  responsesDeleted: number;
  chainsRescheduled: number;
  chainsDeadLettered?: number;
  skippedNotDue: number;
  failures: StoredResponseCleanupFailure[];
};

export type StoredResponseCleanupOptions = {
  redis?: StoredResponseCleanupRedisClient;
  redisUrl?: string;
  redisKeyPrefix?: string;
  apiKey?: string;
  clientFactory?: (
    record: StoredResponseCleanupRecord
  ) => StoredResponseCleanupClient;
  nowMs?: number;
  limit?: number;
  retryDelayMs?: number;
  maxFailureCount?: number;
  processingLeaseMs?: number;
  deletedMarkerTtlMs?: number;
  redisOperationTimeoutMs?: number;
};

export type OpenAiResponsesCleanupLogger = {
  error(message: string): void;
  info(message: string): void;
  warn(message: string): void;
};

export type OpenAiResponsesCleanupIdentity = {
  responsesStateKey: string;
  modelName: string;
  credentialRef?: string;
  transportBaseUrl?: string;
  regionalProcessing?: PsOpenAiRegionalProcessing;
};

export type OpenAiResponsesCleanupSettings = {
  idleMinutes: number;
  responsesStateKey: string;
};

type StoredResponseCleanupScriptStatus =
  | "claimed"
  | "invalid"
  | "missing"
  | "not_due"
  | "queued"
  | "refreshed"
  | "touched";

type StoredResponseCleanupScriptResult = {
  status: StoredResponseCleanupScriptStatus;
  value?: string;
};

type StoredResponseCleanupClaimResult =
  | {
      status: "claimed";
      record: StoredResponseCleanupRecord;
      processingKey: string;
    }
  | {
      status: "invalid";
      rawRecord: string;
    }
  | {
      status: "missing" | "not_due";
    };

type StoredResponseCleanupWriteResult = {
  status: "queued" | "refreshed" | "invalid";
  responseCount: number;
};

type StoredResponseCleanupRescheduleResult =
  | "deadLettered"
  | "rescheduled";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const OPENAI_RESPONSES_CLEANUP_KEY_PREFIX =
  "ps:openai:responses:cleanup";
const OPENAI_RESPONSES_CLEANUP_DEFAULT_STATE_KEY = "default";
const OPENAI_RESPONSES_CLEANUP_REDIS_TIMEOUT_MS = 1_000;
const OPENAI_RESPONSES_CLEANUP_MAX_FAILURE_COUNT = 96;
const OPENAI_RESPONSES_CLEANUP_PROCESSING_LEASE_MS = 15 * 60_000;
const OPENAI_RESPONSES_CLEANUP_DELETED_MARKER_TTL_MS =
  7 * 24 * 60 * 60 * 1_000;
const OPENAI_ALLOWED_CLEANUP_BASE_URLS = new Set([
  "https://api.openai.com/v1",
  "https://eu.api.openai.com/v1",
]);

// Redis Lua script: atomically refreshes an existing chain's idle deadline.
const TOUCH_STORED_RESPONSE_CLEANUP_CHAIN_SCRIPT = `
local raw = redis.call("GET", KEYS[1])
if not raw then
  return {"missing", "0"}
end

local ok, record = pcall(cjson.decode, raw)
if not ok or type(record) ~= "table" then
  return {"invalid", "0"}
end

if type(record["responseIds"]) ~= "table" or #record["responseIds"] == 0 then
  return {"invalid", "0"}
end

record["dueAtMs"] = tonumber(ARGV[1])
record["lastActivityAtMs"] = tonumber(ARGV[2])
redis.call("SET", KEYS[1], cjson.encode(record))
redis.call("ZADD", KEYS[2], ARGV[1], KEYS[1])
return {"touched", tostring(#record["responseIds"])}
`;

// Redis Lua script: atomically merges new response IDs into a cleanup chain.
const MERGE_STORED_RESPONSE_CLEANUP_CHAIN_SCRIPT = `
local raw = redis.call("GET", KEYS[1])
local record = {}
local status = "queued"

if raw then
  local ok, decoded = pcall(cjson.decode, raw)
  if not ok or type(decoded) ~= "table" then
    return {"invalid", "0"}
  end
  record = decoded
  if type(record["responseIds"]) ~= "table" or #record["responseIds"] == 0 then
    return {"invalid", "0"}
  end
  if not tonumber(record["dueAtMs"]) then
    return {"invalid", "0"}
  end
end

local incomingOk, incomingIds = pcall(cjson.decode, ARGV[1])
if not incomingOk or type(incomingIds) ~= "table" or #incomingIds == 0 then
  return {"invalid", "0"}
end

local responseIds = record["responseIds"] or {}

for _, incomingId in ipairs(incomingIds) do
  local exists = false
  for _, existingId in ipairs(responseIds) do
    if existingId == incomingId then
      exists = true
      break
    end
  end
  if exists then
    status = "refreshed"
  else
    table.insert(responseIds, incomingId)
  end
end

local requestedDueAtMs = tonumber(ARGV[3])
local existingDueAtMs = tonumber(record["dueAtMs"])
local dueAtMs = requestedDueAtMs
if existingDueAtMs and existingDueAtMs > requestedDueAtMs then
  dueAtMs = existingDueAtMs
end

record["responseIds"] = responseIds
record["dueAtMs"] = dueAtMs
record["lastActivityAtMs"] = tonumber(ARGV[2])
record["responsesStateKey"] = ARGV[4]
record["modelName"] = ARGV[5]
if ARGV[6] ~= "" then record["credentialRef"] = ARGV[6] else record["credentialRef"] = nil end
if ARGV[7] ~= "" then record["transportBaseUrl"] = ARGV[7] else record["transportBaseUrl"] = nil end
if ARGV[8] ~= "" then record["regionalProcessing"] = ARGV[8] else record["regionalProcessing"] = nil end
if type(record["createdAtMs"]) ~= "number" then record["createdAtMs"] = tonumber(ARGV[9]) end
if ARGV[10] ~= "" then record["failureCount"] = tonumber(ARGV[10]) end
if ARGV[11] ~= "" then record["lastFailureAtMs"] = tonumber(ARGV[11]) end
if ARGV[12] ~= "" then record["lastFailureMessage"] = ARGV[12] end
if ARGV[13] ~= "" then record["deadLetteredAtMs"] = tonumber(ARGV[13]) end

redis.call("SET", KEYS[1], cjson.encode(record))
redis.call("ZADD", KEYS[2], tostring(dueAtMs), KEYS[1])
redis.call("DEL", KEYS[3])
return {status, tostring(#responseIds)}
`;

// Redis Lua script: atomically rechecks dueAtMs and claims a due chain.
const CLAIM_DUE_STORED_RESPONSE_CLEANUP_CHAIN_SCRIPT = `
local raw = redis.call("GET", KEYS[1])
if not raw then
  redis.call("ZREM", KEYS[2], KEYS[1])
  return {"missing", ""}
end

local ok, record = pcall(cjson.decode, raw)
if not ok or type(record) ~= "table" then
  return {"invalid", raw}
end

if type(record["responseIds"]) ~= "table" or #record["responseIds"] == 0 then
  return {"invalid", raw}
end

local dueAtMs = tonumber(record["dueAtMs"])
if not dueAtMs then
  return {"invalid", raw}
end

if dueAtMs > tonumber(ARGV[1]) then
  redis.call("ZADD", KEYS[2], tostring(dueAtMs), KEYS[1])
  return {"not_due", raw}
end

redis.call("DEL", KEYS[1])
redis.call("ZREM", KEYS[2], KEYS[1])
redis.call("SET", KEYS[3], raw)
redis.call("ZADD", KEYS[4], ARGV[2], KEYS[3])
return {"claimed", raw}
`;

export class OpenAiResponsesCleanup extends PolicySynthAgentBase {
  private static cleanupRedisClientOverride?:
    | StoredResponseCleanupRedisClient
    | undefined;

  static get defaultStateKey(): string {
    return OPENAI_RESPONSES_CLEANUP_DEFAULT_STATE_KEY;
  }

  static setStoredResponseCleanupRedisClientForTests(
    redis?: StoredResponseCleanupRedisClient
  ): void {
    this.cleanupRedisClientOverride = redis;
  }

  static getSettings(
    requestOptions: PsModelRequestOptions | undefined,
    usingAzure: boolean,
    logger: OpenAiResponsesCleanupLogger
  ): OpenAiResponsesCleanupSettings | undefined {
    const idleMinutes = requestOptions?.deleteOpenAiResponsesAfterIdleMinutes;
    if (
      typeof idleMinutes !== "number" ||
      !Number.isFinite(idleMinutes) ||
      idleMinutes <= 0
    ) {
      return undefined;
    }

    if (usingAzure) {
      logger.warn(
        "Skipping stored OpenAI Responses cleanup scheduling for Azure-compatible Responses transport."
      );
      return undefined;
    }

    const responsesStateKey =
      requestOptions?.responsesStateKey?.trim() ||
      requestOptions?.safetyIdentifier?.trim() ||
      OPENAI_RESPONSES_CLEANUP_DEFAULT_STATE_KEY;

    return { idleMinutes, responsesStateKey };
  }

  static getChainKey(identity: OpenAiResponsesCleanupIdentity): string {
    return this.getCleanupChainKey(
      OPENAI_RESPONSES_CLEANUP_KEY_PREFIX,
      this.getIdentityHashPayload(identity)
    );
  }

  static getResponseIdFromResult(
    result: PsBaseModelReturnParameters
  ): string | undefined {
    const responseId = result.usageItemData?.providerMetadata?.responseId;
    return typeof responseId === "string" && responseId ? responseId : undefined;
  }

  static resolveOpenAiCredentialRef(
    apiKey: string | undefined,
    configuredCredentialRef?: string
  ): string | undefined {
    if (
      apiKey &&
      process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY &&
      apiKey === process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY
    ) {
      return "env:PS_AGENT_OVERRIDE_OPENAI_API_KEY";
    }

    if (
      apiKey &&
      process.env.OPENAI_API_KEY &&
      apiKey === process.env.OPENAI_API_KEY
    ) {
      return "env:OPENAI_API_KEY";
    }

    if (configuredCredentialRef) {
      return configuredCredentialRef;
    }

    return this.getApiKeyFingerprintCredentialRef(apiKey);
  }

  static async touchChain({
    settings,
    identity,
    hasPreviousResponse,
    resetResponsesState,
    logger,
  }: {
    settings: OpenAiResponsesCleanupSettings;
    identity: OpenAiResponsesCleanupIdentity;
    hasPreviousResponse: boolean;
    resetResponsesState: () => void;
    logger: OpenAiResponsesCleanupLogger;
  }): Promise<void> {
    try {
      const redis = OpenAiResponsesCleanup.getCleanupRedisClient({}).redis;
      const redisOperationTimeoutMs =
        OpenAiResponsesCleanup.getCleanupRedisOperationTimeoutMs();
      const chainKey = OpenAiResponsesCleanup.getChainKey(identity);
      const nowMs = Date.now();
      const dueAtMs = nowMs + settings.idleMinutes * 60_000;

      if (
        hasPreviousResponse &&
        (await OpenAiResponsesCleanup.hasCleanupDeletionMarker(
          redis,
          chainKey,
          redisOperationTimeoutMs
        ))
      ) {
        OpenAiResponsesCleanup.resetStaleLocalStateIfNeeded({
          hasPreviousResponse,
          resetResponsesState,
          logger,
          nowMs,
        });
        return;
      }

      if (redis.eval) {
        const rawResult = await OpenAiResponsesCleanup.withCleanupRedisTimeout(
          () =>
            redis.eval!(
              TOUCH_STORED_RESPONSE_CLEANUP_CHAIN_SCRIPT,
              2,
              chainKey,
              OpenAiResponsesCleanup.getCleanupDueSetKey(
                OPENAI_RESPONSES_CLEANUP_KEY_PREFIX
              ),
              dueAtMs,
              nowMs
            ),
          redisOperationTimeoutMs
        );
        const result =
          OpenAiResponsesCleanup.normalizeCleanupScriptResult(rawResult);
        if (result.status === "missing") {
          const wasDeletedByCleanup =
            await OpenAiResponsesCleanup.hasCleanupDeletionMarker(
              redis,
              chainKey,
              redisOperationTimeoutMs
            );
          if (wasDeletedByCleanup) {
            OpenAiResponsesCleanup.resetStaleLocalStateIfNeeded({
              hasPreviousResponse,
              resetResponsesState,
              logger,
              nowMs,
            });
          }
          return;
        }

        if (result.status === "invalid") {
          OpenAiResponsesCleanup.resetStaleLocalStateIfNeeded({
            hasPreviousResponse,
            resetResponsesState,
            logger,
            nowMs,
          });
          return;
        }

        if (result.status === "touched") {
          logger.info(
            `OpenAI Responses cleanup extended idle deletion for ${
              result.value ?? "0"
            } stored responses at ${OpenAiResponsesCleanup.formatCleanupAuditTime(
              nowMs
            )}`
          );
        }
        return;
      }

      const rawRecord = await OpenAiResponsesCleanup.withCleanupRedisTimeout(
        () => redis.get(chainKey),
        redisOperationTimeoutMs
      );
      if (!rawRecord) {
        const wasDeletedByCleanup =
          await OpenAiResponsesCleanup.hasCleanupDeletionMarker(
            redis,
            chainKey,
            redisOperationTimeoutMs
          );
        if (wasDeletedByCleanup) {
          OpenAiResponsesCleanup.resetStaleLocalStateIfNeeded({
            hasPreviousResponse,
            resetResponsesState,
            logger,
            nowMs,
          });
        }
        return;
      }

      const record = OpenAiResponsesCleanup.parseCleanupRecord(rawRecord);
      if (!record) {
        OpenAiResponsesCleanup.resetStaleLocalStateIfNeeded({
          hasPreviousResponse,
          resetResponsesState,
          logger,
          nowMs,
        });
        return;
      }

      const updatedRecord: StoredResponseCleanupRecord = {
        ...record,
        dueAtMs,
        lastActivityAtMs: nowMs,
      };
      await OpenAiResponsesCleanup.withCleanupRedisTimeout(
        async () => {
          await redis.set(chainKey, JSON.stringify(updatedRecord));
          await redis.zadd(
            OpenAiResponsesCleanup.getCleanupDueSetKey(
              OPENAI_RESPONSES_CLEANUP_KEY_PREFIX
            ),
            dueAtMs,
            chainKey
          );
        },
        redisOperationTimeoutMs
      );
      logger.info(
        `OpenAI Responses cleanup extended idle deletion for ${
          record.responseIds.length
        } stored responses at ${OpenAiResponsesCleanup.formatCleanupAuditTime(
          nowMs
        )}`
      );
    } catch (error) {
      logger.error(
        `Failed to touch stored OpenAI Responses cleanup chain: ${OpenAiResponsesCleanup.getErrorMessage(
          error
        )}`
      );
    }
  }

  static async scheduleResponse({
    settings,
    identity,
    responseId,
    logger,
  }: {
    settings: OpenAiResponsesCleanupSettings;
    identity: OpenAiResponsesCleanupIdentity;
    responseId: string;
    logger: OpenAiResponsesCleanupLogger;
  }): Promise<void> {
    try {
      const redis = OpenAiResponsesCleanup.getCleanupRedisClient({}).redis;
      const redisOperationTimeoutMs =
        OpenAiResponsesCleanup.getCleanupRedisOperationTimeoutMs();
      const nowMs = Date.now();
      const dueAtMs = nowMs + settings.idleMinutes * 60_000;
      const chainKey = OpenAiResponsesCleanup.getChainKey(identity);
      const record: StoredResponseCleanupRecord = {
        responseIds: [responseId],
        dueAtMs,
        lastActivityAtMs: nowMs,
        responsesStateKey: identity.responsesStateKey,
        modelName: identity.modelName,
        credentialRef: identity.credentialRef,
        transportBaseUrl: identity.transportBaseUrl,
        regionalProcessing: identity.regionalProcessing,
        createdAtMs: nowMs,
      };

      const writeResult =
        await OpenAiResponsesCleanup.mergeStoredResponseCleanupRecord(
          redis,
          OPENAI_RESPONSES_CLEANUP_KEY_PREFIX,
          chainKey,
          record,
          redisOperationTimeoutMs
        );
      if (writeResult.status === "invalid") {
        logger.error(
          `Failed to schedule stored OpenAI Responses cleanup: invalid existing cleanup record for ${chainKey}`
        );
        return;
      }

      logger.info(
        writeResult.status === "refreshed"
          ? `OpenAI Responses cleanup refreshed stored response ${responseId} at ${OpenAiResponsesCleanup.formatCleanupAuditTime(
              nowMs
            )}`
          : `OpenAI Responses cleanup queued stored response ${responseId} at ${OpenAiResponsesCleanup.formatCleanupAuditTime(
              nowMs
            )}`
      );
    } catch (error) {
      logger.error(
        `Failed to schedule stored OpenAI Responses cleanup: ${OpenAiResponsesCleanup.getErrorMessage(
          error
        )}`
      );
    }
  }

  static async deleteIdleStoredResponses(
    options: StoredResponseCleanupOptions = {}
  ): Promise<StoredResponseCleanupSummary> {
    const redisResolution = this.getCleanupRedisClient(options);
    const redis = redisResolution.redis;
    const nowMs = options.nowMs ?? Date.now();
    const limit = options.limit ?? 100;
    const retryDelayMs = options.retryDelayMs ?? 15 * 60_000;
    const maxFailureCount =
      options.maxFailureCount ?? OPENAI_RESPONSES_CLEANUP_MAX_FAILURE_COUNT;
    const processingLeaseMs =
      options.processingLeaseMs ??
      OPENAI_RESPONSES_CLEANUP_PROCESSING_LEASE_MS;
    const deletedMarkerTtlMs = this.getCleanupDeletedMarkerTtlMs(
      options.deletedMarkerTtlMs
    );
    const redisOperationTimeoutMs = this.getCleanupRedisOperationTimeoutMs(
      options.redisOperationTimeoutMs
    );
    const keyPrefix =
      options.redisKeyPrefix ?? OPENAI_RESPONSES_CLEANUP_KEY_PREFIX;
    const dueSetKey = this.getCleanupDueSetKey(keyPrefix);
    const failures: StoredResponseCleanupFailure[] = [];
    let scanned = 0;
    let chainsDeleted = 0;
    let responsesDeleted = 0;
    let chainsRescheduled = 0;
    let chainsDeadLettered = 0;
    let skippedNotDue = 0;

    try {
      await this.recoverExpiredProcessingRecords(
        redis,
        keyPrefix,
        nowMs,
        limit,
        redisOperationTimeoutMs
      );

      const chainKeys = await this.withCleanupRedisTimeout(
        () =>
          redis.zrangebyscore(
            dueSetKey,
            "-inf",
            nowMs,
            "LIMIT",
            0,
            limit
          ),
        redisOperationTimeoutMs
      );
      scanned = chainKeys.length;

      for (const chainKey of chainKeys) {
        const claim = await this.claimDueStoredResponseCleanupChain(
          redis,
          keyPrefix,
          chainKey,
          nowMs,
          processingLeaseMs,
          redisOperationTimeoutMs
        );

        if (claim.status === "missing") {
          continue;
        }

        if (claim.status === "not_due") {
          skippedNotDue++;
          continue;
        }

        if (claim.status === "invalid") {
          await this.deadLetterInvalidCleanupRecord(
            redis,
            keyPrefix,
            chainKey,
            claim.rawRecord,
            nowMs,
            redisOperationTimeoutMs
          );
          chainsDeadLettered++;
          failures.push({
            chainKey,
            message: "Invalid stored response cleanup record",
          });
          continue;
        }

        if (claim.status !== "claimed") {
          continue;
        }

        const record = claim.record;

        let client: StoredResponseCleanupClient;
        try {
          client = this.createCleanupClient(record, options);
        } catch (error) {
          const message = this.getErrorMessage(error);
          failures.push({
            chainKey,
            message,
          });
          const rescheduleResult =
            await this.rescheduleStoredResponseCleanupRecord({
              redis,
              keyPrefix,
              chainKey,
              processingKey: claim.processingKey,
              record,
              nowMs,
              retryDelayMs,
              maxFailureCount,
              message,
              redisOperationTimeoutMs,
            });
          if (rescheduleResult === "deadLettered") {
            chainsDeadLettered++;
          } else {
            chainsRescheduled++;
          }
          continue;
        }

        let chainHadFailure = false;
        const deletedResponseIds = new Set<string>();

        for (const responseId of [...record.responseIds].reverse()) {
          try {
            await client.responses.delete(responseId);
            responsesDeleted++;
            deletedResponseIds.add(responseId);
            this.logger.info(
              `OpenAI Responses cleanup deleted stored response ${responseId} at ${this.formatCleanupAuditTime(
                nowMs
              )}`
            );
          } catch (error) {
            if (this.isNotFoundError(error)) {
              responsesDeleted++;
              deletedResponseIds.add(responseId);
              this.logger.info(
                `OpenAI Responses cleanup stored response already deleted ${responseId} at ${this.formatCleanupAuditTime(
                  nowMs
                )}`
              );
              continue;
            }

            chainHadFailure = true;
            const message = this.getErrorMessage(error);
            failures.push({
              chainKey,
              responseId,
              message,
            });
            break;
          }
        }

        if (chainHadFailure) {
          const remainingResponseIds = record.responseIds.filter(
            (responseId) => !deletedResponseIds.has(responseId)
          );
          const retryRecord: StoredResponseCleanupRecord = {
            ...record,
            responseIds: remainingResponseIds,
          };
          const lastFailure = failures[failures.length - 1];
          const rescheduleResult =
            await this.rescheduleStoredResponseCleanupRecord({
              redis,
              keyPrefix,
              chainKey,
              processingKey: claim.processingKey,
              record: retryRecord,
              nowMs,
              retryDelayMs,
              maxFailureCount,
              message: lastFailure?.message ?? "Stored response cleanup failed",
              redisOperationTimeoutMs,
            });
          if (rescheduleResult === "deadLettered") {
            chainsDeadLettered++;
          } else {
            chainsRescheduled++;
          }
          if (deletedResponseIds.size > 0) {
            await this.setCleanupDeletedMarker(
              redis,
              chainKey,
              nowMs,
              deletedMarkerTtlMs,
              redisOperationTimeoutMs
            );
          }
          continue;
        }

        await this.withCleanupRedisTimeout(
          async () => {
            await redis.del(claim.processingKey);
            await redis.zrem(
              this.getCleanupProcessingSetKey(keyPrefix),
              claim.processingKey
            );
            await this.setCleanupDeletedMarker(
              redis,
              chainKey,
              nowMs,
              deletedMarkerTtlMs,
              redisOperationTimeoutMs
            );
          },
          redisOperationTimeoutMs
        );
        chainsDeleted++;
      }
    } finally {
      if (redisResolution.shouldQuit && redis.quit) {
        await redis.quit();
      }
    }

    return {
      scanned,
      chainsDeleted,
      responsesDeleted,
      chainsRescheduled,
      chainsDeadLettered,
      skippedNotDue,
      failures,
    };
  }

  static createCleanupClient(
    record: StoredResponseCleanupRecord,
    options: StoredResponseCleanupOptions
  ): StoredResponseCleanupClient {
    if (options.clientFactory) {
      return options.clientFactory(record);
    }

    const envCredentialName = record.credentialRef?.startsWith("env:")
      ? record.credentialRef.slice("env:".length)
      : undefined;
    let apiKey: string | undefined;

    if (envCredentialName) {
      apiKey = process.env[envCredentialName];
      if (!apiKey) {
        throw new Error(
          `OpenAI cleanup for credential ${record.credentialRef} requires environment variable ${envCredentialName}.`
        );
      }
      if (options.apiKey && options.apiKey !== apiKey) {
        throw new Error(
          `OpenAI cleanup apiKey does not match credential ${record.credentialRef}.`
        );
      }
    } else if (
      record.credentialRef &&
      this.isApiKeyFingerprintCredentialRef(record.credentialRef)
    ) {
      apiKey =
        options.apiKey ??
        process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY ??
        process.env.OPENAI_API_KEY;
      if (
        !apiKey ||
        this.getApiKeyFingerprintCredentialRef(apiKey) !== record.credentialRef
      ) {
        throw new Error(
          `OpenAI cleanup apiKey does not match credential ${record.credentialRef}.`
        );
      }
    } else if (record.credentialRef) {
      throw new Error(
        `OpenAI cleanup for credential ${record.credentialRef} requires clientFactory.`
      );
    } else {
      apiKey =
        options.apiKey ??
        process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY ??
        process.env.OPENAI_API_KEY;
    }

    if (!apiKey) {
      throw new Error(
        "OpenAI API key required to delete stored Responses. Pass apiKey or set OPENAI_API_KEY."
      );
    }

    const baseURL = this.getAllowedCleanupBaseUrl(record.transportBaseUrl);

    return new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    }) as StoredResponseCleanupClient;
  }

  static getErrorMessage(error: unknown): string {
    if (isRecord(error) && typeof error.message === "string") {
      return error.message;
    }

    return String(error);
  }

  static formatCleanupAuditTime(timeMs: number): string {
    return new Date(timeMs).toISOString();
  }

  private static resetStaleLocalStateIfNeeded({
    hasPreviousResponse,
    resetResponsesState,
    logger,
    nowMs,
  }: {
    hasPreviousResponse: boolean;
    resetResponsesState: () => void;
    logger: OpenAiResponsesCleanupLogger;
    nowMs: number;
  }): void {
    if (!hasPreviousResponse) return;

    resetResponsesState();
    logger.info(
      `OpenAI Responses cleanup reset stale local response state at ${OpenAiResponsesCleanup.formatCleanupAuditTime(
        nowMs
      )}`
    );
  }

  private static getIdentityHashPayload(
    identity: OpenAiResponsesCleanupIdentity
  ): Record<string, unknown> {
    return {
      responsesStateKey: identity.responsesStateKey,
      modelName: identity.modelName,
      credentialRef: identity.credentialRef ?? null,
      transportBaseUrl: identity.transportBaseUrl ?? null,
      regionalProcessing: identity.regionalProcessing ?? null,
    };
  }

  private static getCleanupRedisClient(options: StoredResponseCleanupOptions): {
    redis: StoredResponseCleanupRedisClient;
    shouldQuit: boolean;
  } {
    if (options.redis) {
      return { redis: options.redis, shouldQuit: false };
    }

    if (options.redisUrl) {
      return {
        redis: new Redis(
          options.redisUrl
        ) as unknown as StoredResponseCleanupRedisClient,
        shouldQuit: true,
      };
    }

    return {
      redis:
        this.cleanupRedisClientOverride ??
        (sharedRedisClient as unknown as StoredResponseCleanupRedisClient),
      shouldQuit: false,
    };
  }

  private static getCleanupRedisOperationTimeoutMs(
    timeoutMs?: number
  ): number {
    return typeof timeoutMs === "number" &&
      Number.isFinite(timeoutMs) &&
      timeoutMs > 0
      ? timeoutMs
      : OPENAI_RESPONSES_CLEANUP_REDIS_TIMEOUT_MS;
  }

  private static getCleanupDeletedMarkerTtlMs(ttlMs?: number): number {
    return typeof ttlMs === "number" && Number.isFinite(ttlMs) && ttlMs > 0
      ? ttlMs
      : OPENAI_RESPONSES_CLEANUP_DELETED_MARKER_TTL_MS;
  }

  private static async withCleanupRedisTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        operation(),
        new Promise<T>((_, reject) => {
          timeout = setTimeout(
            () =>
              reject(
                new Error(
                  `Timed out after ${timeoutMs}ms waiting for OpenAI Responses cleanup Redis operation.`
                )
              ),
            timeoutMs
          );
        }),
      ]);
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  private static getCleanupDueSetKey(keyPrefix: string): string {
    return `${keyPrefix}:due`;
  }

  private static getCleanupDeadLetterSetKey(keyPrefix: string): string {
    return `${keyPrefix}:dead`;
  }

  private static getCleanupProcessingSetKey(keyPrefix: string): string {
    return `${keyPrefix}:processing`;
  }

  private static getCleanupDeletedMarkerKey(chainKey: string): string {
    return `${chainKey}:deleted`;
  }

  private static getCleanupProcessingKey(chainKey: string): string {
    return `${chainKey}:processing:${Date.now()}:${randomUUID()}`;
  }

  private static getCleanupChainKeyFromProcessingKey(
    processingKey: string
  ): string | undefined {
    const marker = ":processing:";
    const markerIndex = processingKey.lastIndexOf(marker);
    if (markerIndex <= 0) return undefined;
    return processingKey.slice(0, markerIndex);
  }

  private static getCleanupChainKey(
    keyPrefix: string,
    identity: Record<string, unknown>
  ): string {
    const hash = createHash("sha256")
      .update(JSON.stringify(identity))
      .digest("hex");
    return `${keyPrefix}:chain:${hash}`;
  }

  private static async hasCleanupDeletionMarker(
    redis: StoredResponseCleanupRedisClient,
    chainKey: string,
    redisOperationTimeoutMs: number
  ): Promise<boolean> {
    const marker = await this.withCleanupRedisTimeout(
      () => redis.get(this.getCleanupDeletedMarkerKey(chainKey)),
      redisOperationTimeoutMs
    );
    return marker !== null;
  }

  private static async setCleanupDeletedMarker(
    redis: StoredResponseCleanupRedisClient,
    chainKey: string,
    nowMs: number,
    deletedMarkerTtlMs: number,
    redisOperationTimeoutMs: number
  ): Promise<void> {
    await this.withCleanupRedisTimeout(
      () =>
        redis.set(
          this.getCleanupDeletedMarkerKey(chainKey),
          String(nowMs),
          "PX",
          deletedMarkerTtlMs
        ),
      redisOperationTimeoutMs
    );
  }

  private static getAllowedCleanupBaseUrl(
    transportBaseUrl: string | undefined
  ): string | undefined {
    if (!transportBaseUrl) return undefined;

    let parsed: URL;
    try {
      parsed = new URL(transportBaseUrl);
    } catch {
      throw new Error(
        `OpenAI cleanup transportBaseUrl is not allowed: ${transportBaseUrl}`
      );
    }

    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.port ||
      parsed.search ||
      parsed.hash
    ) {
      throw new Error(
        `OpenAI cleanup transportBaseUrl is not allowed: ${transportBaseUrl}`
      );
    }

    const normalizedPath = parsed.pathname.replace(/\/+$/, "");
    const normalizedBaseUrl = `https://${parsed.hostname.toLowerCase()}${normalizedPath}`;
    if (!OPENAI_ALLOWED_CLEANUP_BASE_URLS.has(normalizedBaseUrl)) {
      throw new Error(
        `OpenAI cleanup transportBaseUrl is not allowed: ${transportBaseUrl}`
      );
    }

    return normalizedBaseUrl;
  }

  private static normalizeCleanupScriptResult(
    result: unknown
  ): StoredResponseCleanupScriptResult {
    if (!Array.isArray(result)) {
      return { status: "invalid" };
    }

    const [rawStatus, rawValue] = result;
    const status = Buffer.isBuffer(rawStatus)
      ? rawStatus.toString("utf8")
      : String(rawStatus);
    const value =
      rawValue === undefined
        ? undefined
        : Buffer.isBuffer(rawValue)
          ? rawValue.toString("utf8")
          : String(rawValue);

    switch (status) {
      case "claimed":
      case "invalid":
      case "missing":
      case "not_due":
      case "queued":
      case "refreshed":
      case "touched":
        return { status, value };
      default:
        return { status: "invalid", value };
    }
  }

  private static async recoverExpiredProcessingRecords(
    redis: StoredResponseCleanupRedisClient,
    keyPrefix: string,
    nowMs: number,
    limit: number,
    redisOperationTimeoutMs: number
  ): Promise<void> {
    const processingSetKey = this.getCleanupProcessingSetKey(keyPrefix);
    const processingKeys = await this.withCleanupRedisTimeout(
      () =>
        redis.zrangebyscore(
          processingSetKey,
          "-inf",
          nowMs,
          "LIMIT",
          0,
          limit
        ),
      redisOperationTimeoutMs
    );

    for (const processingKey of processingKeys) {
      const rawRecord = await this.withCleanupRedisTimeout(
        () => redis.get(processingKey),
        redisOperationTimeoutMs
      );
      if (!rawRecord) {
        await this.withCleanupRedisTimeout(
          () => redis.zrem(processingSetKey, processingKey),
          redisOperationTimeoutMs
        );
        continue;
      }

      const chainKey = this.getCleanupChainKeyFromProcessingKey(processingKey);
      const record = this.parseCleanupRecord(rawRecord);
      if (!chainKey || !record) {
        await this.deadLetterProcessingCleanupRecord(
          redis,
          keyPrefix,
          processingKey,
          rawRecord,
          nowMs,
          redisOperationTimeoutMs
        );
        continue;
      }

      const activeRawRecord = await this.withCleanupRedisTimeout(
        () => redis.get(chainKey),
        redisOperationTimeoutMs
      );
      if (activeRawRecord && !this.parseCleanupRecord(activeRawRecord)) {
        await this.deadLetterInvalidCleanupRecord(
          redis,
          keyPrefix,
          chainKey,
          activeRawRecord,
          nowMs,
          redisOperationTimeoutMs
        );
      }

      const writeResult = await this.mergeStoredResponseCleanupRecord(
        redis,
        keyPrefix,
        chainKey,
        record,
        redisOperationTimeoutMs
      );
      if (writeResult.status === "invalid") {
        await this.deadLetterProcessingCleanupRecord(
          redis,
          keyPrefix,
          processingKey,
          rawRecord,
          nowMs,
          redisOperationTimeoutMs
        );
        continue;
      }

      await this.withCleanupRedisTimeout(
        async () => {
          await redis.del(processingKey);
          await redis.zrem(processingSetKey, processingKey);
        },
        redisOperationTimeoutMs
      );
    }
  }

  private static async claimDueStoredResponseCleanupChain(
    redis: StoredResponseCleanupRedisClient,
    keyPrefix: string,
    chainKey: string,
    nowMs: number,
    processingLeaseMs: number,
    redisOperationTimeoutMs: number
  ): Promise<StoredResponseCleanupClaimResult> {
    const dueSetKey = this.getCleanupDueSetKey(keyPrefix);
    const processingSetKey = this.getCleanupProcessingSetKey(keyPrefix);
    const processingLeaseUntilMs = nowMs + processingLeaseMs;

    if (redis.eval) {
      const processingKey = this.getCleanupProcessingKey(chainKey);
      const rawResult = await this.withCleanupRedisTimeout(
        () =>
          redis.eval!(
            CLAIM_DUE_STORED_RESPONSE_CLEANUP_CHAIN_SCRIPT,
            4,
            chainKey,
            dueSetKey,
            processingKey,
            processingSetKey,
            nowMs,
            processingLeaseUntilMs
          ),
        redisOperationTimeoutMs
      );
      const result = this.normalizeCleanupScriptResult(rawResult);

      if (result.status === "claimed" && result.value) {
        const record = this.parseCleanupRecord(result.value);
        if (record) {
          return { status: "claimed", record, processingKey };
        }
        return { status: "invalid", rawRecord: result.value };
      }

      if (result.status === "invalid") {
        return { status: "invalid", rawRecord: result.value ?? "" };
      }

      if (result.status === "not_due") {
        return { status: "not_due" };
      }

      return { status: "missing" };
    }

    const rawRecord = await this.withCleanupRedisTimeout(
      () => redis.get(chainKey),
      redisOperationTimeoutMs
    );
    if (!rawRecord) {
      await this.withCleanupRedisTimeout(
        () => redis.zrem(dueSetKey, chainKey),
        redisOperationTimeoutMs
      );
      return { status: "missing" };
    }

    const record = this.parseCleanupRecord(rawRecord);
    if (!record) {
      return { status: "invalid", rawRecord };
    }

    if (record.dueAtMs > nowMs) {
      await this.withCleanupRedisTimeout(
        () => redis.zadd(dueSetKey, record.dueAtMs, chainKey),
        redisOperationTimeoutMs
      );
      return { status: "not_due" };
    }

    const processingKey = this.getCleanupProcessingKey(chainKey);
    await this.withCleanupRedisTimeout(
      async () => {
        await redis.set(processingKey, rawRecord);
        await redis.zadd(processingSetKey, processingLeaseUntilMs, processingKey);
        await redis.del(chainKey);
        await redis.zrem(dueSetKey, chainKey);
      },
      redisOperationTimeoutMs
    );
    return { status: "claimed", record, processingKey };
  }

  private static async mergeStoredResponseCleanupRecord(
    redis: StoredResponseCleanupRedisClient,
    keyPrefix: string,
    chainKey: string,
    record: StoredResponseCleanupRecord,
    redisOperationTimeoutMs: number
  ): Promise<StoredResponseCleanupWriteResult> {
    const dueSetKey = this.getCleanupDueSetKey(keyPrefix);

    if (redis.eval) {
      const rawResult = await this.withCleanupRedisTimeout(
        () =>
          redis.eval!(
            MERGE_STORED_RESPONSE_CLEANUP_CHAIN_SCRIPT,
            3,
            chainKey,
            dueSetKey,
            this.getCleanupDeletedMarkerKey(chainKey),
            JSON.stringify(record.responseIds),
            record.lastActivityAtMs,
            record.dueAtMs,
            record.responsesStateKey,
            record.modelName,
            record.credentialRef ?? "",
            record.transportBaseUrl ?? "",
            record.regionalProcessing ?? "",
            record.createdAtMs,
            record.failureCount ?? "",
            record.lastFailureAtMs ?? "",
            record.lastFailureMessage ?? "",
            record.deadLetteredAtMs ?? ""
          ),
        redisOperationTimeoutMs
      );
      const result = this.normalizeCleanupScriptResult(rawResult);
      const responseCount = result.value ? Number(result.value) : 0;
      return {
        status:
          result.status === "refreshed" || result.status === "queued"
            ? result.status
            : "invalid",
        responseCount: Number.isFinite(responseCount) ? responseCount : 0,
      };
    }

    const rawRecord = await this.withCleanupRedisTimeout(
      () => redis.get(chainKey),
      redisOperationTimeoutMs
    );
    const existingRecord = rawRecord
      ? this.parseCleanupRecord(rawRecord)
      : undefined;
    if (rawRecord && !existingRecord) {
      return { status: "invalid", responseCount: 0 };
    }

    const responseIds = existingRecord?.responseIds
      ? [...existingRecord.responseIds]
      : [];
    let status: "queued" | "refreshed" = "queued";
    for (const responseId of record.responseIds) {
      if (responseIds.includes(responseId)) {
        status = "refreshed";
      } else {
        responseIds.push(responseId);
      }
    }

    const dueAtMs =
      existingRecord && existingRecord.dueAtMs > record.dueAtMs
        ? existingRecord.dueAtMs
        : record.dueAtMs;
    const mergedRecord: StoredResponseCleanupRecord = {
      ...record,
      responseIds,
      dueAtMs,
      createdAtMs: existingRecord?.createdAtMs ?? record.createdAtMs,
      failureCount: record.failureCount ?? existingRecord?.failureCount,
      lastFailureAtMs: record.lastFailureAtMs ?? existingRecord?.lastFailureAtMs,
      lastFailureMessage:
        record.lastFailureMessage ?? existingRecord?.lastFailureMessage,
      deadLetteredAtMs: record.deadLetteredAtMs ?? existingRecord?.deadLetteredAtMs,
    };

    await this.withCleanupRedisTimeout(
      async () => {
        await redis.set(chainKey, JSON.stringify(mergedRecord));
        await redis.zadd(dueSetKey, mergedRecord.dueAtMs, chainKey);
        await redis.del(this.getCleanupDeletedMarkerKey(chainKey));
      },
      redisOperationTimeoutMs
    );
    return { status, responseCount: responseIds.length };
  }

  private static async deadLetterInvalidCleanupRecord(
    redis: StoredResponseCleanupRedisClient,
    keyPrefix: string,
    chainKey: string,
    rawRecord: string,
    nowMs: number,
    redisOperationTimeoutMs: number
  ): Promise<void> {
    const dueSetKey = this.getCleanupDueSetKey(keyPrefix);
    const deadLetterSetKey = this.getCleanupDeadLetterSetKey(keyPrefix);
    const deadKey = `${chainKey}:dead:${nowMs}:${randomUUID()}`;
    await this.withCleanupRedisTimeout(
      async () => {
        await redis.zrem(dueSetKey, chainKey);
        await redis.del(chainKey);
        if (rawRecord) {
          await redis.set(deadKey, rawRecord);
        }
        await redis.zadd(deadLetterSetKey, nowMs, deadKey);
      },
      redisOperationTimeoutMs
    );
  }

  private static async deadLetterProcessingCleanupRecord(
    redis: StoredResponseCleanupRedisClient,
    keyPrefix: string,
    processingKey: string,
    rawRecord: string,
    nowMs: number,
    redisOperationTimeoutMs: number
  ): Promise<void> {
    const deadLetterSetKey = this.getCleanupDeadLetterSetKey(keyPrefix);
    const processingSetKey = this.getCleanupProcessingSetKey(keyPrefix);
    const deadKey = `${processingKey}:dead:${nowMs}:${randomUUID()}`;
    await this.withCleanupRedisTimeout(
      async () => {
        await redis.del(processingKey);
        await redis.zrem(processingSetKey, processingKey);
        await redis.set(deadKey, rawRecord);
        await redis.zadd(deadLetterSetKey, nowMs, deadKey);
      },
      redisOperationTimeoutMs
    );
  }

  private static async rescheduleStoredResponseCleanupRecord({
    redis,
    keyPrefix,
    chainKey,
    processingKey,
    record,
    nowMs,
    retryDelayMs,
    maxFailureCount,
    message,
    redisOperationTimeoutMs,
  }: {
    redis: StoredResponseCleanupRedisClient;
    keyPrefix: string;
    chainKey: string;
    processingKey?: string;
    record: StoredResponseCleanupRecord;
    nowMs: number;
    retryDelayMs: number;
    maxFailureCount: number;
    message: string;
    redisOperationTimeoutMs: number;
  }): Promise<StoredResponseCleanupRescheduleResult> {
    const failureCount = (record.failureCount ?? 0) + 1;
    const failedRecord: StoredResponseCleanupRecord = {
      ...record,
      dueAtMs: nowMs + retryDelayMs,
      failureCount,
      lastFailureAtMs: nowMs,
      lastFailureMessage: message,
    };

    if (failureCount >= maxFailureCount) {
      const deadLetterSetKey = this.getCleanupDeadLetterSetKey(keyPrefix);
      const processingSetKey = this.getCleanupProcessingSetKey(keyPrefix);
      const deadRecord: StoredResponseCleanupRecord = {
        ...failedRecord,
        deadLetteredAtMs: nowMs,
      };
      const deadKey =
        processingKey ?? `${chainKey}:dead:${nowMs}:${randomUUID()}`;
      await this.withCleanupRedisTimeout(
        async () => {
          await redis.set(deadKey, JSON.stringify(deadRecord));
          await redis.zadd(deadLetterSetKey, nowMs, deadKey);
          await redis.zrem(this.getCleanupDueSetKey(keyPrefix), chainKey);
          if (!processingKey) {
            await redis.del(chainKey);
          }
          if (processingKey) {
            await redis.zrem(processingSetKey, processingKey);
          }
        },
        redisOperationTimeoutMs
      );
      return "deadLettered";
    }

    const writeResult = await this.mergeStoredResponseCleanupRecord(
      redis,
      keyPrefix,
      chainKey,
      failedRecord,
      redisOperationTimeoutMs
    );
    if (writeResult.status === "invalid") {
      const deadLetterSetKey = this.getCleanupDeadLetterSetKey(keyPrefix);
      const processingSetKey = this.getCleanupProcessingSetKey(keyPrefix);
      const deadKey =
        processingKey ?? `${chainKey}:dead:${nowMs}:${randomUUID()}`;
      const deadRecord: StoredResponseCleanupRecord = {
        ...failedRecord,
        deadLetteredAtMs: nowMs,
      };
      await this.withCleanupRedisTimeout(
        async () => {
          await redis.set(deadKey, JSON.stringify(deadRecord));
          await redis.zadd(deadLetterSetKey, nowMs, deadKey);
          if (processingKey) {
            await redis.zrem(processingSetKey, processingKey);
          }
        },
        redisOperationTimeoutMs
      );
      return "deadLettered";
    }
    if (processingKey) {
      await this.withCleanupRedisTimeout(
        async () => {
          await redis.del(processingKey);
          await redis.zrem(
            this.getCleanupProcessingSetKey(keyPrefix),
            processingKey
          );
        },
        redisOperationTimeoutMs
      );
    }
    return "rescheduled";
  }

  private static getApiKeyFingerprintCredentialRef(
    apiKey: string | undefined
  ): string | undefined {
    if (!apiKey) return undefined;

    return `apiKeySha256:${createHash("sha256")
      .update(apiKey)
      .digest("hex")
      .slice(0, 16)}`;
  }

  private static isApiKeyFingerprintCredentialRef(
    credentialRef: string
  ): boolean {
    return credentialRef.startsWith("apiKeySha256:");
  }

  private static parseCleanupRecord(
    rawRecord: string
  ): StoredResponseCleanupRecord | undefined {
    try {
      const parsed = JSON.parse(rawRecord) as unknown;
      if (!isRecord(parsed)) return undefined;
      if (!Array.isArray(parsed.responseIds)) return undefined;
      const responseIds = parsed.responseIds.filter(
        (value): value is string => typeof value === "string"
      );
      if (!responseIds.length) return undefined;
      if (
        typeof parsed.dueAtMs !== "number" ||
        !Number.isFinite(parsed.dueAtMs)
      ) {
        return undefined;
      }

      const lastActivityAtMs =
        typeof parsed.lastActivityAtMs === "number" &&
        Number.isFinite(parsed.lastActivityAtMs)
          ? parsed.lastActivityAtMs
          : parsed.dueAtMs;
      const createdAtMs =
        typeof parsed.createdAtMs === "number" &&
        Number.isFinite(parsed.createdAtMs)
          ? parsed.createdAtMs
          : lastActivityAtMs;

      return {
        responseIds,
        dueAtMs: parsed.dueAtMs,
        lastActivityAtMs,
        responsesStateKey:
          typeof parsed.responsesStateKey === "string"
            ? parsed.responsesStateKey
            : OPENAI_RESPONSES_CLEANUP_DEFAULT_STATE_KEY,
        modelName:
          typeof parsed.modelName === "string" ? parsed.modelName : "unknown",
        credentialRef:
          typeof parsed.credentialRef === "string"
            ? parsed.credentialRef
            : undefined,
        transportBaseUrl:
          typeof parsed.transportBaseUrl === "string"
            ? parsed.transportBaseUrl
            : undefined,
        regionalProcessing:
          parsed.regionalProcessing === "eu" ? "eu" : undefined,
        createdAtMs,
        failureCount:
          typeof parsed.failureCount === "number" &&
          Number.isFinite(parsed.failureCount)
            ? parsed.failureCount
            : undefined,
        lastFailureAtMs:
          typeof parsed.lastFailureAtMs === "number" &&
          Number.isFinite(parsed.lastFailureAtMs)
            ? parsed.lastFailureAtMs
            : undefined,
        lastFailureMessage:
          typeof parsed.lastFailureMessage === "string"
            ? parsed.lastFailureMessage
            : undefined,
        deadLetteredAtMs:
          typeof parsed.deadLetteredAtMs === "number" &&
          Number.isFinite(parsed.deadLetteredAtMs)
            ? parsed.deadLetteredAtMs
            : undefined,
      };
    } catch {
      return undefined;
    }
  }

  private static isNotFoundError(error: unknown): boolean {
    if (isRecord(error)) {
      const status = error.status ?? error.statusCode;
      if (status === 404) return true;
      if (error.code === "not_found" || error.type === "not_found_error") {
        return true;
      }
    }

    return false;
  }
}
