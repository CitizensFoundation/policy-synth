import assert from "node:assert/strict";
import { after, afterEach, describe, it } from "node:test";
import { PDFParse } from "pdf-parse";

import { BaseChatModel } from "../../aiModels/baseChatModel.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "../../aiModelTypes.js";
import { PolicySynthAgent, AgentExecutionStoppedError } from "../../base/agent.js";
import { PsConfigManager } from "../../base/agentConfigManager.js";
import { PairwiseRankingAgent } from "../../base/agentPairwiseRanking.js";
import { PsProgressTracker } from "../../base/agentProgressTracker.js";
import { PsRateLimitManager } from "../../base/agentRateLimiter.js";
import {
  PolicySynthSimpleAgentBase,
  simpleAgentRedis,
} from "../../base/simpleAgent.js";
import { SimplePairwiseRankingsAgent } from "../../base/simplePairwiseRanking.js";
import { PolicySynthStandaloneAgent } from "../../base/agentStandalone.js";
import { AgentPhase, PolicySynthAgentTask } from "../../base/agentTask.js";
import { extractTextFromPdfBuffer } from "../../base/pdfText.js";
import sharedRedisClient from "../../base/redisClient.js";
import {
  policySynthEvents,
  TOKEN_USAGE_EVENT,
} from "../../base/events.js";
import type { PsAgent } from "../../dbModels/agent.js";

process.env.DISABLE_DB_INIT = "true";
process.env.DISABLE_AGENT_STATUS = "true";

type RedisLike = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<unknown>;
};

type TestAgentInternals = {
  memorySaveError: Error | null;
  memorySaveTimer: NodeJS.Timeout | null;
};

const originalModelInCost = process.env.PS_MODEL_IN_COST_USD;
const originalModelOutCost = process.env.PS_MODEL_OUT_COST_USD;
const originalEmitUsageEvents = process.env.PS_EMIT_TOKEN_USAGE_EVENTS;
const originalPairwiseRetryCount =
  process.env.PS_MAX_PAIRWISE_RANING_RETRY_COUNT;
const originalPairwisePromptFraction = process.env.PS_PAIRWISE_PROMPT_FRACTION;
const originalLlmRetryCount = process.env.PS_LLM_MAX_LIMITED_RETRY_COUNT;
const originalDisableAgentStatus = process.env.DISABLE_AGENT_STATUS;
const originalAiModelApiKey = process.env.AI_MODEL_API_KEY;
const originalAiModelName = process.env.AI_MODEL_NAME;
const originalAiModelProvider = process.env.AI_MODEL_PROVIDER;
const originalAiModelType = process.env.AI_MODEL_TYPE;
const originalAiModelSize = process.env.AI_MODEL_SIZE;
const originalAiModelReasoningEffort = process.env.AI_MODEL_REASONING_EFFORT;
const originalAiModelMaxThinkingTokens =
  process.env.AI_MODEL_MAX_THINKING_TOKENS;
const originalAiModelMaxTokensOut = process.env.AI_MODEL_MAX_TOKENS_OUT;
const originalAiModelTemperature = process.env.AI_MODEL_TEMPERATURE;
const originalAzureEndpoint = process.env.AZURE_ENDPOINT;
const originalAzureDeploymentName = process.env.AZURE_DEPLOYMENT_NAME;
const originalAzureOpenAiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const originalPsAgentMaxTokensOut = process.env.PS_AGENT_MAX_MODEL_TOKENS_OUT;
const originalPsAgentTemperature = process.env.PS_AGENT_MODEL_TEMPERATURE;
const originalPsRedisMemoryKey = process.env.PS_REDIS_MEMORY_KEY;
const originalPsAiModelProvider = process.env.PS_AI_MODEL_PROVIDER;
const originalPsAiModelName = process.env.PS_AI_MODEL_NAME;
const originalPsAiModelType = process.env.PS_AI_MODEL_TYPE;
const originalPsAiModelSize = process.env.PS_AI_MODEL_SIZE;

const restoreEnv = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

afterEach(() => {
  restoreEnv("PS_MODEL_IN_COST_USD", originalModelInCost);
  restoreEnv("PS_MODEL_OUT_COST_USD", originalModelOutCost);
  restoreEnv("PS_EMIT_TOKEN_USAGE_EVENTS", originalEmitUsageEvents);
  restoreEnv(
    "PS_MAX_PAIRWISE_RANING_RETRY_COUNT",
    originalPairwiseRetryCount
  );
  restoreEnv("PS_PAIRWISE_PROMPT_FRACTION", originalPairwisePromptFraction);
  restoreEnv("PS_LLM_MAX_LIMITED_RETRY_COUNT", originalLlmRetryCount);
  restoreEnv("DISABLE_AGENT_STATUS", originalDisableAgentStatus);
  restoreEnv("AI_MODEL_API_KEY", originalAiModelApiKey);
  restoreEnv("AI_MODEL_NAME", originalAiModelName);
  restoreEnv("AI_MODEL_PROVIDER", originalAiModelProvider);
  restoreEnv("AI_MODEL_TYPE", originalAiModelType);
  restoreEnv("AI_MODEL_SIZE", originalAiModelSize);
  restoreEnv("AI_MODEL_REASONING_EFFORT", originalAiModelReasoningEffort);
  restoreEnv("AI_MODEL_MAX_THINKING_TOKENS", originalAiModelMaxThinkingTokens);
  restoreEnv("AI_MODEL_MAX_TOKENS_OUT", originalAiModelMaxTokensOut);
  restoreEnv("AI_MODEL_TEMPERATURE", originalAiModelTemperature);
  restoreEnv("AZURE_ENDPOINT", originalAzureEndpoint);
  restoreEnv("AZURE_DEPLOYMENT_NAME", originalAzureDeploymentName);
  restoreEnv("AZURE_OPENAI_ENDPOINT", originalAzureOpenAiEndpoint);
  restoreEnv("PS_AGENT_MAX_MODEL_TOKENS_OUT", originalPsAgentMaxTokensOut);
  restoreEnv("PS_AGENT_MODEL_TEMPERATURE", originalPsAgentTemperature);
  restoreEnv("PS_REDIS_MEMORY_KEY", originalPsRedisMemoryKey);
  restoreEnv("PS_AI_MODEL_PROVIDER", originalPsAiModelProvider);
  restoreEnv("PS_AI_MODEL_NAME", originalPsAiModelName);
  restoreEnv("PS_AI_MODEL_TYPE", originalPsAiModelType);
  restoreEnv("PS_AI_MODEL_SIZE", originalPsAiModelSize);
});

after(() => {
  sharedRedisClient.disconnect();
  simpleAgentRedis.disconnect();
});

const createAgentRecord = (overrides: Partial<PsAgent> = {}) =>
  ({
    id: 7,
    user_id: 11,
    redisStatusKey: "agent:status:7",
    redisMemoryKey: "agent:memory:7",
    configuration: {
      answers: [],
      modelUsageEstimates: [
        { modelId: 4, tokenInCount: 1, tokenOutCount: 2, timestamp: 1 },
      ],
      apiUsageEstimates: [{ externalApiId: 5, callCount: 1, timestamp: 1 }],
      maxTokensOut: 2048,
      temperature: 0.25,
    },
    AiModels: [],
    Group: {
      private_access_configuration: [],
    },
    Class: {
      name: "Test Agent",
    },
    ...overrides,
  }) as unknown as PsAgent;

const createMemory = (overrides: Partial<PsAgentMemoryData> = {}) =>
  ({
    agentId: 7,
    structuredAnswersOverrides: [],
    ...overrides,
  }) as PsAgentMemoryData;

const setRedis = (target: { redis: unknown }, redis: RedisLike) => {
  Reflect.set(target, "redis", redis);
};

const immediateTimer = () => {
  const originalSetTimeout = globalThis.setTimeout;
  Reflect.set(
    globalThis,
    "setTimeout",
    ((callback: (...args: unknown[]) => void, ...args: unknown[]) => {
      callback(...args);
      return {} as NodeJS.Timeout;
    }) as typeof setTimeout
  );

  return () => {
    Reflect.set(globalThis, "setTimeout", originalSetTimeout);
  };
};

const scriptedRandom = (values: number[]) => {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => values[index++] ?? 0;

  return () => {
    Math.random = originalRandom;
  };
};

const fakeModel = (
  generate: (
    messages: PsModelMessage[],
    streaming: boolean,
    callback?: Function
  ) => Promise<PsBaseModelReturnParameters | undefined>
) =>
  ({
    generate,
  }) as unknown as BaseChatModel;

class TestPolicyAgent extends PolicySynthAgent {
  public setRedisForTest(redis: RedisLike) {
    setRedis(this, redis);
  }

  public setProgressTrackerForTest(
    tracker:
      | Pick<
          PsProgressTracker,
          "updateProgress" | "updateRangedProgress" | "setCompleted" | "setError"
        >
      | undefined
  ) {
    this.progressTracker = tracker as PsProgressTracker | undefined;
  }

  public setModelManagerForTest(
    manager: Pick<NonNullable<PolicySynthAgent["modelManager"]>, "callModel" | "getTokensFromMessages"> | undefined
  ) {
    this.modelManager =
      manager as NonNullable<PolicySynthAgent["modelManager"]> | undefined;
  }
}

class SaveFailingAgent extends TestPolicyAgent {
  override async saveMemory() {
    throw new Error("save failed");
  }
}

class TestAgentTask extends PolicySynthAgentTask {
  private readonly scriptedResults: unknown[];

  constructor(scriptedResults: unknown[]) {
    super(createAgentRecord(), createMemory(), `test-task-${Date.now()}`);
    this.scriptedResults = scriptedResults;
  }

  protected policy(): readonly string[] {
    return ["allowedTool"];
  }

  override async callModel(): Promise<unknown> {
    return this.scriptedResults.shift();
  }

  public getPhaseForTest() {
    return Reflect.get(this, "phase") as AgentPhase;
  }

  public getMessagesForTest() {
    return Reflect.get(this, "messages") as PsModelMessage[];
  }

  public getFsForTest() {
    return Reflect.get(this, "fs") as {
      mktemp: (
        bucket: "scratch" | "memory" | "artifacts" | "logs",
        prefix?: string,
        ext?: string
      ) => string;
      writeText: (
        bucket: "scratch" | "memory" | "artifacts" | "logs",
        rel: string,
        data: string
      ) => Promise<string>;
      readText: (
        bucket: "scratch" | "memory" | "artifacts" | "logs",
        rel: string
      ) => Promise<string>;
      writeJSON: (
        bucket: "scratch" | "memory" | "artifacts" | "logs",
        rel: string,
        value: unknown
      ) => Promise<string>;
      readJSON: (
        bucket: "scratch" | "memory" | "artifacts" | "logs",
        rel: string
      ) => Promise<unknown>;
      list: (
        bucket: "scratch" | "memory" | "artifacts" | "logs",
        rel?: string
      ) => Promise<Array<{ name: string }>>;
    };
  }

  public isDoneForTest() {
    return this.isDone();
  }

  public async callToolStepForTest(toolCalls: ToolCall[]) {
    Reflect.set(this, "pendingOutputItems", []);
    Reflect.set(this, "pendingToolCalls", toolCalls);
    await this.callToolStep();
  }
}

class ExposedSimpleAgent extends PolicySynthSimpleAgentBase {
  public tokenCountForMessages(messages: PsModelMessage[]) {
    return this.getNumTokensFromMessages(messages);
  }

  public tokenCountForText(text: string) {
    return this.getNumTokensFromText(text);
  }

  public clearTokenizerForTest() {
    Reflect.set(this, "tokenizer", null);
  }

  override async saveMemory() {
    if (this.memory) {
      this.memory.lastSavedAt = 12345;
    }
  }
}

class TestSimplePairwiseAgent extends SimplePairwiseRankingsAgent {
  public votes: PsPairWiseVoteResults[] = [];
  public llmResponses: string[] = [];

  override async saveMemory() {
    return;
  }

  async voteOnPromptPair(
    subProblemIndex: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    return (
      this.votes.shift() ?? {
        subProblemIndex,
        wonItemIndex: promptPair[0],
        lostItemIndex: promptPair[1],
      }
    );
  }

  override async callLLM(): Promise<string> {
    const response = this.llmResponses.shift() ?? "Neither";
    if (response === "THROW") {
      throw new Error("pairwise llm failed");
    }
    return response;
  }
}

class TestPairwiseAgent extends PairwiseRankingAgent {
  public votes: PsPairWiseVoteResults[] = [];
  public modelResponses: string[] = [];
  public rangedProgressUpdates: Array<{
    progress: number | undefined;
    message: string;
  }> = [];

  async voteOnPromptPair(
    subProblemIndex: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    return (
      this.votes.shift() ?? {
        subProblemIndex,
        wonItemIndex: promptPair[0],
        lostItemIndex: promptPair[1],
      }
    );
  }

  override async callModel(): Promise<string> {
    const response = this.modelResponses.shift() ?? "neither";
    if (response === "THROW") {
      throw new Error("pairwise model failed");
    }
    if (response === "PROHIBITED") {
      throw new Error("Prohibited content");
    }
    return response;
  }

  override async scheduleMemorySave() {
    return;
  }

  override checkLastMemorySaveError() {
    return;
  }

  override async checkProgressForPauseOrStop() {
    return;
  }

  override async updateRangedProgress(
    progress: number | undefined,
    message: string
  ) {
    this.rangedProgressUpdates.push({ progress, message });
  }
}

describe("base infrastructure modules", () => {
  it("resolves new and legacy configuration values", () => {
    const configuration = {
      enabled: "true",
      disabled: "false",
      count: "42",
      ratio: "1.5",
      json: "{\"nested\":true}",
      direct: ["a", "b"],
      blank: "   ",
      answers: [
        { uniqueId: "oldNumber", value: "12" },
        { uniqueId: "oldBoolean", value: "true" },
        { uniqueId: "oldArray", value: "[\"x\",\"y\"]" },
        { uniqueId: "oldString", value: "value" },
      ],
      modelUsageEstimates: [
        { modelId: 2, tokenInCount: 1, tokenOutCount: 2, timestamp: 1 },
      ],
      apiUsageEstimates: [{ externalApiId: 3, callCount: 3, timestamp: 1 }],
      maxTokensOut: 999,
      temperature: 0.4,
    } as unknown as PsBaseNodeConfiguration;
    const memory = createMemory({
      structuredAnswersOverrides: [
        { uniqueId: "count", value: 7 },
        { uniqueId: "overrideString", value: "from-memory" },
      ],
    });
    const manager = new PsConfigManager(configuration, memory);

    assert.equal(manager.getValueFromOverride("count"), 7);
    assert.equal(manager.getConfig("enabled", false), true);
    assert.equal(manager.getConfig("disabled", true), false);
    assert.equal(manager.getConfig("count", 0), 7);
    assert.equal(manager.getConfig("ratio", 0), 1.5);
    assert.deepEqual(manager.getConfig("json", {}), { nested: true });
    assert.deepEqual(manager.getConfig("direct", []), ["a", "b"]);
    assert.equal(manager.getConfig("blank", "fallback"), "fallback");
    assert.equal(manager.getConfig("missing", "fallback"), "fallback");
    assert.equal(manager.getConfig("overrideString", ""), "from-memory");
    assert.equal(manager.getConfigOld("oldNumber", 0), 12);
    assert.equal(manager.getConfigOld("oldBoolean", false), true);
    assert.deepEqual(manager.getConfigOld("oldArray", []), ["x", "y"]);
    assert.equal(manager.getConfigOld("oldString", ""), "value");
    assert.equal(manager.getConfigOld("missingOld", "fallback"), "fallback");
    manager.setConfig("newValue", "saved");
    assert.equal(Reflect.get(manager.getAllConfig(), "newValue"), "saved");
    assert.equal(manager.getModelUsageEstimates()?.[0].modelId, 2);
    assert.equal(manager.getApiUsageEstimates()?.[0].externalApiId, 3);
    assert.equal(manager.getMaxTokensOut(), 999);
    assert.equal(manager.getTemperature(), 0.4);
    assert.ok(manager.getAnswers());
  });

  it("loads and saves progress tracker state through Redis", async () => {
    const values = new Map<string, string>();
    values.set(
      "status-key",
      JSON.stringify({
        state: "running",
        progress: 10,
        messages: ["started"],
        lastUpdated: 1,
      } satisfies PsAgentStatus)
    );
    const redis: RedisLike = {
      get: async (key) => values.get(key) ?? null,
      set: async (key, value) => {
        values.set(key, value);
        return "OK";
      },
    };
    const tracker = new PsProgressTracker("status-key", 20, 80);
    setRedis(tracker, redis);

    await tracker.updateRangedProgress(50, "half");
    assert.equal(tracker.getProgress(), 50);
    assert.deepEqual(tracker.getMessages(), ["started", "half"]);
    assert.equal(tracker.getState(), "running");

    await tracker.updateRangedProgress(200, "clamped");
    assert.equal(tracker.getProgress(), 80);
    await tracker.updateRangedProgress(undefined, "message-only");
    assert.equal(tracker.getProgress(), 80);
    await tracker.updateProgress(33, "absolute");
    assert.equal(tracker.getProgress(), 33);
    await tracker.updateProgress(undefined, "absolute-message-only");
    assert.equal(tracker.getProgress(), 33);
    await tracker.setCompleted("done");
    assert.equal(tracker.getState(), "completed");
    assert.equal(tracker.getProgress(), 100);
    await tracker.setError("failed after completion");
    assert.equal(tracker.getState(), "error");

    const errorTracker = new PsProgressTracker("error-key", 0, 100);
    setRedis(errorTracker, redis);
    await errorTracker.setError("failed");
    assert.equal(errorTracker.getState(), "error");
    assert.deepEqual(errorTracker.getMessages(), ["failed"]);
    assert.equal(errorTracker.formatNumber(1234.567, 1), "1,234.6");
  });

  it("handles progress tracker missing status, missing key, and Redis failures", async () => {
    const failingRedis: RedisLike = {
      get: async () => {
        throw new Error("get failed");
      },
      set: async () => {
        throw new Error("set failed");
      },
    };
    const tracker = new PsProgressTracker("missing-key", 0, 100);
    setRedis(tracker, {
      get: async () => null,
      set: async () => "OK",
    });

    await tracker.loadStatusFromRedis();
    await tracker.updateRangedProgress(10, "ignored");
    await tracker.updateProgress(10, "ignored");
    await tracker.setCompleted("ignored");
    assert.equal(tracker.getProgress(), 0);
    assert.deepEqual(tracker.getMessages(), []);
    assert.equal(tracker.getState(), "unknown");

    setRedis(tracker, failingRedis);
    await tracker.loadStatusFromRedis();
    await tracker.setError("saved with failing redis");

    const noKeyTracker = new PsProgressTracker("", 0, 100);
    setRedis(noKeyTracker, failingRedis);
    await noKeyTracker.loadStatusFromRedis();
    await noKeyTracker.saveRedisStatus();

    const noMessagesTracker = new PsProgressTracker("no-messages", 10, 20);
    setRedis(noMessagesTracker, {
      get: async () =>
        JSON.stringify({
          state: "running",
          progress: 12,
          lastUpdated: 1,
        }),
      set: async (_key, value) => {
        const saved = JSON.parse(value) as PsAgentStatus;
        assert.equal(saved.progress, 15);
        assert.equal(saved.messages, undefined);
        return "OK";
      },
    });
    await noMessagesTracker.updateRangedProgress(50, "not appended");
  });

  it("slides and waits on model rate limits", async () => {
    const manager = new PsRateLimitManager();
    const model = {
      name: "rate-model",
      limitRPM: 1,
      limitTPM: 10,
    };

    await manager.updateRateLimits(model, 6);
    assert.equal(manager.rateLimits["rate-model"].requests.length, 1);
    assert.equal(manager.rateLimits["rate-model"].tokens[0].count, 6);

    const restoreTimer = immediateTimer();
    try {
      await manager.checkRateLimits(model, 10);
    } finally {
      restoreTimer();
    }

    manager.rateLimits["rate-model"].requests = [
      { timestamp: Date.now() - 61_000 },
      { timestamp: Date.now() },
    ];
    manager.rateLimits["rate-model"].tokens = [
      { timestamp: Date.now() - 61_000, count: 4 },
      { timestamp: Date.now(), count: 2 },
    ];
    manager.slideWindowForRequests(model);
    manager.slideWindowForTokens(model);
    assert.equal(manager.rateLimits["rate-model"].requests.length, 1);
    assert.equal(manager.rateLimits["rate-model"].tokens.length, 1);
  });

  it("delegates core agent behavior to trackers, models, Redis, and config", async () => {
    const agent = new TestPolicyAgent(createAgentRecord(), createMemory(), 0, 100);
    const progressCalls: string[] = [];
    agent.setProgressTrackerForTest({
      updateProgress: async (_progress, message) => {
        progressCalls.push(message);
      },
      updateRangedProgress: async (_progress, message) => {
        progressCalls.push(message);
      },
      setCompleted: async (message) => {
        progressCalls.push(message);
      },
      setError: async (message) => {
        progressCalls.push(message);
      },
    });
    agent.setModelManagerForTest({
      callModel: async () => "model-result",
      getTokensFromMessages: async () => 123,
    });
    const writes: string[] = [];
    agent.setRedisForTest({
      get: async (key) => {
        if (key === "agent:memory:7") {
          return JSON.stringify({ agentId: 7, loaded: true });
        }
        return JSON.stringify({
          state: "running",
          progress: 1,
          messages: [],
          lastUpdated: 1,
        } satisfies PsAgentStatus);
      },
      set: async (_key, value) => {
        writes.push(value);
        return "OK";
      },
    });

    await agent.process();
    assert.deepEqual(progressCalls, ["Agent Test Agent Starting"]);
    assert.equal(
      await agent.callModel(PsAiModelType.Text, PsAiModelSize.Small, []),
      "model-result"
    );
    assert.equal(await agent.getTokensFromMessages([]), 123);
    agent.setModelManagerForTest(undefined);
    assert.equal(await agent.getTokensFromMessages([]), 0);
    assert.equal(agent.getConfig("missing", "fallback"), "fallback");
    assert.equal(agent.getConfigOld("missingOld", "fallback"), "fallback");
    assert.equal(agent.getMaxTokensOut(), 2048);
    assert.equal(agent.getTemperature(), 0.25);
    assert.equal(agent.getModelUsageEstimates()?.[0].modelId, 4);
    assert.equal(agent.getApiUsageEstimates()?.[0].externalApiId, 5);

    await agent.loadAgentMemoryFromRedis();
    assert.equal((agent.memory as PsAgentMemoryData & { loaded: boolean }).loaded, true);
    await agent.saveMemory();
    assert.equal(writes.length, 1);
    await agent.updateRangedProgress(10, "range");
    await agent.updateProgress(20, "absolute");
    await agent.setCompleted("complete");
    await agent.setError("error");
    assert.deepEqual(progressCalls.slice(1), ["range", "absolute", "complete", "error"]);
  });

  it("handles core agent stop, pause, and memory-save edge cases", async () => {
    delete process.env.PS_AGENT_MAX_MODEL_TOKENS_OUT;
    delete process.env.PS_AGENT_MODEL_TEMPERATURE;
    delete process.env.PS_REDIS_MEMORY_KEY;
    delete process.env.PS_AI_MODEL_PROVIDER;
    delete process.env.PS_AI_MODEL_NAME;
    delete process.env.PS_AI_MODEL_TYPE;
    delete process.env.PS_AI_MODEL_SIZE;
    assert.throws(
      () =>
        new TestPolicyAgent(
          undefined as unknown as PsAgent,
          createMemory(),
          0,
          100
        ),
      /Agent not found/
    );

    process.env.PS_AGENT_MAX_MODEL_TOKENS_OUT = "1000";
    process.env.PS_AGENT_MODEL_TEMPERATURE = "0.2";
    process.env.PS_REDIS_MEMORY_KEY = "memory";
    process.env.PS_AI_MODEL_PROVIDER = "openai";
    process.env.PS_AI_MODEL_NAME = "gpt-test";
    process.env.PS_AI_MODEL_TYPE = PsAiModelType.Text;
    process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
    const envOnlyAgent = new TestPolicyAgent(
      undefined as unknown as PsAgent,
      createMemory(),
      0,
      100
    );
    assert.ok(envOnlyAgent.progressTracker);

    delete process.env.DISABLE_AGENT_STATUS;
    const missingStatusKeyAgent = new TestPolicyAgent(
      createAgentRecord({ redisStatusKey: "" }),
      createMemory(),
      0,
      100
    );
    assert.ok(missingStatusKeyAgent.progressTracker);

    const noMemoryAgent = new TestPolicyAgent(createAgentRecord(), createMemory(), 0, 100);
    Reflect.set(noMemoryAgent, "memory", undefined);
    await assert.rejects(() => noMemoryAgent.process(), /Memory is not initialized/);

    Reflect.set(noMemoryAgent, "agent", undefined);
    assert.deepEqual(await noMemoryAgent.loadAgentMemoryFromRedis(), {});

    const constructedMemoryLoads: number[] = [];
    class LoadMemoryOnConstructAgent extends TestPolicyAgent {
      override async loadAgentMemoryFromRedis(): Promise<PsAgentMemoryData> {
        constructedMemoryLoads.push(this.agent.id);
        this.memory = { agentId: this.agent.id };
        return this.memory;
      }
    }
    new LoadMemoryOnConstructAgent(createAgentRecord(), undefined, 0, 100);
    assert.deepEqual(constructedMemoryLoads, [7]);

    const emptyMemoryAgent = new TestPolicyAgent(createAgentRecord(), createMemory(), 0, 100);
    emptyMemoryAgent.setRedisForTest({
      get: async () => null,
      set: async () => "OK",
    });
    await emptyMemoryAgent.loadAgentMemoryFromRedis();
    assert.equal(emptyMemoryAgent.memory.agentId, 7);
    assert.equal(await emptyMemoryAgent.loadStatusFromRedis(), undefined);
    await emptyMemoryAgent.checkProgressForPauseOrStop();
    emptyMemoryAgent.setRedisForTest({
      get: async () => {
        throw new Error("status failed");
      },
      set: async () => "OK",
    });
    assert.equal(await emptyMemoryAgent.loadStatusFromRedis(), undefined);

    const stoppedAgent = new TestPolicyAgent(createAgentRecord(), createMemory(), 0, 100);
    stoppedAgent.setRedisForTest({
      get: async () =>
        JSON.stringify({
          state: "stopped",
          progress: 0,
          messages: [],
          lastUpdated: 1,
        } satisfies PsAgentStatus),
      set: async () => "OK",
    });
    await assert.rejects(
      () => stoppedAgent.checkProgressForPauseOrStop(),
      AgentExecutionStoppedError
    );

    const pausedAgent = new TestPolicyAgent(createAgentRecord(), createMemory(), 0, 100);
    const states: PsAgentStatus[] = [
      { state: "paused", progress: 0, messages: [], lastUpdated: 1 },
      { state: "running", progress: 0, messages: [], lastUpdated: 2 },
    ];
    pausedAgent.pauseCheckInterval = 1;
    pausedAgent.pauseTimeout = 1_000;
    pausedAgent.setRedisForTest({
      get: async () => JSON.stringify(states.shift()),
      set: async () => "OK",
    });
    const restoreTimer = immediateTimer();
    try {
      await pausedAgent.checkProgressForPauseOrStop();
    } finally {
      restoreTimer();
    }

    const stoppedWhilePausedAgent = new TestPolicyAgent(
      createAgentRecord(),
      createMemory(),
      0,
      100
    );
    const pausedThenStopped: PsAgentStatus[] = [
      { state: "paused", progress: 0, messages: [], lastUpdated: 1 },
      { state: "stopped", progress: 0, messages: [], lastUpdated: 2 },
    ];
    stoppedWhilePausedAgent.pauseCheckInterval = 1;
    stoppedWhilePausedAgent.setRedisForTest({
      get: async () => JSON.stringify(pausedThenStopped.shift()),
      set: async () => "OK",
    });
    const restoreStoppedTimer = immediateTimer();
    try {
      await assert.rejects(
        () => stoppedWhilePausedAgent.checkProgressForPauseOrStop(),
        /stopped while paused/
      );
    } finally {
      restoreStoppedTimer();
    }

    const timedOutPausedAgent = new TestPolicyAgent(
      createAgentRecord(),
      createMemory(),
      0,
      100
    );
    const stillPaused: PsAgentStatus[] = [
      { state: "paused", progress: 0, messages: [], lastUpdated: 1 },
      { state: "paused", progress: 0, messages: [], lastUpdated: 2 },
    ];
    timedOutPausedAgent.pauseCheckInterval = 1;
    timedOutPausedAgent.pauseTimeout = 10;
    timedOutPausedAgent.setRedisForTest({
      get: async () => JSON.stringify(stillPaused.shift()),
      set: async () => "OK",
    });
    const originalNow = Date.now;
    const nowValues = [0, 20];
    Date.now = () => nowValues.shift() ?? 20;
    const restoreTimeoutTimer = immediateTimer();
    try {
      await assert.rejects(
        () => timedOutPausedAgent.checkProgressForPauseOrStop(),
        /timed out while paused/
      );
    } finally {
      restoreTimeoutTimer();
      Date.now = originalNow;
    }

    const missingMemoryKeyAgent = new TestPolicyAgent(
      createAgentRecord({ redisMemoryKey: "" }),
      createMemory(),
      0,
      100
    );
    await assert.rejects(
      () => missingMemoryKeyAgent.loadAgentMemoryFromRedis(),
      /Agent memory key not set/
    );

    const noProgressAgent = new TestPolicyAgent(createAgentRecord(), createMemory(), 0, 100);
    noProgressAgent.setProgressTrackerForTest(undefined);
    await noProgressAgent.updateRangedProgress(1, "not tracked");

    const saveFailureAgent = new TestPolicyAgent(createAgentRecord(), createMemory(), 0, 100);
    saveFailureAgent.setRedisForTest({
      get: async () => null,
      set: async () => {
        throw new Error("redis write failed");
      },
    });
    await saveFailureAgent.saveMemory();

    class StopOnSaveAgent extends TestPolicyAgent {
      override async checkProgressForPauseOrStop() {
        throw new AgentExecutionStoppedError("stop during save");
      }
    }
    const stopOnSaveAgent = new StopOnSaveAgent(
      createAgentRecord(),
      createMemory(),
      0,
      100
    );
    stopOnSaveAgent.setRedisForTest({
      get: async () => null,
      set: async () => "OK",
    });
    await assert.rejects(() => stopOnSaveAgent.saveMemory(), /stop during save/);

    class SuccessfulSaveAgent extends TestPolicyAgent {
      public saves = 0;

      override async saveMemory() {
        this.saves += 1;
      }
    }
    const successfulSaveAgent = new SuccessfulSaveAgent(
      createAgentRecord(),
      createMemory(),
      0,
      100
    );
    const restoreSuccessfulSaveTimer = immediateTimer();
    try {
      await successfulSaveAgent.scheduleMemorySave();
    } finally {
      restoreSuccessfulSaveTimer();
    }
    assert.equal(successfulSaveAgent.saves, 1);

    const failingAgent = new SaveFailingAgent(createAgentRecord(), createMemory(), 0, 100);
    const restoreSaveTimer = immediateTimer();
    try {
      await failingAgent.scheduleMemorySave();
    } finally {
      restoreSaveTimer();
    }
    assert.throws(() => failingAgent.checkLastMemorySaveError(), /save failed/);
    const internals = failingAgent as unknown as TestAgentInternals;
    assert.equal(internals.memorySaveError, null);
    assert.equal(internals.memorySaveTimer, null);

    class StringFailingAgent extends TestPolicyAgent {
      override async saveMemory() {
        throw "string save failed";
      }
    }
    const stringFailingAgent = new StringFailingAgent(
      createAgentRecord(),
      createMemory(),
      0,
      100
    );
    const restoreStringSaveTimer = immediateTimer();
    try {
      await stringFailingAgent.scheduleMemorySave();
    } finally {
      restoreStringSaveTimer();
    }
    assert.throws(
      () => stringFailingAgent.checkLastMemorySaveError(),
      /string save failed/
    );
  });

  it("runs agent task assistant and tool-call loops", async () => {
    const task = new TestAgentTask([
      {
        content: "calling",
        phase: "commentary",
        assistantMessages: [
          { content: "thinking", phase: "commentary" },
          { content: "ready", phase: undefined },
        ],
        toolCalls: [
          {
            id: "tool-1",
            name: "allowedTool",
            arguments: { value: 1 },
          },
          {
            id: "tool-2",
            name: "blockedTool",
            arguments: { value: 2 },
          },
        ],
        orderedOutputItems: [
          {
            type: "assistant_message",
            message: { content: "thinking", phase: "commentary" },
          },
          {
            type: "tool_call",
            toolCall: {
              id: "tool-1",
              name: "allowedTool",
              arguments: { value: 1 },
            },
          },
          {
            type: "tool_call",
            toolCall: {
              id: "tool-2",
              name: "blockedTool",
              arguments: { value: 2 },
            },
          },
        ],
      },
      "final answer",
    ]);

    const yielded: PsModelMessage[] = [];
    for await (const message of task.run("hello", " system ")) {
      yielded.push(message);
    }

    assert.equal(task.getPhaseForTest(), AgentPhase.FINISH);
    assert.equal(yielded.some((message) => message.role === "tool"), true);
    assert.equal(
      yielded.some(
        (message) =>
          message.role === "tool" &&
          message.message.includes("is not allowed by policy")
      ),
      true
    );
    assert.equal(yielded.at(-1)?.message, "final answer");

    const textOnlyTask = new TestAgentTask([
      {
        content: "",
        phase: "commentary",
        assistantMessages: [{ content: "visible", phase: "analysis" }],
      },
    ]);
    const textOnlyYielded: PsModelMessage[] = [];
    for await (const message of textOnlyTask.run("hello", "system")) {
      textOnlyYielded.push(message);
    }
    assert.equal(textOnlyYielded.at(-1)?.message, "visible");
  });

  it("uses agent task filesystem helpers and direct tool-call fallback", async () => {
    const task = new TestAgentTask([]);
    const taskFs = task.getFsForTest();

    const tempPath = taskFs.mktemp("scratch", "prefix", ".json");
    assert.match(tempPath, /prefix-\d+-[a-f0-9]+\.json$/);

    await taskFs.writeText("scratch", "notes/a.txt", "hello");
    assert.equal(await taskFs.readText("scratch", "notes/a.txt"), "hello");
    await taskFs.writeJSON("memory", "state.json", { ok: true });
    assert.deepEqual(await taskFs.readJSON("memory", "state.json"), {
      ok: true,
    });
    const entries = await taskFs.list("scratch", "notes");
    assert.deepEqual(entries.map((entry) => entry.name), ["a.txt"]);

    assert.equal(task.isDoneForTest(), false);
    task.getMessagesForTest().push(
      { role: "assistant", message: "thinking", phase: "commentary" },
      { role: "assistant", message: "done" }
    );
    assert.equal(task.isDoneForTest(), true);

    const directToolTask = new TestAgentTask([]);
    await directToolTask.callToolStepForTest([
      {
        id: "direct-tool",
        name: "allowedTool",
        arguments: { direct: true },
      },
    ]);
    assert.equal(
      directToolTask
        .getMessagesForTest()
        .some((message) => message.role === "tool"),
      true
    );

    const fallbackPlanTask = new TestAgentTask([
      {
        content: "",
        assistantMessages: [{ content: "comment", phase: "commentary" }],
        toolCalls: [
          {
            id: "fallback-tool",
            name: "allowedTool",
            arguments: { fallback: true },
          },
        ],
      },
      "done",
    ]);
    const fallbackMessages: PsModelMessage[] = [];
    for await (const message of fallbackPlanTask.run("hello", "system")) {
      fallbackMessages.push(message);
    }
    assert.equal(
      fallbackMessages.some((message) => message.role === "tool"),
      true
    );
  });

  it("uses standalone agents without DB-backed token persistence", async () => {
    const standalone = new PolicySynthStandaloneAgent({ initial: true });
    let delegated = false;
    Reflect.set(standalone.modelManager, "callModel", async () => {
      delegated = true;
      return "standalone-result";
    });

    await standalone.process();
    assert.equal(
      await standalone.callModel(PsAiModelType.Text, PsAiModelSize.Small, []),
      "standalone-result"
    );
    assert.equal(delegated, true);

    process.env.PS_EMIT_TOKEN_USAGE_EVENTS = "true";
    const events: PsTokenUsageEvent[] = [];
    const listener = (event: PsTokenUsageEvent) => events.push(event);
    policySynthEvents.on(TOKEN_USAGE_EVENT, listener);
    try {
      await standalone.modelManager.saveTokenUsage(
        "model",
        "provider",
        {} as PsBaseModelPriceConfiguration,
        PsAiModelType.Text,
        PsAiModelSize.Small,
        1,
        2,
        3
      );
      await standalone.modelManager.saveTokenUsageItem({
        modelName: "model",
        modelProvider: "provider",
        modelType: PsAiModelType.Text,
        modelSize: PsAiModelSize.Small,
        tokensIn: 1,
        cachedInTokens: 2,
        tokensOut: 3,
        modelId: -1,
        prices: {} as PsBaseModelPriceConfiguration,
        streaming: false,
      });
    } finally {
      policySynthEvents.off(TOKEN_USAGE_EVENT, listener);
    }
    assert.equal(events.length, 1);
    assert.equal(events[0].agentId, -1);
  });

  it("counts tokens, records costs, and parses simple LLM responses", async () => {
    process.env.PS_MODEL_IN_COST_USD = "0.01";
    process.env.PS_MODEL_OUT_COST_USD = "0.02";
    const memory = {
      groupId: 22,
      stages: {},
      totalCost: 0,
    } as PsSimpleAgentMemoryData;
    const agent = new ExposedSimpleAgent(memory);
    agent.models.set(PsAiModelType.Text, {
      generate: async () => ({
        tokensIn: 10,
        tokensOut: 5,
        content: "{\"ok\":true}",
      }),
    } as unknown as BaseChatModel);

    assert.ok(
      agent.tokenCountForMessages([{ role: "user", message: "hello" }]) > 0
    );
    assert.ok(agent.tokenCountForText("hello world") > 0);
    assert.equal(agent.redisKey, "ps-simple-agent-memory-for-group-id-22");
    assert.deepEqual(
      await agent.callLLM("stage", [{ role: "user", message: "hello" }]),
      { ok: true }
    );
    assert.equal(memory.stages?.stage.tokensIn, 10);
    assert.equal(memory.stages?.stage.tokensOut, 5);
    assert.equal(memory.totalCost, 0.2);
    assert.equal(memory.lastSavedAt, 12345);

    const textAgent = new ExposedSimpleAgent({ groupId: 23 } as PsSimpleAgentMemoryData);
    textAgent.models.set(PsAiModelType.Text, {
      generate: async () => ({
        tokensIn: 1,
        tokensOut: 1,
        content: " plain text ",
      }),
    } as unknown as BaseChatModel);
    assert.equal(
      await textAgent.callLLM("stage", [{ role: "user", message: "hello" }], false),
      "plain text"
    );

    const noModelAgent = new ExposedSimpleAgent({ groupId: 24 } as PsSimpleAgentMemoryData);
    await assert.rejects(
      () => noModelAgent.callLLM("stage", [], false),
      /No model available/
    );
  });

  it("covers simple agent model setup, retries, fallback counts, and save branches", async () => {
    process.env.AI_MODEL_API_KEY = "test-key";
    process.env.AI_MODEL_NAME = "test-model";
    process.env.AI_MODEL_TYPE = PsAiModelType.Text;
    process.env.AI_MODEL_SIZE = PsAiModelSize.Small;
    process.env.AI_MODEL_REASONING_EFFORT = "high";
    process.env.AI_MODEL_MAX_THINKING_TOKENS = "123";
    process.env.AI_MODEL_MAX_TOKENS_OUT = "456";
    process.env.AI_MODEL_TEMPERATURE = "0.15";
    process.env.AZURE_ENDPOINT = "https://azure.example.test";
    process.env.AZURE_DEPLOYMENT_NAME = "deployment";
    process.env.AZURE_OPENAI_ENDPOINT = "https://azure.example.test";

    const providerAgent = new ExposedSimpleAgent({
      groupId: 50,
    } as PsSimpleAgentMemoryData);
    for (const provider of ["anthropic", "openai", "google", "azure"]) {
      process.env.AI_MODEL_PROVIDER = provider;
      providerAgent.models.clear();
      providerAgent.initializeModels();
      assert.equal(providerAgent.models.has(PsAiModelType.Text), true);
    }
    process.env.AI_MODEL_PROVIDER = "unsupported";
    assert.throws(
      () => providerAgent.initializeModels(),
      /Unsupported model provider/
    );
    process.env.AI_MODEL_PROVIDER = "openai";

    const badTokenizerAgent = new ExposedSimpleAgent({
      groupId: 51,
    } as PsSimpleAgentMemoryData);
    process.env.AI_MODEL_NAME = "not-a-tiktoken-model";
    badTokenizerAgent.clearTokenizerForTest();
    assert.ok(
      badTokenizerAgent.tokenCountForMessages([
        { role: "user", message: "fallback tokens" },
      ]) > 0
    );
    badTokenizerAgent.clearTokenizerForTest();
    assert.equal(badTokenizerAgent.tokenCountForText("abcd"), 1);

    process.env.PS_MODEL_IN_COST_USD = "0.01";
    process.env.PS_MODEL_OUT_COST_USD = "0.01";
    process.env.PS_LLM_MAX_LIMITED_RETRY_COUNT = "3";
    const retryAgent = new ExposedSimpleAgent({
      groupId: 52,
      stages: {},
      totalCost: 0,
    } as PsSimpleAgentMemoryData);
    let emptyResponseCalls = 0;
    retryAgent.models.set(
      PsAiModelType.Text,
      fakeModel(async () => {
        emptyResponseCalls += 1;
        if (emptyResponseCalls === 1) {
          return undefined;
        }
        return { tokensIn: 1, tokensOut: 1, content: "\"[]\"" };
      })
    );
    const restoreEmptyRetryTimer = immediateTimer();
    try {
      assert.deepEqual(await retryAgent.callLLM("stage", []), []);
    } finally {
      restoreEmptyRetryTimer();
    }

    const jsonRetryAgent = new ExposedSimpleAgent({
      groupId: 53,
      stages: {},
      totalCost: 0,
    } as PsSimpleAgentMemoryData);
    let jsonCalls = 0;
    jsonRetryAgent.models.set(
      PsAiModelType.Text,
      fakeModel(async () => {
        jsonCalls += 1;
        return {
          tokensIn: 1,
          tokensOut: 1,
          content: jsonCalls === 1 ? "{foo: true false}" : "{\"ok\":true}",
        };
      })
    );
    assert.deepEqual(await jsonRetryAgent.callLLM("stage", []), { ok: true });

    const errorRetryAgent = new ExposedSimpleAgent({
      groupId: 54,
      stages: {},
      totalCost: 0,
    } as PsSimpleAgentMemoryData);
    let errorCalls = 0;
    errorRetryAgent.models.set(
      PsAiModelType.Text,
      fakeModel(async () => {
        errorCalls += 1;
        if (errorCalls === 1) {
          throw new Error("429 rate limit");
        }
        return { tokensIn: 1, tokensOut: 1, content: " done " };
      })
    );
    const restoreErrorRetryTimer = immediateTimer();
    try {
      assert.equal(await errorRetryAgent.callLLM("stage", [], false), "done");
    } finally {
      restoreErrorRetryTimer();
    }

    const specialTokenAgent = new ExposedSimpleAgent({
      groupId: 55,
      stages: {},
    } as PsSimpleAgentMemoryData);
    specialTokenAgent.models.set(
      PsAiModelType.Text,
      fakeModel(async () => {
        throw new Error("Failed to generate output due to special tokens in the input");
      })
    );
    await assert.rejects(
      () => specialTokenAgent.callLLM("stage", []),
      /special tokens/
    );

    const noCostAgent = new ExposedSimpleAgent({
      groupId: 56,
      stages: {},
    } as PsSimpleAgentMemoryData);
    delete process.env.PS_MODEL_IN_COST_USD;
    delete process.env.PS_MODEL_OUT_COST_USD;
    noCostAgent.updateMemoryStages("stage", 1, 2, fakeModel(async () => undefined));
    assert.equal(noCostAgent.memory?.stages?.stage.tokensIn, 0);

    const noStagesAgent = new ExposedSimpleAgent({
      groupId: 57,
    } as PsSimpleAgentMemoryData);
    noStagesAgent.updateMemoryStages("stage", 1, 2, fakeModel(async () => undefined));
    assert.equal(noStagesAgent.fullLLMCostsForMemory, 0);

    const originalSet = simpleAgentRedis.set.bind(simpleAgentRedis);
    Reflect.set(simpleAgentRedis, "set", async () => "OK");
    try {
      const baseAgent = new PolicySynthSimpleAgentBase({
        groupId: 58,
      } as PsSimpleAgentMemoryData);
      await baseAgent.saveMemory();
      assert.ok(baseAgent.memory?.lastSavedAt);
    } finally {
      Reflect.set(simpleAgentRedis, "set", originalSet);
    }

    const noMemoryBaseAgent = new PolicySynthSimpleAgentBase();
    await noMemoryBaseAgent.saveMemory();
  });

  it("ranks simple pairwise items and interprets LLM responses", async () => {
    const agent = new TestSimplePairwiseAgent({ groupId: 31 } as PsSimpleAgentMemoryData);
    const progress: string[] = [];
    const items: PsEloRateable[] = [
      { id: 1, title: "A" },
      { id: 2, title: "B" },
      { id: 3, title: "C" },
    ] as unknown as PsEloRateable[];

    assert.deepEqual(agent.fisherYatesShuffle([]), []);
    assert.equal(
      agent.fisherYatesShuffle(undefined as unknown as string[]),
      undefined
    );
    agent.setupRankingPrompts(0, items, 3, (value: string) => {
      progress.push(value);
    });
    agent.votes = [
      { subProblemIndex: 0, wonItemIndex: 0, lostItemIndex: 1 },
      { subProblemIndex: 0, wonItemIndex: -1, lostItemIndex: -1 },
      { subProblemIndex: 0, wonItemIndex: 2, lostItemIndex: 0 },
    ];
    await agent.performPairwiseRanking(0);
    assert.equal(progress.length, 3);
    assert.equal(agent.numComparisons[0][0], 2);
    assert.equal(agent.numComparisons[0][1], 1);
    assert.equal(agent.getUpdatedKFactor(99), agent.K_FACTOR_MIN);
    const ordered = agent.getOrderedListOfItems(0, true, "customElo");
    assert.equal(ordered.length, 3);
    assert.equal(typeof (ordered[0] as PsEloRateable & { customElo: number }).customElo, "number");

    agent.llmResponses = ["One", "Two", "Neither", "unexpected"];
    assert.deepEqual(await agent.getResultsFromLLM(1, "stage", [], 10, 20), {
      subProblemIndex: 1,
      wonItemIndex: 10,
      lostItemIndex: 20,
    });
    assert.deepEqual(await agent.getResultsFromLLM(1, "stage", [], 10, 20), {
      subProblemIndex: 1,
      wonItemIndex: 20,
      lostItemIndex: 10,
    });
    assert.equal((await agent.getResultsFromLLM(1, "stage", [], 10, 20)).wonItemIndex, -1);
    assert.equal((await agent.getResultsFromLLM(1, "stage", [], 10, 20)).lostItemIndex, -1);
    agent.llmResponses = ["Con One", "Pro Two", "Both"];
    assert.equal((await agent.getResultsFromLLM(1, "stage", [], 10, 20)).wonItemIndex, 10);
    assert.equal((await agent.getResultsFromLLM(1, "stage", [], 10, 20)).wonItemIndex, 20);
    assert.equal((await agent.getResultsFromLLM(1, "stage", [], 10, 20)).wonItemIndex, -1);

    process.env.PS_MAX_PAIRWISE_RANING_RETRY_COUNT = "2";
    agent.llmResponses = ["THROW", "One"];
    const restorePairwiseTimer = immediateTimer();
    try {
      assert.equal(
        (await agent.getResultsFromLLM(1, "stage", [], 10, 20)).wonItemIndex,
        10
      );
    } finally {
      restorePairwiseTimer();
    }

    const restoreRandom = scriptedRandom([0, 0.25, 0.5, 0.75, 0.1, 0.35]);
    try {
      agent.setupRankingPrompts(
        2,
        [
          { id: 1, title: "A" },
          { id: 2, title: "B" },
          { id: 3, title: "C" },
          { id: 4, title: "D" },
        ] as unknown as PsEloRateable[],
        2
      );
    } finally {
      restoreRandom();
    }
    assert.equal(agent.prompts[2].length, 2);
    process.env.PS_PAIRWISE_PROMPT_FRACTION = "0.1";
    try {
      agent.setupRankingPrompts(
        3,
        [
          { id: 1, title: "A" },
          { id: 2, title: "B" },
          { id: 3, title: "C" },
        ] as unknown as PsEloRateable[]
      );
      const defaultOrdered = agent.getOrderedListOfItems(3, true);
      assert.equal(defaultOrdered.length, 3);
      assert.equal(typeof (defaultOrdered[0] as PsEloRateable).eloRating, "number");
    } finally {
      restoreEnv("PS_PAIRWISE_PROMPT_FRACTION", originalPairwisePromptFraction);
    }

    agent.votes = [
      {
        subProblemIndex: 0,
        wonItemIndex: undefined,
        lostItemIndex: undefined,
      },
    ];
    await assert.rejects(() => agent.performPairwiseRanking(0), /Invalid won or lost/);

    agent.setupRankingPrompts(4, ["A", "B"], 1);
    const originalVoteOnPromptPair = agent.voteOnPromptPair.bind(agent);
    Reflect.set(agent, "voteOnPromptPair", async () => {
      throw "pairwise string failure";
    });
    try {
      await assert.rejects(
        () => agent.performPairwiseRanking(4),
        (error) => error === "pairwise string failure"
      );
    } finally {
      Reflect.set(agent, "voteOnPromptPair", originalVoteOnPromptPair);
    }
  });

  it("ranks DB-backed pairwise items in deterministic order", async () => {
    const agent = new TestPairwiseAgent(createAgentRecord(), createMemory(), 0, 100);
    const items: PsEloRateable[] = [
      { id: 1, title: "A" },
      { id: 2, title: "B" },
      { id: 3, title: "C" },
    ] as unknown as PsEloRateable[];

    assert.deepEqual(agent.fisherYatesShuffle([]), []);
    assert.equal(
      agent.fisherYatesShuffle(undefined as unknown as PsEloRateable[]),
      undefined
    );
    agent.setupRankingPrompts(0, items, 3, undefined, 2, false);
    agent.votes = [
      { subProblemIndex: 0, wonItemIndex: 0, lostItemIndex: 1 },
      { subProblemIndex: 0, wonItemIndex: -1, lostItemIndex: -1 },
      { subProblemIndex: 0, wonItemIndex: 2, lostItemIndex: 0 },
    ];
    await agent.performPairwiseRanking(0);
    assert.equal(agent.rangedProgressUpdates.length, 3);
    assert.equal(agent.numComparisons[0][0], 2);
    assert.equal(agent.getOrderedListOfItems(99).length, 0);
    const ordered = agent.getOrderedListOfItems(0, true);
    assert.equal(ordered.length, 3);
    assert.equal(typeof (ordered[0] as PsEloRateable).eloRating, "number");
    assert.equal(agent.getUpdatedKFactor(99), agent.K_FACTOR_MIN);

    agent.modelResponses = ["one", "two", "unclear"];
    assert.equal((await agent.getResultsFromLLM(1, [], 10, 20)).wonItemIndex, 10);
    assert.equal((await agent.getResultsFromLLM(1, [], 10, 20)).wonItemIndex, 20);
    assert.equal((await agent.getResultsFromLLM(1, [], 10, 20)).wonItemIndex, -1);
    agent.modelResponses = ["pro one", "con two"];
    assert.equal((await agent.getResultsFromLLM(1, [], 10, 20)).wonItemIndex, 10);
    assert.equal((await agent.getResultsFromLLM(1, [], 10, 20)).wonItemIndex, 20);

    agent.modelResponses = ["PROHIBITED"];
    assert.equal((await agent.getResultsFromLLM(1, [], 10, 20)).wonItemIndex, -1);

    process.env.PS_MAX_PAIRWISE_RANING_RETRY_COUNT = "2";
    agent.modelResponses = ["THROW", "one"];
    const restorePairwiseTimer = immediateTimer();
    try {
      assert.equal((await agent.getResultsFromLLM(1, [], 10, 20)).wonItemIndex, 10);
    } finally {
      restorePairwiseTimer();
    }

    const restoreRandom = scriptedRandom([0, 0.25, 0.5, 0.75, 0.1, 0.35]);
    try {
      agent.setupRankingPrompts(
        2,
        [
          { id: 1, title: "A" },
          { id: 2, title: "B" },
          { id: 3, title: "C" },
          { id: 4, title: "D" },
        ] as unknown as PsEloRateable[],
        2,
        undefined,
        1,
        true
      );
    } finally {
      restoreRandom();
    }
    assert.equal(agent.prompts[2].length, 2);

    process.env.PS_PAIRWISE_PROMPT_FRACTION = "0.1";
    try {
      agent.setupRankingPrompts(
        3,
        [
          { id: 1, title: "A" },
          { id: 2, title: "B" },
          { id: 3, title: "C" },
        ] as unknown as PsEloRateable[]
      );
      const customOrdered = agent.getOrderedListOfItems(3, true, "customElo");
      assert.equal(customOrdered.length, 3);
      assert.equal(
        typeof (customOrdered[0] as PsEloRateable & { customElo: number }).customElo,
        "number"
      );
    } finally {
      restoreEnv("PS_PAIRWISE_PROMPT_FRACTION", originalPairwisePromptFraction);
    }

    agent.setupRankingPrompts(4, ["A", "B"], 1, undefined, 1, false);
    agent.disableRelativeProgress = true;
    agent.votes = [{ subProblemIndex: 4, wonItemIndex: 0, lostItemIndex: 1 }];
    await agent.performPairwiseRanking(4);
    assert.equal(
      agent.rangedProgressUpdates[agent.rangedProgressUpdates.length - 1].progress,
      undefined
    );
    agent.disableRelativeProgress = false;

    const pairwiseProgress: string[] = [];
    agent.setupRankingPrompts(5, ["A", "B"], undefined, (value: string) => {
      pairwiseProgress.push(value);
    });
    agent.votes = [
      {
        subProblemIndex: 5,
        wonItemIndex: undefined,
        lostItemIndex: undefined,
      },
    ];
    await agent.performPairwiseRanking(5);
    assert.deepEqual(pairwiseProgress, ["1/1"]);
    assert.equal(agent.numComparisons[5][0], 0);

    agent.modelResponses = [];
    process.env.PS_MAX_PAIRWISE_RANING_RETRY_COUNT = "1";
    assert.equal((await agent.getResultsFromLLM(2, [], 10, 20)).wonItemIndex, -1);
  });

  it("surfaces invalid PDF parsing while cleaning parser resources", async () => {
    const onePagePdf = `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 72 120 Td (Hello PDF) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000251 00000 n
0000000345 00000 n
trailer
<< /Root 1 0 R /Size 6 >>
startxref
415
%%EOF`;

    const originalDestroy = PDFParse.prototype.destroy;
    Reflect.set(PDFParse.prototype, "destroy", async () => {
      throw new Error("destroy failed");
    });
    try {
      assert.equal(
        await extractTextFromPdfBuffer(Buffer.from(onePagePdf)),
        "Hello PDF"
      );
    } finally {
      Reflect.set(PDFParse.prototype, "destroy", originalDestroy);
    }

    await assert.rejects(() => extractTextFromPdfBuffer(Buffer.from("not a pdf")));
  });
});
