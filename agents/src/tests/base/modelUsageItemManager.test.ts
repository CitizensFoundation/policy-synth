import assert from "node:assert/strict";
import { after, afterEach, before, describe, it } from "node:test";

import { PsAiModelProvider, PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";

const originalNodeEnv = process.env.NODE_ENV;
const originalDbName = process.env.PSQL_DB_NAME;
const originalDbUser = process.env.PSQL_DB_USER;
const originalDbPass = process.env.PSQL_DB_PASS;
const originalDisableDbInit = process.env.DISABLE_DB_INIT;
const originalDisableDbUsageTracking = process.env.DISABLE_DB_USAGE_TRACKING;
const originalSyncDbForApp = process.env.SYNC_DB_FOR_APP;

let PsModelUsageItemManager: typeof import("../../base/modelUsageItemManager.js")["PsModelUsageItemManager"];
let PsModelUsageItem: typeof import("../../dbModels/modelUsageItem.js")["PsModelUsageItem"];

const restoreEnv = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

const prices: PsBaseModelPriceConfiguration = {
  costInTokensPerMillion: 1,
  costInCachedContextTokensPerMillion: 0.25,
  costOutTokensPerMillion: 2,
  currency: "USD",
};

const baseContext = (): PsModelUsageItemSaveContext & {
  userId: number;
  agentId: number;
} => ({
  userId: 7,
  agentId: 42,
  modelName: "gpt-test",
  modelProvider: PsAiModelProvider.OpenAI,
  prices,
  modelType: PsAiModelType.Text,
  modelSize: PsAiModelSize.Small,
  tokensIn: 10,
  cachedInTokens: 3,
  tokensOut: 5,
  reasoningTokens: 2,
  audioTokens: 1,
  streaming: true,
  modelId: 101,
});

before(async () => {
  process.env.NODE_ENV = "test";
  process.env.PSQL_DB_NAME = "policy_synth_test";
  process.env.PSQL_DB_USER = "policy_synth_test";
  process.env.PSQL_DB_PASS = "policy_synth_test";
  process.env.SYNC_DB_FOR_APP = "false";

  ({ PsModelUsageItemManager } = await import(
    "../../base/modelUsageItemManager.js"
  ));
  ({ PsModelUsageItem } = await import("../../dbModels/modelUsageItem.js"));
});

afterEach(() => {
  restoreEnv("DISABLE_DB_INIT", originalDisableDbInit);
  restoreEnv("DISABLE_DB_USAGE_TRACKING", originalDisableDbUsageTracking);
  restoreEnv("SYNC_DB_FOR_APP", originalSyncDbForApp);
});

after(() => {
  restoreEnv("NODE_ENV", originalNodeEnv);
  restoreEnv("PSQL_DB_NAME", originalDbName);
  restoreEnv("PSQL_DB_USER", originalDbUser);
  restoreEnv("PSQL_DB_PASS", originalDbPass);
});

describe("PsModelUsageItemManager", () => {
  it("skips inserts when tracking is disabled, no usage exists, or no model id is available", async () => {
    const manager = new PsModelUsageItemManager();
    const originalCreate = PsModelUsageItem.create;
    let createCalls = 0;
    PsModelUsageItem.create = (async () => {
      createCalls += 1;
      return {} as Awaited<ReturnType<typeof PsModelUsageItem.create>>;
    }) as typeof PsModelUsageItem.create;

    try {
      process.env.DISABLE_DB_USAGE_TRACKING = "true";
      await manager.saveUsageItem(baseContext());

      delete process.env.DISABLE_DB_USAGE_TRACKING;
      await manager.saveUsageItem({
        ...baseContext(),
        tokensIn: 0,
        cachedInTokens: 0,
        tokensOut: 0,
        reasoningTokens: 0,
        audioTokens: 0,
        usageItemData: undefined,
      });

      await manager.saveUsageItem({
        ...baseContext(),
        modelId: -1,
      });
    } finally {
      PsModelUsageItem.create = originalCreate;
    }

    assert.equal(createCalls, 0);
  });

  it("builds and persists normalized usage item payloads", async () => {
    process.env.SYNC_DB_FOR_APP = "false";
    delete process.env.DISABLE_DB_INIT;
    delete process.env.DISABLE_DB_USAGE_TRACKING;

    const manager = new PsModelUsageItemManager();
    const originalCreate = PsModelUsageItem.create;
    const createdPayloads: unknown[] = [];
    PsModelUsageItem.create = (async (payload: unknown) => {
      createdPayloads.push(payload);
      return {} as Awaited<ReturnType<typeof PsModelUsageItem.create>>;
    }) as typeof PsModelUsageItem.create;

    try {
      await manager.saveUsageItem({
        ...baseContext(),
        connectorId: 12,
        inferenceType: "priority",
        regionalProcessing: "eu",
        usageItemData: {
          apiFamily: "openaiResponses",
          request: {
            safetyIdentifier: "safe-user",
          },
          usageNormalized: {
            tokensIn: 11,
            tokensOut: 6,
            cachedInTokens: 4,
            reasoningTokens: 3,
            audioTokens: 2,
            imageTokens: 1,
            cacheReadInputTokens: 9,
          },
          usageRaw: {
            prompt_tokens: 10,
          },
          providerMetadata: {
            serviceTier: "priority",
          },
        },
      });
    } finally {
      PsModelUsageItem.create = originalCreate;
    }

    assert.equal(createdPayloads.length, 1);
    assert.deepEqual(createdPayloads[0], {
      user_id: 7,
      model_id: 101,
      agent_id: 42,
      connector_id: 12,
      data: {
        version: 1,
        provider: PsAiModelProvider.OpenAI,
        apiFamily: "openaiResponses",
        timestamp: (createdPayloads[0] as { data: { timestamp: string } }).data
          .timestamp,
        model: {
          id: 101,
          name: "gpt-test",
          type: PsAiModelType.Text,
          size: PsAiModelSize.Small,
        },
        actor: {
          userId: 7,
          agentId: 42,
          connectorId: 12,
        },
        request: {
          streaming: true,
          safetyIdentifier: "safe-user",
        },
        pricing: {
          configuredPrices: prices,
          inferenceType: "priority",
          regionalProcessing: "eu",
        },
        usageNormalized: {
          tokensIn: 11,
          tokensOut: 6,
          cachedInTokens: 4,
          reasoningTokens: 3,
          audioTokens: 2,
          imageTokens: 1,
          cacheReadInputTokens: 9,
        },
        providerData: {
          apiFamily: "openaiResponses",
          request: {
            safetyIdentifier: "safe-user",
          },
          usageNormalized: {
            tokensIn: 11,
            tokensOut: 6,
            cachedInTokens: 4,
            reasoningTokens: 3,
            audioTokens: 2,
            imageTokens: 1,
            cacheReadInputTokens: 9,
          },
          usageRaw: {
            prompt_tokens: 10,
          },
          providerMetadata: {
            serviceTier: "priority",
          },
        },
        usageRaw: {
          prompt_tokens: 10,
        },
        providerMetadata: {
          serviceTier: "priority",
        },
      },
    });
    assert.match(
      (createdPayloads[0] as { data: { timestamp: string } }).data.timestamp,
      /^\d{4}-\d{2}-\d{2}T/
    );
  });

  it("skips while DB init is disabled", async () => {
    const manager = new PsModelUsageItemManager();
    const originalCreate = PsModelUsageItem.create;
    let createCalls = 0;
    PsModelUsageItem.create = (async () => {
      createCalls += 1;
      return {} as Awaited<ReturnType<typeof PsModelUsageItem.create>>;
    }) as typeof PsModelUsageItem.create;

    try {
      process.env.DISABLE_DB_INIT = "true";
      await manager.saveUsageItem(baseContext());
    } finally {
      PsModelUsageItem.create = originalCreate;
    }

    assert.equal(createCalls, 0);
  });

  it("persists raw-only usage items with default normalized counts", async () => {
    process.env.SYNC_DB_FOR_APP = "false";
    delete process.env.DISABLE_DB_INIT;
    delete process.env.DISABLE_DB_USAGE_TRACKING;

    const manager = new PsModelUsageItemManager();
    const originalCreate = PsModelUsageItem.create;
    const createdPayloads: unknown[] = [];
    PsModelUsageItem.create = (async (payload: unknown) => {
      createdPayloads.push(payload);
      return {} as Awaited<ReturnType<typeof PsModelUsageItem.create>>;
    }) as typeof PsModelUsageItem.create;

    try {
      await manager.saveUsageItem({
        ...baseContext(),
        tokensIn: 0,
        cachedInTokens: 0,
        tokensOut: 0,
        reasoningTokens: undefined,
        audioTokens: undefined,
        connectorId: undefined,
        streaming: false,
        usageItemData: {
          apiFamily: "anthropic",
          usageRaw: {
            input_tokens: 12,
          },
        },
      });
    } finally {
      PsModelUsageItem.create = originalCreate;
    }

    assert.equal(createdPayloads.length, 1);
    assert.deepEqual(createdPayloads[0], {
      user_id: 7,
      model_id: 101,
      agent_id: 42,
      data: {
        version: 1,
        provider: PsAiModelProvider.OpenAI,
        apiFamily: "anthropic",
        timestamp: (createdPayloads[0] as { data: { timestamp: string } }).data
          .timestamp,
        model: {
          id: 101,
          name: "gpt-test",
          type: PsAiModelType.Text,
          size: PsAiModelSize.Small,
        },
        actor: {
          userId: 7,
          agentId: 42,
          connectorId: undefined,
        },
        request: {
          streaming: false,
        },
        pricing: {
          configuredPrices: prices,
          inferenceType: undefined,
          regionalProcessing: undefined,
        },
        usageNormalized: {
          tokensIn: 0,
          tokensOut: 0,
          cachedInTokens: 0,
          reasoningTokens: undefined,
          audioTokens: undefined,
          imageTokens: undefined,
          cacheReadInputTokens: undefined,
        },
        providerData: {
          apiFamily: "anthropic",
          usageRaw: {
            input_tokens: 12,
          },
        },
        usageRaw: {
          input_tokens: 12,
        },
        providerMetadata: undefined,
      },
    });
  });
});
