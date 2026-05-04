import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

import {
  PsAiModelProvider,
  PsAiModelSize,
  PsAiModelType,
} from "../../aiModelTypes.js";
import { BaseChatModel } from "../../aiModels/baseChatModel.js";
import { OpenAiResponses } from "../../aiModels/openAiResponses.js";
import { PsAiModelManager } from "../../base/agentModelManager.js";

process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DB_PORT ??= "5432";

type RecordedResponsesRequest = {
  max_output_tokens?: number;
  reasoning?: {
    effort?: string;
  };
  service_tier?: string;
};

type ResponsesClientMock = {
  create: (params: unknown) => Promise<unknown>;
};

type PsAiModelManagerInternals = {
  createEphemeralModel: (
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    options: PsCallModelOptions
  ) => Promise<OpenAiResponses | undefined>;
  getStateIsolatedResponsesModel: (
    model: OpenAiResponses,
    options: PsCallModelOptions
  ) => OpenAiResponses;
  getTimeoutMsForRetry: (
    options: PsCallModelOptions,
    modelTimeoutMs: number | undefined,
    retryCount: number,
    maxRetries: number
  ) => number;
  statefulResponsesModelCache: Map<string, OpenAiResponses>;
  modelsByType: Map<PsAiModelType, OpenAiResponses>;
};

const asInternals = (manager: PsAiModelManager) =>
  manager as unknown as PsAiModelManagerInternals;

const setMockClient = (model: object, responses: ResponsesClientMock) => {
  Reflect.set(model, "client", { responses });
};

const originalDisableDbInit = process.env.DISABLE_DB_INIT;
const originalOpenAiOverride = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
const originalEnforceEuRegion = process.env.OPENAI_ENFORCE_EU_REGION;
const originalAzureKey = process.env.AZURE_OPENAI_KEY;
const originalAzureEndpoint = process.env.AZURE_ENDPOINT;
const originalAzureDeployment = process.env.AZURE_DEPLOYMENT_NAME;
const originalAzureApiVersion = process.env.AZURE_OPENAI_API_VERSION;

const useStandardResponsesEnv = () => {
  process.env.DISABLE_DB_INIT = "true";
  delete process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
  delete process.env.OPENAI_ENFORCE_EU_REGION;
  delete process.env.AZURE_OPENAI_KEY;
  delete process.env.AZURE_ENDPOINT;
  delete process.env.AZURE_DEPLOYMENT_NAME;
  delete process.env.AZURE_OPENAI_API_VERSION;
};

afterEach(() => {
  if (originalDisableDbInit === undefined) {
    delete process.env.DISABLE_DB_INIT;
  } else {
    process.env.DISABLE_DB_INIT = originalDisableDbInit;
  }

  if (originalOpenAiOverride === undefined) {
    delete process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
  } else {
    process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY = originalOpenAiOverride;
  }

  if (originalEnforceEuRegion === undefined) {
    delete process.env.OPENAI_ENFORCE_EU_REGION;
  } else {
    process.env.OPENAI_ENFORCE_EU_REGION = originalEnforceEuRegion;
  }

  if (originalAzureKey === undefined) {
    delete process.env.AZURE_OPENAI_KEY;
  } else {
    process.env.AZURE_OPENAI_KEY = originalAzureKey;
  }

  if (originalAzureEndpoint === undefined) {
    delete process.env.AZURE_ENDPOINT;
  } else {
    process.env.AZURE_ENDPOINT = originalAzureEndpoint;
  }

  if (originalAzureDeployment === undefined) {
    delete process.env.AZURE_DEPLOYMENT_NAME;
  } else {
    process.env.AZURE_DEPLOYMENT_NAME = originalAzureDeployment;
  }

  if (originalAzureApiVersion === undefined) {
    delete process.env.AZURE_OPENAI_API_VERSION;
  } else {
    process.env.AZURE_OPENAI_API_VERSION = originalAzureApiVersion;
  }
});

const prices: PsBaseModelPriceConfiguration = {
  costInTokensPerMillion: 1,
  costInCachedContextTokensPerMillion: 0.5,
  costOutTokensPerMillion: 2,
  currency: "USD",
};

const createAiModel = (
  configurationOverrides: Partial<PsAiModelConfiguration> = {}
): PsAiModelAttributes => ({
  id: 1,
  uuid: "model-1",
  user_id: 1,
  created_at: new Date("2026-01-01T00:00:00Z"),
  updated_at: new Date("2026-01-01T00:00:00Z"),
  name: "Responses Test Model",
  organization_id: 1,
  configuration: {
    type: PsAiModelType.TextReasoning,
    modelSize: PsAiModelSize.Small,
    model: "gpt-5.3",
    provider: PsAiModelProvider.OpenAIResponses,
    active: true,
    prices,
    maxTokensOut: 256,
    defaultTemperature: 0.4,
    ...configurationOverrides,
  },
});

const createManager = (
  configurationOverrides: Partial<PsAiModelConfiguration> = {},
  managerTemperature: number = 0.4
) =>
  new PsAiModelManager(
    [createAiModel(configurationOverrides)],
    [{ aiModelId: 1, apiKey: "responses-test-key" }],
    256,
    managerTemperature,
    "medium",
    0,
    42,
    7
  );

const createResponsesOptions = (
  overrides: Partial<PsCallModelOptions> = {}
): PsCallModelOptions => ({
  modelProvider: PsAiModelProvider.OpenAIResponses,
  modelName: "gpt-5.3",
  responsesStateKey: "conversation-a",
  ...overrides,
});

class NoopUsageModelManager extends PsAiModelManager {
  override async saveTokenUsage(
    ..._args: Parameters<PsAiModelManager["saveTokenUsage"]>
  ): Promise<void> {}

  override async saveTokenUsageItem(
    ..._args: Parameters<PsAiModelManager["saveTokenUsageItem"]>
  ): Promise<void> {}
}

class DelayedFirstAttemptModel extends BaseChatModel {
  generateCalls = 0;

  constructor(config: PsAiModelConfig) {
    super(config, config.modelName, config.maxTokensOut);
  }

  override async generate(
    _messages: PsModelMessage[],
    _streaming?: boolean,
    _streamingCallback?: Function,
    _media?: { mimeType: string; data: string }[],
    _tools?: ChatCompletionTool[],
    _toolChoice?: ChatCompletionToolChoiceOption | "auto",
    _allowedTools?: string[],
    _requestOptions?: PsModelRequestOptions
  ): Promise<PsBaseModelReturnParameters> {
    this.generateCalls++;

    if (this.generateCalls === 1) {
      await new Promise((resolve) => setTimeout(resolve, 75));
      return {
        content: "late first attempt",
        tokensIn: 1,
        tokensOut: 1,
      };
    }

    return {
      content: "second attempt",
      tokensIn: 1,
      tokensOut: 1,
    };
  }
}

describe("PsAiModelManager call options", () => {
  it("ramps forceTimeoutAndRetryMs after ten retries", () => {
    useStandardResponsesEnv();

    const manager = new NoopUsageModelManager(
      [],
      [],
      256,
      0.4,
      "medium",
      0,
      42,
      7
    );
    const internals = asInternals(manager);
    const options: PsCallModelOptions = {
      forceTimeoutAndRetryMs: 2500,
    };

    assert.equal(
      internals.getTimeoutMsForRetry(options, undefined, 0, 50),
      2500
    );
    assert.equal(
      internals.getTimeoutMsForRetry(options, undefined, 9, 50),
      2500
    );
    assert.ok(
      internals.getTimeoutMsForRetry(options, undefined, 10, 50) > 2500
    );
    assert.equal(
      internals.getTimeoutMsForRetry(options, undefined, 49, 50),
      30000
    );
  });

  it("uses forceTimeoutAndRetryMs as the per-call retry timeout", async () => {
    useStandardResponsesEnv();

    const manager = new NoopUsageModelManager(
      [],
      [],
      256,
      0.4,
      "medium",
      0,
      42,
      7
    );
    const model = new DelayedFirstAttemptModel({
      apiKey: "timeout-test-key",
      modelName: "timeout-test-model",
      provider: PsAiModelProvider.OpenAI,
      modelType: PsAiModelType.Text,
      modelSize: PsAiModelSize.Small,
      timeoutMs: 1000,
      prices,
    });

    manager.models.set(`${PsAiModelType.Text}_${PsAiModelSize.Small}`, model);

    const result = await manager.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [{ role: "user", message: "hello" }],
      {
        parseJson: false,
        forceTimeoutAndRetryMs: 10,
        overrideMaxRetries: 2,
      }
    );

    assert.equal(result, "second attempt");
    assert.equal(model.generateCalls, 2);
  });
});

describe("PsAiModelManager OpenAI Responses state reuse", () => {
  it("reuses one stateful Responses instance across effort changes for the same conversation", async () => {
    useStandardResponsesEnv();

    const manager = createManager();
    const internals = asInternals(manager);

    const first = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions({
        modelReasoningEffort: "medium",
      })
    );

    assert.ok(first instanceof OpenAiResponses);

    Reflect.set(first, "previousResponseId", "resp1");
    Reflect.set(first, "sentToolOutputIds", new Set(["call_1", "call_2"]));

    const second = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions({
        modelReasoningEffort: "high",
      })
    );
    const third = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions({
        modelReasoningEffort: "medium",
      })
    );

    assert.strictEqual(second, first);
    assert.strictEqual(third, first);
    assert.equal(Reflect.get(third, "previousResponseId"), "resp1");
    assert.deepEqual(
      Array.from(Reflect.get(third, "sentToolOutputIds") as Set<string>),
      ["call_1", "call_2"]
    );
    assert.equal(third.config.reasoningEffort, "medium");
    assert.equal(internals.statefulResponsesModelCache.size, 1);
  });

  it("applies latest runtime overrides before generating on a reused stateful Responses instance", async () => {
    useStandardResponsesEnv();

    const manager = createManager();
    const internals = asInternals(manager);

    const first = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions({
        modelReasoningEffort: "medium",
      })
    );

    assert.ok(first instanceof OpenAiResponses);

    const second = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions({
        modelReasoningEffort: "high",
        inferenceType: "fast",
        maxTokensOut: 1024,
        modelMaxThinkingTokens: 4096,
        modelTemperature: 0.15,
      })
    );

    assert.strictEqual(second, first);
    assert.equal(second.config.reasoningEffort, "high");
    assert.equal(second.config.inferenceType, "priority");
    assert.equal(second.config.maxTokensOut, 1024);
    assert.equal(second.maxTokensOut, 1024);
    assert.equal(second.config.maxThinkingTokens, 4096);
    assert.equal(second.config.temperature, 0.15);

    let captured: RecordedResponsesRequest | undefined;
    setMockClient(second, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-high",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "ok" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await second.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.reasoning?.effort, "high");
    assert.equal(captured.max_output_tokens, 1024);
    assert.equal(captured.service_tier, "priority");
    assert.equal(result.content, "ok");
  });

  it("creates a separate stateful bucket when modelName changes", async () => {
    useStandardResponsesEnv();

    const manager = createManager();
    const internals = asInternals(manager);

    const first = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions({
        modelName: "gpt-5.3",
      })
    );
    const second = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions({
        modelName: "gpt-5.4",
      })
    );

    assert.ok(first instanceof OpenAiResponses);
    assert.ok(second instanceof OpenAiResponses);
    assert.notStrictEqual(second, first);
    assert.equal(internals.statefulResponsesModelCache.size, 2);
  });

  it("creates a separate stateful bucket when regional processing changes", async () => {
    useStandardResponsesEnv();

    const manager = createManager();
    const internals = asInternals(manager);

    const first = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions()
    );
    const second = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions({
        regionalProcessing: "eu",
      })
    );

    assert.ok(first instanceof OpenAiResponses);
    assert.ok(second instanceof OpenAiResponses);
    assert.notStrictEqual(second, first);
    assert.equal(internals.statefulResponsesModelCache.size, 2);
  });

  it("reuses the configured-model state bucket across effort changes", () => {
    useStandardResponsesEnv();

    const manager = createManager();
    const internals = asInternals(manager);
    const configuredModel = internals.modelsByType.get(
      PsAiModelType.TextReasoning
    );

    assert.ok(configuredModel instanceof OpenAiResponses);

    const first = internals.getStateIsolatedResponsesModel(configuredModel, {
      responsesStateKey: "conversation-a",
      modelReasoningEffort: "medium",
    });

    Reflect.set(first, "previousResponseId", "configured-resp");

    const second = internals.getStateIsolatedResponsesModel(configuredModel, {
      responsesStateKey: "conversation-a",
      modelReasoningEffort: "high",
    });
    const third = internals.getStateIsolatedResponsesModel(configuredModel, {
      responsesStateKey: "conversation-a",
      modelReasoningEffort: "medium",
    });

    assert.notStrictEqual(first, configuredModel);
    assert.strictEqual(second, first);
    assert.strictEqual(third, first);
    assert.equal(Reflect.get(third, "previousResponseId"), "configured-resp");
    assert.equal(third.config.reasoningEffort, "medium");
    assert.equal(internals.statefulResponsesModelCache.size, 1);
  });

  it("preserves the model temperature for stateful non-reasoning Responses reuse when no override is supplied", async () => {
    useStandardResponsesEnv();

    const manager = createManager({}, 0.7);
    const internals = asInternals(manager);
    const baseEphemeral = new OpenAiResponses({
      apiKey: "responses-test-key",
      modelName: "gpt-4o",
      provider: PsAiModelProvider.OpenAIResponses,
      modelType: PsAiModelType.Text,
      modelSize: PsAiModelSize.Small,
      maxTokensOut: 256,
      temperature: 0.0,
      prices,
    });
    baseEphemeral.provider = PsAiModelProvider.OpenAIResponses;

    const first = internals.getStateIsolatedResponsesModel(baseEphemeral, {
      responsesStateKey: "conversation-a",
    });
    const second = internals.getStateIsolatedResponsesModel(baseEphemeral, {
      responsesStateKey: "conversation-a",
    });

    assert.notStrictEqual(first, baseEphemeral);
    assert.strictEqual(second, first);
    assert.equal(first.config.temperature, 0.0);

    let captured: Record<string, unknown> | undefined;
    setMockClient(first, {
      create: async (params) => {
        captured = params as Record<string, unknown>;
        return {
          id: "resp-temp",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "ok" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await first.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.temperature, 0.0);
    assert.equal(result.content, "ok");
  });
});
