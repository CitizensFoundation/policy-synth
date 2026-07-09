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
import { AzureOpenAiChat } from "../../aiModels/azureOpenAiChat.js";
import { BaseChatModel } from "../../aiModels/baseChatModel.js";
import { ClaudeChat } from "../../aiModels/claudeChat.js";
import { GoogleGeminiChat } from "../../aiModels/googleGeminiChat.js";
import {
  GeminiDeepResearchRequiresActionError,
  GoogleGeminiDeepResearch,
} from "../../aiModels/googleGeminiDeepResearch.js";
import { GoogleGeminiThought } from "../../aiModels/googleGeminiThought.js";
import { OpenAiChat } from "../../aiModels/openAiChat.js";
import { OpenAiRealtime } from "../../aiModels/openAiRealtime.js";
import { OpenAiResponses } from "../../aiModels/openAiResponses.js";
import { PsAiModelManager } from "../../base/agentModelManager.js";
import { policySynthEvents, TOKEN_USAGE_EVENT } from "../../base/events.js";
import { TokenLimitChunker } from "../../base/tokenLimitChunker.js";

process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DB_PORT ??= "5432";

type RecordedResponsesRequest = {
  max_output_tokens?: number;
  previous_response_id?: string;
  reasoning?: {
    effort?: string;
    mode?: string;
  };
  service_tier?: string;
};

type ResponsesClientMock = {
  create: (params: unknown) => Promise<unknown>;
};

type PsAiModelManagerInternals = {
  applyPriceOverride: (
    basePrices: PsBaseModelPriceConfiguration | undefined,
    priceOverride?: Partial<PsBaseModelPriceConfiguration>
  ) => PsBaseModelPriceConfiguration | undefined;
  runTextModelCall: (
    model: BaseChatModel,
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions
  ) => Promise<unknown>;
  callWithTimeout: (
    model: BaseChatModel,
    messages: PsModelMessage[],
    streamingCallbacks: ((chunk: string) => void) | undefined,
    timeoutMs: number,
    media?: PsPromptImage[],
    tools?: ChatCompletionTool[],
    toolChoice?: ChatCompletionToolChoiceOption | "auto",
    allowedTools?: string[],
    requestOptions?: PsModelRequestOptions
  ) => Promise<PsBaseModelReturnParameters | undefined>;
  createEphemeralModel: (
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    options: PsCallModelOptions
  ) => Promise<BaseChatModel | undefined>;
  getModelRequestOptions: (
    options: PsCallModelOptions,
    timeoutMs: number
  ) => PsModelRequestOptions;
  getResponsesStateKey: (options: PsCallModelOptions) => string | undefined;
  getStateIsolatedResponsesModel: (
    model: BaseChatModel,
    options: PsCallModelOptions
  ) => BaseChatModel;
  cacheStatefulResponsesModel: (
    cacheKey: string,
    model: OpenAiResponses
  ) => void;
  getResponsesRuntimeOverrides: (
    model: OpenAiResponses,
    options: PsCallModelOptions
  ) => Pick<
    PsOpenAiModelConfig,
    | "inferenceType"
    | "maxTokensOut"
    | "temperature"
    | "reasoningEffort"
    | "reasoningMode"
    | "maxThinkingTokens"
  >;
  getApiKeyForProvider: (provider: string) => string;
  getTimeoutMsForRetry: (
    options: PsCallModelOptions,
    modelTimeoutMs: number | undefined,
    retryCount: number,
    maxRetries: number
  ) => number;
  sleepBeforeRetry: (retryCount: number) => Promise<void>;
  statefulResponsesModelCache: Map<string, OpenAiResponses>;
  modelsByType: Map<PsAiModelType, BaseChatModel>;
  maxStatefulResponsesModelCacheEntries: number;
};

const asInternals = (manager: PsAiModelManager) =>
  manager as unknown as PsAiModelManagerInternals;

const setMockClient = (model: object, responses: ResponsesClientMock) => {
  Reflect.set(model, "client", { responses });
};

const originalDisableDbInit = process.env.DISABLE_DB_INIT;
const originalOpenAiOverride = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
const originalEnforceEuRegion = process.env.OPENAI_ENFORCE_EU_REGION;
const originalAzureOpenAiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const originalAzureKey = process.env.AZURE_OPENAI_KEY;
const originalAzureEndpoint = process.env.AZURE_ENDPOINT;
const originalAzureDeployment = process.env.AZURE_DEPLOYMENT_NAME;
const originalAzureApiVersion = process.env.AZURE_OPENAI_API_VERSION;
const originalModelCallTimeoutMs = process.env.PS_MODEL_CALL_TIMEOUT_MS;
const originalModelType = process.env.PS_AI_MODEL_TYPE;
const originalModelSize = process.env.PS_AI_MODEL_SIZE;
const originalModelProvider = process.env.PS_AI_MODEL_PROVIDER;
const originalModelName = process.env.PS_AI_MODEL_NAME;
const originalOpenAiKey = process.env.OPENAI_API_KEY;
const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
const originalGoogleKey = process.env.GOOGLE_API_KEY;
const originalGeminiKey = process.env.GEMINI_API_KEY;
const originalAzureApiKey = process.env.AZURE_API_KEY;
const originalPsAiModelEndpoint = process.env.PS_AI_MODEL_ENDPOINT;
const originalPsAiModelDeploymentName =
  process.env.PS_AI_MODEL_DEPLOYMENT_NAME;
const originalDisableUsageTracking = process.env.DISABLE_DB_USAGE_TRACKING;
const originalEmitUsageEvents = process.env.PS_EMIT_TOKEN_USAGE_EVENTS;
const originalPromptDebug = process.env.PS_PROMPT_DEBUG;

const restoreEnv = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

const useStandardResponsesEnv = () => {
  process.env.DISABLE_DB_INIT = "true";
  delete process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
  delete process.env.OPENAI_ENFORCE_EU_REGION;
  delete process.env.AZURE_OPENAI_ENDPOINT;
  delete process.env.AZURE_OPENAI_KEY;
  delete process.env.AZURE_ENDPOINT;
  delete process.env.AZURE_DEPLOYMENT_NAME;
  delete process.env.AZURE_OPENAI_API_VERSION;
  delete process.env.PS_AI_MODEL_TYPE;
  delete process.env.PS_AI_MODEL_SIZE;
  delete process.env.PS_AI_MODEL_PROVIDER;
  delete process.env.PS_AI_MODEL_NAME;
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.AZURE_API_KEY;
  delete process.env.PS_AI_MODEL_ENDPOINT;
  delete process.env.PS_AI_MODEL_DEPLOYMENT_NAME;
  delete process.env.DISABLE_DB_USAGE_TRACKING;
  delete process.env.PS_EMIT_TOKEN_USAGE_EVENTS;
  delete process.env.PS_PROMPT_DEBUG;
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

  if (originalAzureOpenAiEndpoint === undefined) {
    delete process.env.AZURE_OPENAI_ENDPOINT;
  } else {
    process.env.AZURE_OPENAI_ENDPOINT = originalAzureOpenAiEndpoint;
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

  restoreEnv("PS_MODEL_CALL_TIMEOUT_MS", originalModelCallTimeoutMs);
  restoreEnv("PS_AI_MODEL_TYPE", originalModelType);
  restoreEnv("PS_AI_MODEL_SIZE", originalModelSize);
  restoreEnv("PS_AI_MODEL_PROVIDER", originalModelProvider);
  restoreEnv("PS_AI_MODEL_NAME", originalModelName);
  restoreEnv("OPENAI_API_KEY", originalOpenAiKey);
  restoreEnv("ANTHROPIC_API_KEY", originalAnthropicKey);
  restoreEnv("GOOGLE_API_KEY", originalGoogleKey);
  restoreEnv("GEMINI_API_KEY", originalGeminiKey);
  restoreEnv("AZURE_API_KEY", originalAzureApiKey);
  restoreEnv("PS_AI_MODEL_ENDPOINT", originalPsAiModelEndpoint);
  restoreEnv(
    "PS_AI_MODEL_DEPLOYMENT_NAME",
    originalPsAiModelDeploymentName
  );
  restoreEnv("DISABLE_DB_USAGE_TRACKING", originalDisableUsageTracking);
  restoreEnv("PS_EMIT_TOKEN_USAGE_EVENTS", originalEmitUsageEvents);
  restoreEnv("PS_PROMPT_DEBUG", originalPromptDebug);
});

const prices: PsBaseModelPriceConfiguration = {
  costInTokensPerMillion: 1,
  costInCachedContextTokensPerMillion: 0.5,
  costOutTokensPerMillion: 2,
  currency: "USD",
};

const createAiModel = (
  configurationOverrides: Partial<PsAiModelConfiguration> = {},
  id = 1
): PsAiModelAttributes => ({
  id,
  uuid: `model-${id}`,
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
  usageCalls: Parameters<PsAiModelManager["saveTokenUsage"]>[] = [];
  usageItemCalls: Parameters<PsAiModelManager["saveTokenUsageItem"]>[] = [];

  override async saveTokenUsage(
    ...args: Parameters<PsAiModelManager["saveTokenUsage"]>
  ): Promise<void> {
    this.usageCalls.push(args);
  }

  override async saveTokenUsageItem(
    ...args: Parameters<PsAiModelManager["saveTokenUsageItem"]>
  ): Promise<void> {
    this.usageItemCalls.push(args);
  }
}

type GenerateCall = {
  messages: PsModelMessage[];
  streaming?: boolean;
  streamingCallback?: Function;
  media?: PsPromptImage[];
  tools?: ChatCompletionTool[];
  toolChoice?: ChatCompletionToolChoiceOption | "auto";
  allowedTools?: string[];
  requestOptions?: PsModelRequestOptions;
};

class ScriptedChatModel extends BaseChatModel {
  calls: GenerateCall[] = [];
  private readonly results: Array<PsBaseModelReturnParameters | undefined>;
  private readonly errors: Error[];

  constructor(
    config: PsAiModelConfig,
    results: Array<PsBaseModelReturnParameters | undefined> = [],
    errors: Error[] = []
  ) {
    super(config, config.modelName, config.maxTokensOut);
    this.provider = config.provider;
    this.results = [...results];
    this.errors = [...errors];
  }

  override async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function,
    media?: PsPromptImage[],
    tools?: ChatCompletionTool[],
    toolChoice?: ChatCompletionToolChoiceOption | "auto",
    allowedTools?: string[],
    requestOptions?: PsModelRequestOptions
  ): Promise<PsBaseModelReturnParameters | undefined> {
    this.calls.push({
      messages,
      streaming,
      streamingCallback,
      media,
      tools,
      toolChoice,
      allowedTools,
      requestOptions,
    });

    const error = this.errors.shift();
    if (error) {
      throw error;
    }

    if (this.results.length > 0) {
      return this.results.shift();
    }

    return {
      content: "default",
      tokensIn: 1,
      tokensOut: 1,
    };
  }
}

class NeverCompletingFirstAttemptModel extends BaseChatModel {
  generateCalls = 0;
  requestOptionsHistory: Array<PsModelRequestOptions | undefined> = [];

  constructor(config: PsAiModelConfig) {
    super(config, config.modelName, config.maxTokensOut);
  }

  override async generate(
    _messages: PsModelMessage[],
    _streaming?: boolean,
    _streamingCallback?: Function,
    _media?: PsPromptImage[],
    _tools?: ChatCompletionTool[],
    _toolChoice?: ChatCompletionToolChoiceOption | "auto",
    _allowedTools?: string[],
    requestOptions?: PsModelRequestOptions
  ): Promise<PsBaseModelReturnParameters> {
    this.generateCalls++;
    this.requestOptionsHistory.push(requestOptions);

    if (this.generateCalls === 1) {
      return new Promise<PsBaseModelReturnParameters>(() => undefined);
    }

    return {
      content: "second attempt",
      tokensIn: 1,
      tokensOut: 1,
    };
  }
}

const createModelConfig = (
  overrides: Partial<PsAiModelConfig> = {}
): PsAiModelConfig => ({
  apiKey: "test-key",
  modelName: "test-model",
  provider: PsAiModelProvider.OpenAI,
  modelType: PsAiModelType.Text,
  modelSize: PsAiModelSize.Small,
  maxTokensOut: 256,
  timeoutMs: 1000,
  prices,
  ...overrides,
});

const createNoopManager = () =>
  new NoopUsageModelManager([], [], 256, 0.4, "medium", 0, 42, 7);

const registerModel = (
  manager: PsAiModelManager,
  model: BaseChatModel,
  modelType = model.config.modelType,
  modelSize = model.config.modelSize,
  modelId = 101
) => {
  const modelKey = `${modelType}_${modelSize}`;
  manager.models.set(modelKey, model);
  manager.modelsByType.set(modelType, model);
  manager.modelIds.set(modelKey, modelId);
  manager.modelIdsByType.set(modelType, modelId);
  model.dbModelId = modelId;
};

const disableRetrySleep = (manager: PsAiModelManager) => {
  Reflect.set(
    asInternals(manager),
    "sleepBeforeRetry",
    async (_retryCount: number) => undefined
  );
};

const createModelResult = (
  content: string,
  overrides: Partial<PsBaseModelReturnParameters> = {}
): PsBaseModelReturnParameters => ({
  content,
  tokensIn: 3,
  tokensOut: 2,
  ...overrides,
});

describe("PsAiModelManager initialization", () => {
  it("initializes configured provider models and records their ids", () => {
    useStandardResponsesEnv();
    process.env.AZURE_OPENAI_ENDPOINT = "https://example.openai.azure.com";

    const configuredModels = [
      createAiModel(
        {
          type: PsAiModelType.Text,
          modelSize: PsAiModelSize.Small,
          model: "gpt-4o-mini",
          provider: PsAiModelProvider.OpenAI,
          timeoutMs: 3456,
        },
        11
      ),
      createAiModel(
        {
          type: PsAiModelType.Text,
          modelSize: PsAiModelSize.Medium,
          model: "claude-3-haiku-20240307",
          provider: PsAiModelProvider.Anthropic,
        },
        12
      ),
      createAiModel(
        {
          type: PsAiModelType.TextReasoning,
          modelSize: PsAiModelSize.Small,
          model: "gpt-5.3",
          provider: PsAiModelProvider.OpenAIResponses,
        },
        13
      ),
      createAiModel(
        {
          type: PsAiModelType.MultiModal,
          modelSize: PsAiModelSize.Large,
          model: "gemini-2.5-pro",
          provider: PsAiModelProvider.Google,
        },
        14
      ),
      createAiModel(
        {
          type: PsAiModelType.Audio,
          modelSize: PsAiModelSize.Small,
          model: "gpt-4o-audio",
          provider: PsAiModelProvider.Azure,
          endpoint: "https://example.openai.azure.com",
          deploymentName: "audio-deployment",
        },
        15
      ),
      createAiModel(
        {
          type: PsAiModelType.Realtime,
          modelSize: PsAiModelSize.Small,
          model: "gpt-realtime-2",
          provider: PsAiModelProvider.OpenAI,
        },
        16
      ),
    ];

    const manager = new PsAiModelManager(
      configuredModels,
      configuredModels.map((model) => ({
        aiModelId: model.id,
        apiKey: `key-${model.id}`,
      })),
      512,
      0.2,
      "high",
      128,
      42,
      7
    );

    assert.ok(
      manager.models.get(`${PsAiModelType.Text}_${PsAiModelSize.Small}`) instanceof
        OpenAiChat
    );
    assert.ok(
      manager.models.get(`${PsAiModelType.Text}_${PsAiModelSize.Medium}`) instanceof
        ClaudeChat
    );
    assert.ok(
      manager.models.get(
        `${PsAiModelType.TextReasoning}_${PsAiModelSize.Small}`
      ) instanceof OpenAiResponses
    );
    assert.ok(
      manager.models.get(`${PsAiModelType.MultiModal}_${PsAiModelSize.Large}`) instanceof
        GoogleGeminiChat
    );
    assert.ok(
      manager.models.get(`${PsAiModelType.Audio}_${PsAiModelSize.Small}`) instanceof
        AzureOpenAiChat
    );
    assert.ok(
      manager.realtimeModels.get(
        `${PsAiModelType.Realtime}_${PsAiModelSize.Small}`
      ) instanceof OpenAiRealtime
    );
    assert.equal(
      manager.modelIds.get(`${PsAiModelType.Text}_${PsAiModelSize.Small}`),
      11
    );
    assert.equal(
      manager.modelIds.get(`${PsAiModelType.Realtime}_${PsAiModelSize.Small}`),
      16
    );
    assert.equal(
      manager.models.get(`${PsAiModelType.Text}_${PsAiModelSize.Small}`)?.config
        .timeoutMs,
      3456
    );
  });

  it("skips inaccessible or unsupported configured models and fails when none remain", () => {
    useStandardResponsesEnv();
    const inaccessible = createAiModel(
      {
        type: PsAiModelType.Text,
        modelSize: PsAiModelSize.Small,
        provider: PsAiModelProvider.OpenAI,
      },
      21
    );
    const unsupported = createAiModel(
      {
        type: PsAiModelType.Text,
        modelSize: PsAiModelSize.Medium,
        provider: "unsupported-provider",
      },
      22
    );

    assert.throws(
      () =>
        new PsAiModelManager(
          [inaccessible, unsupported],
          [
            { aiModelId: 22, apiKey: "unsupported-key" },
            { aiModelId: 999, apiKey: "missing" },
          ],
          256,
          0.4,
          "medium",
          0,
          42,
          7
        ),
      /No supported AI models found/
    );
  });

  it("creates realtime sessions through the dedicated realtime model path", async () => {
    const manager = createManager({
      type: PsAiModelType.Realtime,
      modelSize: PsAiModelSize.Small,
      model: "gpt-realtime-2",
      provider: PsAiModelProvider.OpenAI,
    });

    const session = await manager.createRealtimeSession(PsAiModelSize.Small, {
      instructions: "Realtime instructions",
      outputModalities: ["audio"],
    });

    assert.equal(typeof session.connect, "function");
    assert.equal(
      manager.realtimeModelsByType.get(PsAiModelType.Realtime) instanceof
        OpenAiRealtime,
      true
    );
  });

  it("initializes single environment models for every supported provider", () => {
    const cases: Array<{
      provider: PsAiModelProvider;
      keyName: string;
      expectedClass: typeof BaseChatModel;
      extraEnv?: Record<string, string>;
    }> = [
      {
        provider: PsAiModelProvider.OpenAI,
        keyName: "OPENAI_API_KEY",
        expectedClass: OpenAiChat,
      },
      {
        provider: PsAiModelProvider.OpenAIResponses,
        keyName: "OPENAI_API_KEY",
        expectedClass: OpenAiResponses,
      },
      {
        provider: PsAiModelProvider.Anthropic,
        keyName: "ANTHROPIC_API_KEY",
        expectedClass: ClaudeChat,
      },
      {
        provider: PsAiModelProvider.Google,
        keyName: "GEMINI_API_KEY",
        expectedClass: GoogleGeminiChat,
      },
      {
        provider: PsAiModelProvider.Azure,
        keyName: "AZURE_API_KEY",
        expectedClass: AzureOpenAiChat,
        extraEnv: {
          AZURE_OPENAI_ENDPOINT: "https://example.openai.azure.com",
          PS_AI_MODEL_ENDPOINT: "https://example.openai.azure.com",
          PS_AI_MODEL_DEPLOYMENT_NAME: "env-deployment",
        },
      },
    ];

    for (const testCase of cases) {
      useStandardResponsesEnv();
      const manager = createNoopManager();
      process.env.PS_AI_MODEL_TYPE = PsAiModelType.Text;
      process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
      process.env.PS_AI_MODEL_PROVIDER = testCase.provider;
      process.env.PS_AI_MODEL_NAME = `${testCase.provider}-env-model`;
      process.env[testCase.keyName] = `${testCase.provider}-env-key`;
      for (const [key, value] of Object.entries(testCase.extraEnv ?? {})) {
        process.env[key] = value;
      }

      const model = manager.initializeOneModelFromEnv();

      assert.ok(model instanceof testCase.expectedClass);
      assert.strictEqual(manager.initializeOneModelFromEnv(), model);
      assert.equal(
        manager.modelIds.get(`${PsAiModelType.Text}_${PsAiModelSize.Small}`),
        -1
      );
    }

    useStandardResponsesEnv();
    const deepResearchManager = createNoopManager();
    process.env.PS_AI_MODEL_TYPE = PsAiModelType.TextReasoning;
    process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Large;
    process.env.PS_AI_MODEL_PROVIDER = PsAiModelProvider.Google;
    process.env.PS_AI_MODEL_NAME = "deep-research-preview-04-2026";
    process.env.GEMINI_API_KEY = "google-env-key";

    assert.ok(
      deepResearchManager.initializeOneModelFromEnv() instanceof
        GoogleGeminiDeepResearch
    );
  });

  it("rejects unsupported realtime environment model providers", () => {
    const cases: Array<{
      provider: PsAiModelProvider;
      keyName: string;
      extraEnv?: Record<string, string>;
    }> = [
      {
        provider: PsAiModelProvider.Anthropic,
        keyName: "ANTHROPIC_API_KEY",
      },
      {
        provider: PsAiModelProvider.Google,
        keyName: "GEMINI_API_KEY",
      },
      {
        provider: PsAiModelProvider.Azure,
        keyName: "AZURE_API_KEY",
        extraEnv: {
          AZURE_OPENAI_ENDPOINT: "https://example.openai.azure.com",
          PS_AI_MODEL_ENDPOINT: "https://example.openai.azure.com",
          PS_AI_MODEL_DEPLOYMENT_NAME: "env-deployment",
        },
      },
    ];

    for (const testCase of cases) {
      useStandardResponsesEnv();
      process.env.PS_AI_MODEL_TYPE = PsAiModelType.Realtime;
      process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
      process.env.PS_AI_MODEL_PROVIDER = testCase.provider;
      process.env.PS_AI_MODEL_NAME = `${testCase.provider}-realtime-env-model`;
      process.env[testCase.keyName] = `${testCase.provider}-env-key`;
      for (const [key, value] of Object.entries(testCase.extraEnv ?? {})) {
        process.env[key] = value;
      }

      assert.throws(
        () => createNoopManager(),
        new RegExp(`Unsupported realtime model provider: ${testCase.provider}`)
      );
    }
  });

  it("handles missing, incomplete, and unsupported environment model configuration", () => {
    useStandardResponsesEnv();
    let manager = createNoopManager();
    process.env.PS_AI_MODEL_TYPE = PsAiModelType.Text;
    process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
    process.env.PS_AI_MODEL_PROVIDER = PsAiModelProvider.OpenAI;
    process.env.PS_AI_MODEL_NAME = "missing-key";

    assert.equal(manager.initializeOneModelFromEnv(), undefined);

    useStandardResponsesEnv();
    manager = createNoopManager();
    process.env.PS_AI_MODEL_TYPE = PsAiModelType.Text;
    process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
    process.env.PS_AI_MODEL_PROVIDER = PsAiModelProvider.Azure;
    process.env.PS_AI_MODEL_NAME = "missing-azure-env";
    process.env.AZURE_API_KEY = "azure-key";

    assert.equal(manager.initializeOneModelFromEnv(), undefined);

    useStandardResponsesEnv();
    manager = createNoopManager();
    process.env.PS_AI_MODEL_TYPE = PsAiModelType.Text;
    process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
    process.env.PS_AI_MODEL_PROVIDER =
      "unsupported-provider" as PsAiModelProvider;
    process.env.PS_AI_MODEL_NAME = "unsupported";

    assert.throws(
      () => manager.initializeOneModelFromEnv(),
      /Unsupported model provider: unsupported-provider/
    );
  });

  it("initializes from environment when no configured models are supplied", () => {
    useStandardResponsesEnv();
    process.env.PS_AI_MODEL_TYPE = PsAiModelType.Text;
    process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
    process.env.PS_AI_MODEL_PROVIDER = PsAiModelProvider.OpenAI;
    process.env.PS_AI_MODEL_NAME = "env-only-model";
    process.env.OPENAI_API_KEY = "env-only-key";

    const manager = createNoopManager();

    assert.ok(
      manager.models.get(`${PsAiModelType.Text}_${PsAiModelSize.Small}`) instanceof
        OpenAiChat
    );
  });
});

describe("PsAiModelManager ephemeral model overrides", () => {
  it("returns undefined when no override fields are requested", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();

    assert.equal(
      await asInternals(manager).createEphemeralModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        {}
      ),
      undefined
    );
  });

  it("builds and caches stateless ephemeral models for each provider", async () => {
    useStandardResponsesEnv();
    process.env.OPENAI_API_KEY = "openai-env-key";
    process.env.ANTHROPIC_API_KEY = "anthropic-env-key";
    process.env.GOOGLE_API_KEY = "google-env-key";
    process.env.AZURE_API_KEY = "azure-env-key";
    process.env.AZURE_OPENAI_ENDPOINT = "https://example.openai.azure.com";
    process.env.PS_AI_MODEL_ENDPOINT = "https://example.openai.azure.com";
    process.env.PS_AI_MODEL_DEPLOYMENT_NAME = "override-deployment";

    const manager = createNoopManager();
    const internals = asInternals(manager);
    const fallback = new ScriptedChatModel(
      createModelConfig({
        apiKey: "fallback-key",
        modelName: "fallback-openai",
        provider: PsAiModelProvider.OpenAI,
      })
    );
    registerModel(manager, fallback);

    const openAi = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.OpenAI,
        modelName: "gpt-4o-mini-override",
        promptImages: [{ mimeType: "image/png", data: "x".repeat(500) }],
      }
    );
    const cachedOpenAi = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.OpenAI,
        modelName: "gpt-4o-mini-override",
        promptImages: [{ mimeType: "image/png", data: "x".repeat(500) }],
      }
    );
    const openAiAsResponses = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.OpenAI,
        modelName: "gpt-5.3-via-openai",
        useOpenAiResponsesIfOpenAi: true,
      }
    );
    const responses = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.OpenAIResponses,
        modelName: "gpt-5.3",
      }
    );
    const claude = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.Anthropic,
        modelName: "claude-3-haiku-20240307",
      }
    );
    const gemini = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.Google,
        modelName: "gemini-2.5-flash",
      }
    );
    const geminiThought = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.Google,
        modelName: "gemini-2.5-pro",
        useThoughtSignatures: true,
      }
    );
    const geminiDeepResearch = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.Google,
        modelName: "deep-research-max-preview-04-2026",
        useThoughtSignatures: true,
      }
    );
    const azure = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.Azure,
        modelName: "gpt-4o-azure",
      }
    );

    assert.ok(openAi instanceof OpenAiChat);
    assert.strictEqual(cachedOpenAi, openAi);
    assert.ok(openAiAsResponses instanceof OpenAiResponses);
    assert.ok(responses instanceof OpenAiResponses);
    assert.ok(claude instanceof ClaudeChat);
    assert.ok(gemini instanceof GoogleGeminiChat);
    assert.ok(geminiThought instanceof GoogleGeminiThought);
    assert.ok(geminiDeepResearch instanceof GoogleGeminiDeepResearch);
    assert.ok(azure instanceof AzureOpenAiChat);
    assert.equal(openAi?.config.apiKey, "openai-env-key");
    assert.equal(claude?.config.apiKey, "anthropic-env-key");
    assert.equal(gemini?.config.apiKey, "google-env-key");
    assert.equal(azure?.config.apiKey, "azure-env-key");
  });

  it("uses type fallback and fallback API keys for context-only overrides", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const internals = asInternals(manager);
    const fallback = new ScriptedChatModel(
      createModelConfig({
        apiKey: "fallback-context-key",
        modelName: "type-fallback-openai",
        modelSize: PsAiModelSize.Medium,
        inferenceType: "flex",
        regionalProcessing: undefined,
      })
    );
    registerModel(
      manager,
      fallback,
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      303
    );

    const model = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        regionalProcessing: "eu",
        inferenceType: "priority",
        modelTemperature: 0.15,
        maxTokensOut: 1024,
        modelMaxThinkingTokens: 4096,
        modelReasoningEffort: "high",
        modelReasoningMode: "pro",
        modelType: PsAiModelType.TextReasoning,
      }
    );

    assert.ok(model instanceof OpenAiChat);
    assert.equal(model.config.apiKey, "fallback-context-key");
    assert.equal(model.config.modelName, "type-fallback-openai");
    assert.equal(model.config.regionalProcessing, "eu");
    assert.equal(model.config.inferenceType, "priority");
    assert.equal(model.config.temperature, 0.15);
    assert.equal(model.config.maxTokensOut, 1024);
    assert.equal(model.config.maxThinkingTokens, 4096);
    assert.equal(model.config.reasoningEffort, "high");
    assert.equal(model.config.reasoningMode, "pro");
    assert.equal(model.config.modelType, PsAiModelType.TextReasoning);
  });

  it("creates an ephemeral model for a mode-only Responses call override", async () => {
    useStandardResponsesEnv();
    const manager = createManager({ model: "gpt-5.6" });
    const internals = asInternals(manager);

    const model = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      {
        modelReasoningMode: "pro",
      }
    );

    assert.ok(model instanceof OpenAiResponses);
    assert.equal(model.config.reasoningMode, "pro");
  });

  it("uses normal size fallback selection for a mode-only Responses override", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const internals = asInternals(manager);
    const largeModel = new OpenAiResponses(
      createModelConfig({
        apiKey: "large-key",
        provider: PsAiModelProvider.OpenAIResponses,
        modelName: "gpt-5.6-large",
        modelType: PsAiModelType.TextReasoning,
        modelSize: PsAiModelSize.Large,
      }) as PsOpenAiModelConfig
    );
    const smallModel = new OpenAiResponses(
      createModelConfig({
        apiKey: "small-key",
        provider: PsAiModelProvider.OpenAIResponses,
        modelName: "gpt-5.6-small",
        modelType: PsAiModelType.TextReasoning,
        modelSize: PsAiModelSize.Small,
      }) as PsOpenAiModelConfig
    );

    registerModel(
      manager,
      largeModel,
      PsAiModelType.TextReasoning,
      PsAiModelSize.Large,
      501
    );
    registerModel(
      manager,
      smallModel,
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      502
    );

    const model = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Medium,
      { modelReasoningMode: "pro" }
    );

    assert.ok(model instanceof OpenAiResponses);
    assert.equal(model.config.modelName, "gpt-5.6-large");
    assert.equal(model.config.modelSize, PsAiModelSize.Large);
    assert.equal(model.dbModelId, 501);

    let captured: RecordedResponsesRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-size-fallback",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "large fallback" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await manager.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Medium,
      [{ role: "user", message: "hello" }],
      { modelReasoningMode: "pro" }
    );

    assert.equal(result, "large fallback");
    assert.equal(captured?.reasoning?.mode, "pro");
  });

  it("falls back to environment models and rejects unsupported ephemeral providers", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const internals = asInternals(manager);
    process.env.PS_AI_MODEL_TYPE = PsAiModelType.Text;
    process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
    process.env.PS_AI_MODEL_PROVIDER = PsAiModelProvider.OpenAI;
    process.env.PS_AI_MODEL_NAME = "env-fallback";
    process.env.OPENAI_API_KEY = "env-fallback-key";

    const envBased = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.OpenAI,
        modelName: "override-from-env-fallback",
      }
    );

    assert.ok(envBased instanceof OpenAiChat);

    const unsupported = await internals.createEphemeralModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        modelProvider: "unsupported-provider" as PsAiModelProvider,
        modelName: "unsupported",
      }
    );

    assert.equal(unsupported, undefined);
  });

  it("returns undefined for context-only overrides when no fallback can be initialized", async () => {
    useStandardResponsesEnv();
    process.env.PS_AI_MODEL_TYPE = PsAiModelType.Text;
    process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
    process.env.PS_AI_MODEL_PROVIDER = PsAiModelProvider.OpenAI;
    process.env.PS_AI_MODEL_NAME = "env-without-key";
    const manager = createNoopManager();

    assert.equal(
      await asInternals(manager).createEphemeralModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        { inferenceType: "priority" }
      ),
      undefined
    );
  });

  it("continues ephemeral creation when database lookup misses or fails", async () => {
    useStandardResponsesEnv();
    delete process.env.DISABLE_DB_INIT;
    process.env.OPENAI_API_KEY = "db-miss-key";

    const { PsAiModel } = await import("../../dbModels/aiModel.js");
    const originalFindOne = Reflect.get(PsAiModel, "findOne");

    try {
      const manager = createNoopManager();
      const fallback = new ScriptedChatModel(createModelConfig());
      registerModel(manager, fallback);

      Reflect.set(PsAiModel, "findOne", async () => null);
      const missingDbModel = await asInternals(manager).createEphemeralModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        {
          modelProvider: PsAiModelProvider.OpenAI,
          modelName: "not-in-db",
        }
      );
      assert.ok(missingDbModel instanceof OpenAiChat);

      Reflect.set(PsAiModel, "findOne", async () => {
        throw new Error("db lookup failed");
      });
      const failedLookupModel = await asInternals(manager).createEphemeralModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        {
          modelProvider: PsAiModelProvider.OpenAI,
          modelName: "db-throws",
        }
      );
      assert.ok(failedLookupModel instanceof OpenAiChat);
    } finally {
      Reflect.set(PsAiModel, "findOne", originalFindOne);
    }
  });

  it("resolves provider API keys from environment variables", () => {
    useStandardResponsesEnv();
    process.env.OPENAI_API_KEY = "openai-key";
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    process.env.GEMINI_API_KEY = "gemini-key";
    process.env.AZURE_API_KEY = "azure-key";
    const internals = asInternals(createNoopManager());

    assert.equal(
      internals.getApiKeyForProvider(PsAiModelProvider.OpenAIResponses),
      "openai-key"
    );
    assert.equal(
      internals.getApiKeyForProvider(PsAiModelProvider.Anthropic),
      "anthropic-key"
    );
    assert.equal(
      internals.getApiKeyForProvider(PsAiModelProvider.Google),
      "gemini-key"
    );
    assert.equal(
      internals.getApiKeyForProvider(PsAiModelProvider.Azure),
      "azure-key"
    );
    assert.equal(internals.getApiKeyForProvider("unknown"), "");
  });
});

describe("PsAiModelManager error helpers", () => {
  it("normalizes status and message fields from provider error shapes", () => {
    const circularMessage: Record<string, unknown> = {};
    circularMessage.self = circularMessage;

    assert.equal(
      PsAiModelManager.getErrorStatus({
        response: { status: "403" },
      }),
      403
    );
    assert.equal(PsAiModelManager.getErrorStatus({ code: "429" }), 429);
    assert.equal(PsAiModelManager.getErrorStatus({ status: "not-a-code" }), undefined);
    assert.equal(PsAiModelManager.getErrorStatus({ status: Infinity }), undefined);
    assert.equal(PsAiModelManager.getErrorStatus({}), undefined);
    assert.equal(
      PsAiModelManager.getErrorMessage({
        response: {
          data: {
            error: {
              message: "API key not valid",
            },
          },
        },
      }),
      "API key not valid"
    );
    assert.equal(
      PsAiModelManager.getErrorMessage({
        response: {
          data: {
            message: "Missing parameter: input",
          },
        },
      }),
      "Missing parameter: input"
    );
    assert.equal(
      PsAiModelManager.getErrorMessage({
        response: { data: { code: "bad_request" } },
      }),
      '{"code":"bad_request"}'
    );
    assert.equal(
      PsAiModelManager.getErrorMessage({
        response: { data: circularMessage },
      }),
      "[object Object]"
    );
    assert.equal(PsAiModelManager.getErrorMessage({ message: "plain" }), "plain");
    assert.equal(PsAiModelManager.getErrorMessage({}), "");
  });

  it("classifies provider authentication, missing parameter, and policy errors", () => {
    assert.equal(
      PsAiModelManager.isProviderAuthenticationError({
        status: 401,
        message: "Invalid API key",
      }),
      true
    );
    assert.equal(
      PsAiModelManager.isProviderAuthenticationError({
        status: 500,
        message: "Invalid API key",
      }),
      false
    );
    assert.equal(
      PsAiModelManager.isProviderAuthenticationError({
        message: "Unauthorized request",
      }),
      true
    );
    assert.equal(
      PsAiModelManager.isMissingParameterError({
        response: {
          status: 400,
          data: { message: "Missing parameter: messages" },
        },
      }),
      true
    );
    assert.equal(
      PsAiModelManager.general400Error({ message: "400 Bad Request" }),
      true
    );
    assert.equal(PsAiModelManager.general400Error({ message: "500" }), false);
    assert.equal(
      PsAiModelManager.isProhibitedContentError({
        message: "Response was blocked due to prohibited_content",
      }),
      true
    );
    assert.equal(
      PsAiModelManager.isProhibitedContentError({
        message: "ordinary provider failure",
      }),
      false
    );
  });
});

describe("PsAiModelManager utility routing", () => {
  it("derives request options with the transport timeout", () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const internals = asInternals(manager);
    const builtInTools: PsBuiltInTool[] = [
      { type: "code_interpreter", memoryLimit: "1g" },
    ];
    const geminiDeepResearchConfig: PsGeminiDeepResearchConfig = {
      type: "deep-research",
      thinking_summaries: "auto",
      visualization: "auto",
      enable_bigquery_tool: true,
    };
    const multiAgent: PsOpenAiResponsesMultiAgentOptions = {
      enabled: true,
      maxConcurrentSubagents: 3,
    };

    assert.deepEqual(internals.getModelRequestOptions({}, 12_345), {
      timeoutMs: 12_345,
    });
    assert.deepEqual(
      internals.getModelRequestOptions(
        {
          safetyIdentifier: "safety-user",
          responsesStateKey: "research-thread",
          geminiRegions: ["us-central1", "europe-west1"],
          geminiDeepResearchConfig,
          geminiDeepResearchStateKey: "gemini-thread",
          builtInTools,
          multiAgent,
          store: false,
          textFormat: { type: "json_object" },
          promptCacheKey: "cache-key",
          promptCacheRetention: "24h",
          metadata: { workflow: "manager" },
          moderation: { mode: "auto" },
          topP: 0.8,
          truncation: "auto",
          parallelToolCalls: false,
          maxToolCalls: 3,
          include: ["reasoning.encrypted_content"],
        },
        67_890
      ),
      {
        timeoutMs: 67_890,
        safetyIdentifier: "safety-user",
        responsesStateKey: "research-thread",
        geminiRegions: ["us-central1", "europe-west1"],
        geminiDeepResearchConfig,
        geminiDeepResearchStateKey: "gemini-thread",
        builtInTools,
        multiAgent,
        store: false,
        textFormat: { type: "json_object" },
        promptCache: { key: "cache-key", retention: "24h" },
        promptCacheKey: "cache-key",
        promptCacheRetention: "24h",
        metadata: { workflow: "manager" },
        moderation: { mode: "auto" },
        topP: 0.8,
        truncation: "auto",
        parallelToolCalls: false,
        maxToolCalls: 3,
        include: ["reasoning.encrypted_content"],
      }
    );
    assert.deepEqual(
      internals.getModelRequestOptions({ builtInTools }, 22_000),
      {
        timeoutMs: 22_000,
        builtInTools,
      }
    );
    assert.deepEqual(
      internals.getModelRequestOptions(
        { useOpenAiResponsesBackground: true },
        33_000
      ),
      {
        timeoutMs: 33_000,
        useOpenAiResponsesBackground: true,
      }
    );
    assert.deepEqual(
      internals.getModelRequestOptions(
        { deleteOpenAiResponsesAfterIdleMinutes: 45 },
        15_000
      ),
      {
        timeoutMs: 15_000,
        deleteOpenAiResponsesAfterIdleMinutes: 45,
      }
    );
    assert.deepEqual(
      internals.getModelRequestOptions(
        {
          deleteOpenAiResponsesAfterIdleMinutes: 45,
          safetyIdentifier: "cleanup-user",
        },
        15_000
      ),
      {
        timeoutMs: 15_000,
        safetyIdentifier: "cleanup-user",
        deleteOpenAiResponsesAfterIdleMinutes: 45,
        responsesStateKey: "cleanup-user",
      }
    );
    assert.deepEqual(
      internals.getModelRequestOptions(
        { deleteOpenAiResponsesAfterIdleMinutes: Infinity },
        15_000
      ),
      {
        timeoutMs: 15_000,
      }
    );
    assert.equal(
      internals.getResponsesStateKey({
        responsesStateKey: "  conversation-1  ",
        safetyIdentifier: "fallback-user",
      }),
      "conversation-1"
    );
    assert.equal(
      internals.getResponsesStateKey({
        safetyIdentifier: "  fallback-user  ",
      }),
      "fallback-user"
    );
    assert.equal(
      internals.getResponsesStateKey({
        deleteOpenAiResponsesAfterIdleMinutes: 45,
      }),
      undefined
    );
    assert.equal(
      internals.getResponsesStateKey({
        deleteOpenAiResponsesAfterIdleMinutes: 0,
      }),
      undefined
    );
  });

  it("keeps DB model aliases separate from provider API model names", () => {
    const manager = createManager({
      model: "gpt-5.5-flex",
      apiModel: "gpt-5.5",
      inferenceType: "flex",
    });
    const internals = asInternals(manager);
    const model = internals.modelsByType.get(PsAiModelType.TextReasoning);

    assert.ok(model instanceof OpenAiResponses);
    assert.equal(model.modelName, "gpt-5.5-flex");
    assert.equal(model.getCloneConfig().modelName, "gpt-5.5-flex");
    assert.equal(model.getCloneConfig().apiModelName, "gpt-5.5");
    assert.equal(model.config.inferenceType, "flex");
  });

  it("preserves configured API aliases when an override selects the same logical model", async () => {
    useStandardResponsesEnv();
    const manager = createManager({
      model: "gpt-5.5-flex",
      apiModel: "gpt-5.5",
      inferenceType: "flex",
    });
    const internals = asInternals(manager);

    const model = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      {
        modelProvider: PsAiModelProvider.OpenAIResponses,
        modelName: "gpt-5.5-flex",
      }
    );

    assert.ok(model instanceof OpenAiResponses);
    assert.equal(model.config.modelName, "gpt-5.5-flex");
    assert.equal(model.config.apiModelName, "gpt-5.5");
    assert.equal(model.config.inferenceType, "flex");
  });

  it("propagates streaming, media, tools, allowed tools, and request options to model calls", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const internals = asInternals(manager);
    const callback = (_chunk: string) => undefined;
    const builtInTools: PsBuiltInTool[] = [
      {
        type: "web_search",
        searchContextSize: "low",
      },
    ];
    const tools: ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "lookup",
          description: "Lookup data",
          parameters: { type: "object" },
        },
      },
    ];
    const model = new ScriptedChatModel(createModelConfig(), [
      createModelResult("ok"),
    ]);

    await internals.callWithTimeout(
      model,
      [{ role: "user", message: "hello" }],
      callback,
      1000,
      [{ mimeType: "image/png", data: "abc" }],
      tools,
      { type: "function", function: { name: "lookup" } },
      ["lookup"],
      {
        safetyIdentifier: "safe",
        geminiRegions: ["us-central1"],
        builtInTools,
        store: false,
        include: ["reasoning.encrypted_content"],
      }
    );

    assert.equal(model.calls.length, 1);
    assert.equal(model.calls[0].streaming, true);
    assert.strictEqual(model.calls[0].streamingCallback, callback);
    assert.deepEqual(model.calls[0].media, [
      { mimeType: "image/png", data: "abc" },
    ]);
    assert.strictEqual(model.calls[0].tools, tools);
    assert.deepEqual(model.calls[0].toolChoice, {
      type: "function",
      function: { name: "lookup" },
    });
    assert.deepEqual(model.calls[0].allowedTools, ["lookup"]);
    assert.deepEqual(model.calls[0].requestOptions, {
      safetyIdentifier: "safe",
      geminiRegions: ["us-central1"],
      builtInTools,
      store: false,
      include: ["reasoning.encrypted_content"],
    });
  });

  it("dispatches unsupported model types and unimplemented non-text models explicitly", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const message: PsModelMessage[] = [{ role: "user", message: "hello" }];

    assert.equal(
      await manager.callModel(
        PsAiModelType.Embedding,
        PsAiModelSize.Small,
        [{ role: "user", message: "embed me" }],
        {}
      ),
      null
    );
    for (const modelType of [
      PsAiModelType.MultiModal,
      PsAiModelType.Audio,
      PsAiModelType.Video,
      PsAiModelType.Image,
    ]) {
      assert.equal(
        await manager.callModel(modelType, PsAiModelSize.Small, message, {}),
        null
      );
    }
    await assert.rejects(
      () =>
        manager.callModel(
          "unsupported" as PsAiModelType,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          {}
        ),
      /Unsupported model type: unsupported/
    );
  });
});

describe("PsAiModelManager text model calls", () => {
  it("falls back from requested size to an available size and trims text output", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const model = new ScriptedChatModel(
      createModelConfig({
        modelSize: PsAiModelSize.Medium,
        modelName: "medium-model",
      }),
      [createModelResult("  medium result  ", { cachedInTokens: 1 })]
    );
    registerModel(
      manager,
      model,
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      202
    );

    const result = await manager.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [{ role: "user", message: "hello" }],
      {}
    );

    assert.equal(result, "medium result");
    assert.equal(model.calls.length, 1);
    assert.equal(manager.usageItemCalls.length, 1);
    assert.equal(manager.usageItemCalls[0][0].modelSize, PsAiModelSize.Medium);
    assert.equal(manager.usageItemCalls[0][0].cachedInTokens, 1);
  });

  it("handles exact, default-size, type-only, and missing text model selection", async () => {
    useStandardResponsesEnv();

    const largeManager = createNoopManager();
    const largeModel = new ScriptedChatModel(
      createModelConfig({
        modelSize: PsAiModelSize.Large,
        modelName: "large-model",
      }),
      [createModelResult("large result")]
    );
    registerModel(
      largeManager,
      largeModel,
      PsAiModelType.Text,
      PsAiModelSize.Large
    );
    assert.equal(
      await largeManager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Large,
        [{ role: "user", message: "hello" }],
        {}
      ),
      "large result"
    );

    const mediumPriorityManager = createNoopManager();
    const mediumPriorityModel = new ScriptedChatModel(
      createModelConfig({
        modelSize: PsAiModelSize.Medium,
        modelName: "medium-priority-model",
      }),
      [createModelResult("medium priority result")]
    );
    registerModel(
      mediumPriorityManager,
      mediumPriorityModel,
      PsAiModelType.Text,
      PsAiModelSize.Medium
    );
    assert.equal(
      await mediumPriorityManager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Medium,
        [{ role: "user", message: "hello" }],
        {}
      ),
      "medium priority result"
    );

    const defaultPriorityManager = createNoopManager();
    const mediumModel = new ScriptedChatModel(
      createModelConfig({
        modelSize: PsAiModelSize.Medium,
        modelName: "medium-default-model",
      }),
      [createModelResult("medium default result")]
    );
    registerModel(
      defaultPriorityManager,
      mediumModel,
      PsAiModelType.Text,
      PsAiModelSize.Medium
    );
    assert.equal(
      await defaultPriorityManager.callTextModel(
        PsAiModelType.Text,
        "default-size" as PsAiModelSize,
        [{ role: "user", message: "hello" }],
        {}
      ),
      "medium default result"
    );

    const typeOnlyManager = createNoopManager();
    const typeOnlyModel = new ScriptedChatModel(
      createModelConfig({
        modelSize: PsAiModelSize.Medium,
        modelName: "type-only-model",
      }),
      [createModelResult("type-only result")]
    );
    typeOnlyManager.modelsByType.set(PsAiModelType.Text, typeOnlyModel);
    assert.equal(
      await typeOnlyManager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "hello" }],
        {}
      ),
      "type-only result"
    );

    const missingManager = createNoopManager();
    await assert.rejects(
      () =>
        missingManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          {}
        ),
      /No model available for type text/
    );
  });

  it("runs ephemeral text models with their own type and size metadata", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const internals = asInternals(manager);
    const ephemeral = new ScriptedChatModel(
      createModelConfig({
        modelName: "ephemeral-runner",
        modelType: PsAiModelType.TextReasoning,
        modelSize: PsAiModelSize.Medium,
      }),
      [createModelResult("ephemeral result")]
    );

    Reflect.set(
      internals,
      "createEphemeralModel",
      async () => ephemeral
    );

    assert.equal(
      await manager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "hello" }],
        {
          modelProvider: PsAiModelProvider.OpenAI,
          modelName: "ephemeral-runner",
        }
      ),
      "ephemeral result"
    );
    assert.equal(
      manager.usageItemCalls[0][0].modelType,
      PsAiModelType.TextReasoning
    );
    assert.equal(manager.usageItemCalls[0][0].modelSize, PsAiModelSize.Medium);
  });

  it("returns full base model results with trimmed content when requested", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const model = new ScriptedChatModel(createModelConfig(), [
      createModelResult("  phased result  ", {
        phase: "final_answer",
        reasoningTokens: 4,
      }),
    ]);
    registerModel(manager, model);

    const result = await manager.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [{ role: "user", message: "hello" }],
      { returnBaseModelResult: true }
    );

    assert.deepEqual(result, {
      content: "phased result",
      tokensIn: 3,
      tokensOut: 2,
      phase: "final_answer",
      reasoningTokens: 4,
    });
  });

  it("collapses tool calls and parses stringified empty arrays", async () => {
    useStandardResponsesEnv();
    const toolManager = createNoopManager();
    const toolModel = new ScriptedChatModel(createModelConfig(), [
      createModelResult("", {
        toolCalls: [
          {
            id: "call-1",
            name: "lookup",
            arguments: { id: 1 },
          },
        ],
      }),
    ]);
    registerModel(toolManager, toolModel);

    assert.deepEqual(
      await toolManager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "hello" }],
        {}
      ),
      {
        toolCalls: [
          {
            id: "call-1",
            name: "lookup",
            arguments: { id: 1 },
          },
        ],
      }
    );

    const jsonManager = createNoopManager();
    const jsonModel = new ScriptedChatModel(createModelConfig(), [
      createModelResult('"[]"'),
    ]);
    registerModel(jsonManager, jsonModel);

    assert.deepEqual(
      await jsonManager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "json please" }],
        { parseJson: true }
      ),
      []
    );

    for (const content of [JSON.stringify('"[]"'), JSON.stringify("'[]'")]) {
      const variantManager = createNoopManager();
      const variantModel = new ScriptedChatModel(createModelConfig(), [
        createModelResult(content),
      ]);
      registerModel(variantManager, variantModel);

      assert.deepEqual(
        await variantManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "json variant please" }],
          { parseJson: true }
        ),
        []
      );
    }
  });

  it("retries JSON parse failures and uses a later valid response", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const internals = asInternals(manager);
    Reflect.set(
      internals,
      "sleepBeforeRetry",
      async (_retryCount: number) => undefined
    );
    const model = new ScriptedChatModel(createModelConfig(), [
      createModelResult("{foo: true false}"),
      createModelResult('{"ok":true}'),
    ]);
    registerModel(manager, model);

    const result = await manager.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [{ role: "user", message: "json please" }],
      { parseJson: true }
    );

    assert.deepEqual(result, { ok: true });
    assert.equal(model.calls.length, 2);
  });

  it("retries empty results and throws after empty responses exhaust retries", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    disableRetrySleep(manager);
    const model = new ScriptedChatModel(createModelConfig(), [
      undefined,
      createModelResult("after empty"),
    ]);
    registerModel(manager, model);

    assert.equal(
      await manager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "hello" }],
        { overrideMaxRetries: 3 }
      ),
      "after empty"
    );
    assert.equal(model.calls.length, 2);

    const failingManager = createNoopManager();
    disableRetrySleep(failingManager);
    const failingModel = new ScriptedChatModel(createModelConfig(), [
      undefined,
      undefined,
    ]);
    registerModel(failingManager, failingModel);

    await assert.rejects(
      () =>
        failingManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          { overrideMaxRetries: 2 }
        ),
      /Model call failed after maximum retries/
    );
  });

  it("surfaces non-retryable model errors without retries or fallback", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    disableRetrySleep(manager);
    const manualActionError = new GeminiDeepResearchRequiresActionError(
      "interaction-manual",
      "manual plan approval required"
    );
    const model = new ScriptedChatModel(
      createModelConfig({ modelName: "manual-action-model" }),
      [],
      [manualActionError]
    );
    registerModel(manager, model);

    await assert.rejects(
      () =>
        manager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "research" }],
          {
            overrideMaxRetries: 3,
            fallbackModelProvider: PsAiModelProvider.OpenAI,
            fallbackModelName: "fallback-should-not-run",
          }
        ),
      (error: unknown) => {
        assert.strictEqual(error, manualActionError);
        return true;
      }
    );
    assert.equal(model.calls.length, 1);
  });

  it("retries detailed 5xx failures before succeeding", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    disableRetrySleep(manager);
    const serverError = Object.assign(new Error("503 service unavailable"), {
      response: {
        status: 503,
        statusText: "Unavailable",
        data: { error: "busy" },
        headers: { "x-request-id": "req-1" },
      },
    });
    serverError.stack = "stack trace for coverage";
    const model = new ScriptedChatModel(
      createModelConfig({ modelName: "server-error-model" }),
      [createModelResult("after retry")],
      [serverError]
    );
    registerModel(manager, model);

    assert.equal(
      await manager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "<Prompt>hello</Prompt>" }],
        { overrideMaxRetries: 3 }
      ),
      "after retry"
    );
    assert.equal(model.calls.length, 2);

    const loggingFailureManager = createNoopManager();
    disableRetrySleep(loggingFailureManager);
    const loggingFailureModel = new ScriptedChatModel(
      createModelConfig({ modelName: "logging-failure-model" }),
      [createModelResult("after logging failure")],
      [Object.assign(new Error("fetch failed"), { status: 503 })]
    );
    Reflect.set(loggingFailureModel, "prettyPrintPromptMessages", () => {
      throw new Error("pretty print failed");
    });
    registerModel(loggingFailureManager, loggingFailureModel);

    assert.equal(
      await loggingFailureManager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "hello" }],
        { overrideMaxRetries: 3 }
      ),
      "after logging failure"
    );
  });

  it("treats alternate transient provider failures as retryable 5xx errors", async () => {
    useStandardResponsesEnv();

    const transientErrors = [
      Object.assign(new Error("provider unavailable"), { status: "503" }),
      new Error("provider returned 529 while overloaded"),
      Object.assign(new Error("socket terminated"), {
        cause: { code: "UND_ERR_SOCKET" },
      }),
      new Error("network error from fetch failed"),
    ];

    for (const transientError of transientErrors) {
      const manager = createNoopManager();
      disableRetrySleep(manager);
      const model = new ScriptedChatModel(
        createModelConfig({ modelName: "transient-error-model" }),
        [],
        [transientError]
      );
      registerModel(manager, model);

      await assert.rejects(
        () =>
          manager.callModel(
            PsAiModelType.Text,
            PsAiModelSize.Small,
            [{ role: "user", message: "hello" }],
            { overrideMaxRetries: 1 }
          ),
        /Model call failed after maximum retries/
      );
      assert.equal(model.calls.length, 1);
    }
  });

  it("throws missing parameters, provider auth without fallback, and repeated 400s", async () => {
    useStandardResponsesEnv();

    const missingParameterManager = createNoopManager();
    const missingParameterModel = new ScriptedChatModel(
      createModelConfig(),
      [],
      [
        Object.assign(new Error("Missing parameter: messages"), {
          status: 400,
        }),
      ]
    );
    registerModel(missingParameterManager, missingParameterModel);
    await assert.rejects(
      () =>
        missingParameterManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          {}
        ),
      /Missing parameter/
    );

    const authManager = createNoopManager();
    const authModel = new ScriptedChatModel(
      createModelConfig(),
      [],
      [Object.assign(new Error("Unauthorized"), { status: 401 })]
    );
    registerModel(authManager, authModel);
    await assert.rejects(
      () =>
        authManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          {}
        ),
      /Unauthorized/
    );

    const repeated400Manager = createNoopManager();
    disableRetrySleep(repeated400Manager);
    const repeated400Model = new ScriptedChatModel(
      createModelConfig(),
      [],
      [
        Object.assign(new Error("429 slow down"), { status: 429 }),
        Object.assign(new Error("429 slow down"), { status: 429 }),
        Object.assign(new Error("400 Bad Request"), { status: 400 }),
      ]
    );
    registerModel(repeated400Manager, repeated400Model);
    await assert.rejects(
      () =>
        repeated400Manager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          { overrideMaxRetries: 4 }
        ),
      /400 Bad Request/
    );
  });

  it("uses TokenLimitChunker for retryable token errors and rethrows disabled token retries", async () => {
    useStandardResponsesEnv();
    const tokenError = Object.assign(
      new Error("maximum context length exceeded"),
      { code: "context_length_exceeded" }
    );
    const originalHandle = TokenLimitChunker.prototype.handle;
    Reflect.set(
      TokenLimitChunker.prototype,
      "handle",
      async () => "chunked result"
    );

    try {
      const chunkingManager = createNoopManager();
      const chunkingModel = new ScriptedChatModel(
        createModelConfig({ modelName: "chunking-model" }),
        [],
        [tokenError]
      );
      registerModel(chunkingManager, chunkingModel);

      assert.equal(
        await chunkingManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "long prompt" }],
          {}
        ),
        "chunked result"
      );
    } finally {
      Reflect.set(TokenLimitChunker.prototype, "handle", originalHandle);
    }

    const disabledManager = createNoopManager();
    const disabledModel = new ScriptedChatModel(
      createModelConfig({ modelName: "disabled-token-model" }),
      [],
      [tokenError]
    );
    registerModel(disabledManager, disabledModel);
    await assert.rejects(
      () =>
        disabledManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "long prompt" }],
          { disableChunkingRetry: true }
        ),
      /maximum context length/
    );

    const responsesManager = createManager();
    const responsesModel = responsesManager.modelsByType.get(
      PsAiModelType.TextReasoning
    );
    assert.ok(responsesModel instanceof OpenAiResponses);
    Reflect.set(responsesModel, "generate", async () => {
      throw tokenError;
    });
    await assert.rejects(
      () =>
        responsesManager.callModel(
          PsAiModelType.TextReasoning,
          PsAiModelSize.Small,
          [{ role: "user", message: "long prompt" }],
          {}
        ),
      /maximum context length/
    );
  });

  it("throws after repeated JSON parse failures reach the fixed retry limit", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    disableRetrySleep(manager);
    const model = new ScriptedChatModel(createModelConfig(), [
      createModelResult("{foo: true false}"),
      createModelResult("{foo: true false}"),
      createModelResult("{foo: true false}"),
      createModelResult("{foo: true false}"),
    ]);
    registerModel(manager, model);

    await assert.rejects(
      () =>
        manager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "json please" }],
          { parseJson: true, overrideMaxRetries: 5 }
        ),
      /JSON parse failure, max retries reached/
    );
  });

  it("falls back after too many 429s or too many limited retries", async () => {
    useStandardResponsesEnv();

    const rateLimitManager = createNoopManager();
    disableRetrySleep(rateLimitManager);
    const rateLimitInternals = asInternals(rateLimitManager);
    const rateLimitPrimary = new ScriptedChatModel(
      createModelConfig({ modelName: "rate-limit-primary" }),
      [],
      [Object.assign(new Error("429 rate limited"), { status: 429 })]
    );
    const rateLimitFallback = new ScriptedChatModel(
      createModelConfig({ modelName: "rate-limit-fallback" }),
      [createModelResult("rate-limit fallback")]
    );
    registerModel(rateLimitManager, rateLimitPrimary);
    Reflect.set(
      rateLimitInternals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "rate-limit-fallback"
          ? rateLimitFallback
          : undefined
    );

    assert.equal(
      await rateLimitManager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "hello" }],
        {
          fallbackModelProvider: PsAiModelProvider.OpenAI,
          fallbackModelName: "rate-limit-fallback",
          retryLimitFor429sUntilFallback: 0,
        }
      ),
      "rate-limit fallback"
    );

    const retryLimitManager = createNoopManager();
    disableRetrySleep(retryLimitManager);
    const retryLimitInternals = asInternals(retryLimitManager);
    const retryLimitPrimary = new ScriptedChatModel(
      createModelConfig({ modelName: "retry-limit-primary" }),
      [],
      [
        new Error("plain retryable failure"),
        new Error("plain retryable failure"),
        new Error("plain retryable failure"),
        new Error("plain retryable failure"),
        new Error("plain retryable failure"),
      ]
    );
    const retryLimitFallback = new ScriptedChatModel(
      createModelConfig({ modelName: "retry-limit-fallback" }),
      [createModelResult("retry-limit fallback")]
    );
    registerModel(retryLimitManager, retryLimitPrimary);
    Reflect.set(
      retryLimitInternals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "retry-limit-fallback"
          ? retryLimitFallback
          : undefined
    );

    assert.equal(
      await retryLimitManager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "hello" }],
        {
          limitedRetries: true,
          fallbackModelProvider: PsAiModelProvider.OpenAI,
          fallbackModelName: "retry-limit-fallback",
        }
      ),
      "retry-limit fallback"
    );
  });

  it("logs prompt debug output and rethrows unrecoverable non-rate-limit errors", async () => {
    useStandardResponsesEnv();
    process.env.PS_PROMPT_DEBUG = "true";
    const manager = createNoopManager();
    disableRetrySleep(manager);
    const model = new ScriptedChatModel(
      createModelConfig({ modelName: "unrecoverable-model" }),
      [],
      [new Error("plain terminal failure")]
    );
    registerModel(manager, model);

    await assert.rejects(
      () =>
        manager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          { overrideMaxRetries: 1 }
        ),
      /plain terminal failure/
    );
  });

  it("uses an explicit fallback model after provider authentication errors", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const internals = asInternals(manager);
    const primary = new ScriptedChatModel(
      createModelConfig({ modelName: "primary-model" }),
      [],
      [Object.assign(new Error("Invalid API key"), { status: 401 })]
    );
    const fallback = new ScriptedChatModel(
      createModelConfig({
        modelName: "fallback-model",
        modelSize: PsAiModelSize.Medium,
      }),
      [createModelResult("  fallback result  ")]
    );
    registerModel(manager, primary);
    Reflect.set(
      internals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelProvider === PsAiModelProvider.OpenAI &&
        options.modelName === "fallback-model"
          ? fallback
          : undefined
    );

    const result = await manager.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [{ role: "user", message: "hello" }],
      {
        fallbackModelProvider: PsAiModelProvider.OpenAI,
        fallbackModelName: "fallback-model",
      }
    );

    assert.equal(result, "fallback result");
    assert.equal(primary.calls.length, 1);
    assert.equal(fallback.calls.length, 1);
    assert.equal(manager.usageCalls[0][0], "fallback-model");
  });

  it("retries fallback model timeouts with the same retry settings", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const internals = asInternals(manager);
    const primary = new ScriptedChatModel(
      createModelConfig({ modelName: "timeout-primary-model" }),
      [],
      [Object.assign(new Error("Invalid API key"), { status: 401 })]
    );
    const fallback = new NeverCompletingFirstAttemptModel(
      createModelConfig({
        modelName: "timeout-fallback-model",
        timeoutMs: 1000,
      })
    );
    registerModel(manager, primary);
    Reflect.set(
      internals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelProvider === PsAiModelProvider.OpenAI &&
        options.modelName === "timeout-fallback-model"
          ? fallback
          : undefined
    );

    const result = await manager.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [{ role: "user", message: "hello" }],
      {
        forceTimeoutAndRetryMs: 10,
        overrideMaxRetries: 2,
        fallbackModelProvider: PsAiModelProvider.OpenAI,
        fallbackModelName: "timeout-fallback-model",
      }
    );

    assert.equal(result, "second attempt");
    assert.equal(primary.calls.length, 1);
    assert.equal(fallback.generateCalls, 2);
  });

  it("does not inherit the limited retry budget for fallback timeouts", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    disableRetrySleep(manager);
    const internals = asInternals(manager);
    const primary = new ScriptedChatModel(
      createModelConfig({ modelName: "limited-timeout-primary" }),
      [],
      [Object.assign(new Error("Invalid API key"), { status: 401 })]
    );
    const timeoutError = new Error("Model call timed out");
    const fallback = new ScriptedChatModel(
      createModelConfig({ modelName: "limited-timeout-fallback" }),
      [createModelResult("fallback recovered")],
      [
        timeoutError,
        new Error("Model call timed out"),
        new Error("Model call timed out"),
        new Error("Model call timed out"),
        new Error("Model call timed out"),
      ]
    );
    registerModel(manager, primary);
    Reflect.set(
      internals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "limited-timeout-fallback"
          ? fallback
          : undefined
    );

    const result = await manager.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [{ role: "user", message: "hello" }],
      {
        limitedRetries: true,
        fallbackModelProvider: PsAiModelProvider.OpenAI,
        fallbackModelName: "limited-timeout-fallback",
      }
    );

    assert.equal(result, "fallback recovered");
    assert.equal(primary.calls.length, 1);
    assert.equal(fallback.calls.length, 6);
  });

  it("preserves limited retry budget for non-timeout fallback failures", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    disableRetrySleep(manager);
    const internals = asInternals(manager);
    const primary = new ScriptedChatModel(
      createModelConfig({ modelName: "limited-empty-primary" }),
      [],
      [Object.assign(new Error("Invalid API key"), { status: 401 })]
    );
    const fallback = new ScriptedChatModel(
      createModelConfig({ modelName: "limited-empty-fallback" }),
      [undefined, undefined, undefined, undefined, undefined]
    );
    registerModel(manager, primary);
    Reflect.set(
      internals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "limited-empty-fallback"
          ? fallback
          : undefined
    );

    await assert.rejects(
      manager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "hello" }],
        {
          limitedRetries: true,
          fallbackModelProvider: PsAiModelProvider.OpenAI,
          fallbackModelName: "limited-empty-fallback",
        }
      ),
      /Model call failed after maximum retries/
    );

    assert.equal(primary.calls.length, 1);
    assert.equal(fallback.calls.length, 5);
  });

  it("keeps JSON fallback timeout retries on the main budget", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    disableRetrySleep(manager);
    const internals = asInternals(manager);
    const primary = new ScriptedChatModel(
      createModelConfig({ modelName: "json-timeout-primary" }),
      [],
      [Object.assign(new Error("Invalid API key"), { status: 401 })]
    );
    const fallback = new ScriptedChatModel(
      createModelConfig({ modelName: "json-timeout-fallback" }),
      [createModelResult('{"ok":true}')],
      [
        new Error("Model call timed out"),
        new Error("Model call timed out"),
        new Error("Model call timed out"),
        new Error("Model call timed out"),
        new Error("Model call timed out"),
      ]
    );
    registerModel(manager, primary);
    Reflect.set(
      internals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "json-timeout-fallback"
          ? fallback
          : undefined
    );

    const result = await manager.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [{ role: "user", message: "hello" }],
      {
        limitedRetries: true,
        parseJson: true,
        fallbackModelProvider: PsAiModelProvider.OpenAI,
        fallbackModelName: "json-timeout-fallback",
      }
    );

    assert.deepEqual(result, { ok: true });
    assert.equal(primary.calls.length, 1);
    assert.equal(fallback.calls.length, 6);
  });

  it("uses fallback models for prohibited content and retries fallback JSON parsing", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    disableRetrySleep(manager);
    const internals = asInternals(manager);
    const primary = new ScriptedChatModel(
      createModelConfig({ modelName: "primary-content-model" })
    );
    const fallback = new ScriptedChatModel(
      createModelConfig({
        modelName: "fallback-json-model",
        modelSize: PsAiModelSize.Medium,
      }),
      [
        createModelResult("{foo: true false}"),
        createModelResult(JSON.stringify("'[]'")),
      ]
    );
    registerModel(manager, primary);
    Reflect.set(
      internals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelProvider === PsAiModelProvider.OpenAI &&
        options.modelName === "fallback-json-model"
          ? fallback
          : undefined
    );

    const result = await manager.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [{ role: "user", message: "hello" }],
      {
        parseJson: true,
        simulateContentErrorForFallbackDebugging: true,
        fallbackModelProvider: PsAiModelProvider.OpenAI,
        fallbackModelName: "fallback-json-model",
        fallbackModelType: PsAiModelType.TextReasoning,
        inferenceType: "priority",
        regionalProcessing: "eu",
        modelTemperature: 0.1,
        maxTokensOut: 512,
        modelMaxThinkingTokens: 128,
        modelReasoningEffort: "high",
        safetyIdentifier: "safe-user",
        responsesStateKey: "conversation-safe",
      }
    );

    assert.deepEqual(result, []);
    assert.equal(primary.calls.length, 0);
    assert.equal(fallback.calls.length, 2);
    assert.equal(manager.usageItemCalls[0][0].modelSize, PsAiModelSize.Medium);
  });

  it("returns fallback base results and fallback tool calls", async () => {
    useStandardResponsesEnv();

    const baseResultManager = createNoopManager();
    disableRetrySleep(baseResultManager);
    const baseResultInternals = asInternals(baseResultManager);
    const basePrimary = new ScriptedChatModel(
      createModelConfig({ modelName: "base-fallback-primary" }),
      [],
      [new Error("Error: unknown primary failure")]
    );
    const baseFallback = new ScriptedChatModel(
      createModelConfig({ modelName: "base-fallback-model" }),
      [
        createModelResult("  fallback base result  ", {
          phase: "final_answer",
          reasoningTokens: 6,
        }),
      ]
    );
    registerModel(baseResultManager, basePrimary);
    Reflect.set(
      baseResultInternals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "base-fallback-model"
          ? baseFallback
          : undefined
    );

    assert.deepEqual(
      await baseResultManager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "hello" }],
        {
          returnBaseModelResult: true,
          fallbackModelProvider: PsAiModelProvider.OpenAI,
          fallbackModelName: "base-fallback-model",
        }
      ),
      {
        content: "fallback base result",
        tokensIn: 3,
        tokensOut: 2,
        phase: "final_answer",
        reasoningTokens: 6,
      }
    );

    const toolManager = createNoopManager();
    disableRetrySleep(toolManager);
    const toolInternals = asInternals(toolManager);
    const toolPrimary = new ScriptedChatModel(
      createModelConfig({ modelName: "tool-fallback-primary" }),
      [],
      [new Error("Error: unknown primary failure")]
    );
    const toolFallback = new ScriptedChatModel(
      createModelConfig({ modelName: "tool-fallback-model" }),
      [
        createModelResult("", {
          toolCalls: [
            {
              id: "call-fallback",
              name: "lookup",
              arguments: { id: 7 },
            },
          ],
        }),
      ]
    );
    registerModel(toolManager, toolPrimary);
    Reflect.set(
      toolInternals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "tool-fallback-model"
          ? toolFallback
          : undefined
    );

    assert.deepEqual(
      await toolManager.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        [{ role: "user", message: "hello" }],
        {
          fallbackModelProvider: PsAiModelProvider.OpenAI,
          fallbackModelName: "tool-fallback-model",
        }
      ),
      {
        toolCalls: [
          {
            id: "call-fallback",
            name: "lookup",
            arguments: { id: 7 },
          },
        ],
      }
    );
  });

  it("throws when fallback JSON parsing or disabled fallback token chunking fails", async () => {
    useStandardResponsesEnv();

    const jsonManager = createNoopManager();
    disableRetrySleep(jsonManager);
    const jsonInternals = asInternals(jsonManager);
    const jsonPrimary = new ScriptedChatModel(
      createModelConfig({ modelName: "json-fallback-primary" }),
      [],
      [new Error("Error: unknown primary failure")]
    );
    const jsonFallback = new ScriptedChatModel(
      createModelConfig({ modelName: "json-fallback-model" }),
      [
        createModelResult("{foo: true false}"),
        createModelResult("{foo: true false}"),
        createModelResult("{foo: true false}"),
        createModelResult("{foo: true false}"),
      ]
    );
    registerModel(jsonManager, jsonPrimary);
    Reflect.set(
      jsonInternals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "json-fallback-model"
          ? jsonFallback
          : undefined
    );
    await assert.rejects(
      () =>
        jsonManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          {
            parseJson: true,
            fallbackModelProvider: PsAiModelProvider.OpenAI,
            fallbackModelName: "json-fallback-model",
          }
        ),
      /JSON parse failure/
    );
    assert.equal(jsonFallback.calls.length, 4);

    const tokenManager = createNoopManager();
    disableRetrySleep(tokenManager);
    const tokenInternals = asInternals(tokenManager);
    const tokenPrimary = new ScriptedChatModel(
      createModelConfig({ modelName: "disabled-token-fallback-primary" }),
      [],
      [new Error("Error: unknown primary failure")]
    );
    const tokenFallback = new ScriptedChatModel(
      createModelConfig({ modelName: "disabled-token-fallback-model" }),
      [],
      [
        Object.assign(new Error("maximum context length exceeded"), {
          code: "context_length_exceeded",
        }),
      ]
    );
    registerModel(tokenManager, tokenPrimary);
    Reflect.set(
      tokenInternals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "disabled-token-fallback-model"
          ? tokenFallback
          : undefined
    );

    await assert.rejects(
      () =>
        tokenManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          {
            disableChunkingRetry: true,
            fallbackModelProvider: PsAiModelProvider.OpenAI,
            fallbackModelName: "disabled-token-fallback-model",
          }
        ),
      /maximum context length/
    );
  });

  it("surfaces fallback creation failures and empty fallback responses", async () => {
    useStandardResponsesEnv();

    const missingFallbackManager = createNoopManager();
    disableRetrySleep(missingFallbackManager);
    const missingFallbackInternals = asInternals(missingFallbackManager);
    const unknownErrorModel = new ScriptedChatModel(
      createModelConfig({ modelName: "unknown-error-model" }),
      [],
      [new Error("Error: unknown provider failure")]
    );
    registerModel(missingFallbackManager, unknownErrorModel);
    Reflect.set(
      missingFallbackInternals,
      "createEphemeralModel",
      async () => undefined
    );
    await assert.rejects(
      () =>
        missingFallbackManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          {
            fallbackModelProvider: PsAiModelProvider.OpenAI,
            fallbackModelName: "missing-fallback",
            overrideMaxRetries: 1,
          }
        ),
      /Error: unknown provider failure/
    );

    const emptyFallbackManager = createNoopManager();
    disableRetrySleep(emptyFallbackManager);
    const emptyFallbackInternals = asInternals(emptyFallbackManager);
    const primary = new ScriptedChatModel(
      createModelConfig({ modelName: "primary-unknown-model" }),
      [],
      [new Error("Error: unknown primary failure")]
    );
    const emptyFallback = new ScriptedChatModel(
      createModelConfig({ modelName: "empty-fallback-model" }),
      [undefined, undefined]
    );
    registerModel(emptyFallbackManager, primary);
    Reflect.set(
      emptyFallbackInternals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "empty-fallback-model"
          ? emptyFallback
          : undefined
    );
    await assert.rejects(
      () =>
        emptyFallbackManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          {
            fallbackModelProvider: PsAiModelProvider.OpenAI,
            fallbackModelName: "empty-fallback-model",
            overrideMaxRetries: 2,
          }
        ),
      /Model call failed after maximum retries/
    );
    assert.equal(emptyFallback.calls.length, 2);
  });

  it("routes fallback token limit errors through chunking or rethrows them", async () => {
    useStandardResponsesEnv();
    const tokenError = Object.assign(
      new Error("maximum context length exceeded in fallback"),
      { code: "context_length_exceeded" }
    );
    const originalHandle = TokenLimitChunker.prototype.handle;
    Reflect.set(
      TokenLimitChunker.prototype,
      "handle",
      async () => "fallback chunked"
    );

    try {
      const manager = createNoopManager();
      disableRetrySleep(manager);
      const internals = asInternals(manager);
      const primary = new ScriptedChatModel(
        createModelConfig({ modelName: "fallback-token-primary" }),
        [],
        [new Error("Error: unknown primary failure")]
      );
      const fallback = new ScriptedChatModel(
        createModelConfig({ modelName: "fallback-token-model" }),
        [],
        [tokenError]
      );
      registerModel(manager, primary);
      Reflect.set(
        internals,
        "createEphemeralModel",
        async (
          _modelType: PsAiModelType,
          _modelSize: PsAiModelSize,
          options: PsCallModelOptions
        ) =>
          options.modelName === "fallback-token-model"
            ? fallback
            : undefined
      );

      assert.equal(
        await manager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          {
            fallbackModelProvider: PsAiModelProvider.OpenAI,
            fallbackModelName: "fallback-token-model",
          }
        ),
        "fallback chunked"
      );
    } finally {
      Reflect.set(TokenLimitChunker.prototype, "handle", originalHandle);
    }

    const responsesFallbackManager = createNoopManager();
    disableRetrySleep(responsesFallbackManager);
    const responsesFallbackInternals = asInternals(responsesFallbackManager);
    const primary = new ScriptedChatModel(
      createModelConfig({ modelName: "responses-fallback-primary" }),
      [],
      [new Error("Error: unknown primary failure")]
    );
    const responsesFallback = new OpenAiResponses(
      createModelConfig({
        modelName: "responses-fallback",
        provider: PsAiModelProvider.OpenAIResponses,
      })
    );
    responsesFallback.provider = PsAiModelProvider.OpenAIResponses;
    Reflect.set(responsesFallback, "generate", async () => {
      throw tokenError;
    });
    registerModel(responsesFallbackManager, primary);
    Reflect.set(
      responsesFallbackInternals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "responses-fallback"
          ? responsesFallback
          : undefined
    );

    await assert.rejects(
      () =>
        responsesFallbackManager.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [{ role: "user", message: "hello" }],
          {
            fallbackModelProvider: PsAiModelProvider.OpenAIResponses,
            fallbackModelName: "responses-fallback",
          }
        ),
      /maximum context length/
    );
  });

  it("preserves fallback identity for token-limit chunking retries", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    disableRetrySleep(manager);
    const internals = asInternals(manager);
    const primary = new ScriptedChatModel(
      createModelConfig({ modelName: "chunk-primary-model" }),
      [],
      [
        Object.assign(new Error("Invalid API key"), { status: 401 }),
        Object.assign(new Error("Invalid API key"), { status: 401 }),
        Object.assign(new Error("Invalid API key"), { status: 401 }),
      ]
    );
    const tokenError = Object.assign(
      new Error("maximum context length exceeded in fallback"),
      { code: "context_length_exceeded" }
    );
    const fallback = new ScriptedChatModel(
      createModelConfig({
        modelName: "chunk-fallback-model",
        maxContextTokens: 200_000,
      }),
      [createModelResult("chunk analysis"), createModelResult("final chunked")],
      [tokenError]
    );
    registerModel(manager, primary);
    Reflect.set(
      internals,
      "createEphemeralModel",
      async (
        _modelType: PsAiModelType,
        _modelSize: PsAiModelSize,
        options: PsCallModelOptions
      ) =>
        options.modelName === "chunk-fallback-model" ? fallback : undefined
    );
    const longDocument = Array.from(
      { length: 60 },
      (_, index) => `word${index}`
    ).join(" ");

    const result = await manager.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [{ role: "user", message: longDocument }],
      {
        fallbackModelProvider: PsAiModelProvider.OpenAI,
        fallbackModelName: "chunk-fallback-model",
      }
    );

    assert.equal(result, "final chunked");
    assert.equal(primary.calls.length, 1);
    assert.equal(fallback.calls.length, 3);
  });

  it("merges price overrides for loaded fallback models without mutating base prices", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const basePrices: PsBaseModelPriceConfiguration = {
      ...prices,
      costOutTokensPerMillion: 2,
    };
    const model = new ScriptedChatModel(
      createModelConfig({
        modelSize: PsAiModelSize.Medium,
        prices: basePrices,
      }),
      []
    );
    registerModel(
      manager,
      model,
      PsAiModelType.Text,
      PsAiModelSize.Medium
    );

    const resolved = await manager.getModelPriceConfiguration(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        priceOverride: {
          costOutTokensPerMillion: 9,
        },
      }
    );

    assert.equal(resolved?.costOutTokensPerMillion, 9);
    assert.equal(basePrices.costOutTokensPerMillion, 2);
  });

  it("emits token usage events when database usage tracking is disabled", async () => {
    useStandardResponsesEnv();
    process.env.DISABLE_DB_USAGE_TRACKING = "true";
    process.env.PS_EMIT_TOKEN_USAGE_EVENTS = "true";
    const manager = createNoopManager();
    const receivedEvents: unknown[] = [];
    const listener = (event: unknown) => {
      receivedEvents.push(event);
    };
    policySynthEvents.on(TOKEN_USAGE_EVENT, listener);

    try {
      await PsAiModelManager.prototype.saveTokenUsage.call(
        manager,
        "event-model",
        PsAiModelProvider.OpenAI,
        prices,
        PsAiModelType.Text,
        PsAiModelSize.Small,
        10,
        3,
        5,
        -1
      );
    } finally {
      policySynthEvents.off(TOKEN_USAGE_EVENT, listener);
    }

    assert.equal(receivedEvents.length, 1);
    assert.deepEqual(receivedEvents[0], {
      modelName: "event-model",
      modelProvider: PsAiModelProvider.OpenAI,
      modelType: PsAiModelType.Text,
      modelSize: PsAiModelSize.Small,
      tokensIn: 10,
      tokensOut: 5,
      cachedInTokens: 3,
      agentId: 42,
      userId: 7,
      modelId: -1,
      timestamp: (receivedEvents[0] as { timestamp: number }).timestamp,
    });
    assert.equal(
      typeof (receivedEvents[0] as { timestamp: number }).timestamp,
      "number"
    );
  });
});

describe("PsAiModelManager price and usage accounting", () => {
  it("loads database model configuration for ephemeral models and price lookups", async () => {
    useStandardResponsesEnv();
    delete process.env.DISABLE_DB_INIT;
    process.env.OPENAI_API_KEY = "db-openai-key";

    const { PsAiModel } = await import("../../dbModels/aiModel.js");
    const originalFindOne = Reflect.get(PsAiModel, "findOne");
    const dbModelConfig: PsAiModelConfiguration = {
      ...createAiModel({
        type: PsAiModelType.TextReasoning,
        modelSize: PsAiModelSize.Large,
        provider: PsAiModelProvider.OpenAI,
        model: "db-override-model",
        apiModel: "gpt-5.5",
        maxContextTokens: 12345,
        timeoutMs: 9876,
        prices: {
          ...prices,
          costOutTokensPerMillion: 11,
        },
      }).configuration,
    };
    const overridePriceConfig: PsAiModelConfiguration = {
      ...createAiModel({
        provider: PsAiModelProvider.OpenAI,
        model: "db-price-model",
        prices: {
          ...prices,
          costOutTokensPerMillion: 12,
        },
      }).configuration,
    };
    const fallbackPriceConfig: PsAiModelConfiguration = {
      ...createAiModel({
        provider: PsAiModelProvider.Anthropic,
        model: "db-fallback-price-model",
        prices: {
          ...prices,
          costOutTokensPerMillion: 13,
        },
      }).configuration,
    };
    const dbResponses = [
      { id: 801, configuration: dbModelConfig },
      { id: 802, configuration: overridePriceConfig },
      { id: 803, configuration: fallbackPriceConfig },
    ];

    Reflect.set(PsAiModel, "findOne", async (_query: unknown) => {
      return dbResponses.shift() ?? null;
    });

    try {
      const manager = createNoopManager();
      const internals = asInternals(manager);
      const fallback = new ScriptedChatModel(
        createModelConfig({
          apiKey: "fallback-key",
          modelName: "fallback-for-db",
        })
      );
      registerModel(manager, fallback);

      const ephemeral = await internals.createEphemeralModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        {
          modelProvider: PsAiModelProvider.OpenAI,
          modelName: "db-override-model",
        }
      );

      assert.ok(ephemeral instanceof OpenAiChat);
      assert.equal(ephemeral.dbModelId, 801);
      assert.equal(ephemeral.config.modelType, PsAiModelType.TextReasoning);
      assert.equal(ephemeral.config.modelSize, PsAiModelSize.Large);
      assert.equal(ephemeral.config.modelName, "db-override-model");
      assert.equal(ephemeral.config.apiModelName, "gpt-5.5");
      assert.equal(ephemeral.config.maxContextTokens, 12345);
      assert.equal(ephemeral.config.timeoutMs, 9876);

      const overridePrices = await manager.getModelPriceConfiguration(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        {
          modelProvider: PsAiModelProvider.OpenAI,
          modelName: "db-price-model",
          priceOverride: { costInTokensPerMillion: 9 },
        }
      );
      assert.equal(overridePrices?.costInTokensPerMillion, 9);
      assert.equal(overridePrices?.costOutTokensPerMillion, 12);

      const fallbackPrices = await manager.getModelPriceConfiguration(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        {
          fallbackModelProvider: PsAiModelProvider.Anthropic,
          fallbackModelName: "db-fallback-price-model",
        }
      );
      assert.equal(fallbackPrices?.costOutTokensPerMillion, 13);
    } finally {
      Reflect.set(PsAiModel, "findOne", originalFindOne);
    }
  });

  it("routes aliased Deep Research database models by apiModelName", async () => {
    useStandardResponsesEnv();
    delete process.env.DISABLE_DB_INIT;
    process.env.GOOGLE_API_KEY = "db-google-key";

    const { PsAiModel } = await import("../../dbModels/aiModel.js");
    const originalFindOne = Reflect.get(PsAiModel, "findOne");
    const dbModelConfig: PsAiModelConfiguration = {
      ...createAiModel({
        type: PsAiModelType.TextReasoning,
        modelSize: PsAiModelSize.Large,
        provider: PsAiModelProvider.Google,
        model: "research-large",
        apiModel: "deep-research-max-preview-04-2026",
      }).configuration,
    };

    Reflect.set(PsAiModel, "findOne", async () => ({
      id: 901,
      configuration: dbModelConfig,
    }));

    try {
      const manager = createNoopManager();
      const internals = asInternals(manager);
      const fallback = new ScriptedChatModel(
        createModelConfig({
          apiKey: "fallback-key",
          modelName: "fallback-google",
          provider: PsAiModelProvider.Google,
        })
      );
      registerModel(manager, fallback);

      const ephemeral = await internals.createEphemeralModel(
        PsAiModelType.Text,
        PsAiModelSize.Small,
        {
          modelProvider: PsAiModelProvider.Google,
          modelName: "research-large",
        }
      );

      assert.ok(ephemeral instanceof GoogleGeminiDeepResearch);
      assert.equal(ephemeral.dbModelId, 901);
      assert.equal(ephemeral.config.modelName, "research-large");
      assert.equal(
        ephemeral.config.apiModelName,
        "deep-research-max-preview-04-2026"
      );
    } finally {
      Reflect.set(PsAiModel, "findOne", originalFindOne);
    }
  });

  it("handles database lookup failures for prices, model ids, and disabled DB initialization", async () => {
    useStandardResponsesEnv();
    delete process.env.DISABLE_DB_INIT;
    process.env.PS_AI_MODEL_TYPE = PsAiModelType.Text;
    process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
    process.env.PS_AI_MODEL_PROVIDER = PsAiModelProvider.OpenAI;
    process.env.PS_AI_MODEL_NAME = "price-fallback-without-key";

    const { PsAiModel } = await import("../../dbModels/aiModel.js");
    const originalFindOne = Reflect.get(PsAiModel, "findOne");

    try {
      const manager = new PsAiModelManager([], [], 256, 0.4, "medium", 0, 42, 7);
      Reflect.set(PsAiModel, "findOne", async () => {
        throw new Error("price lookup failed");
      });

      assert.equal(
        await manager.getModelPriceConfiguration(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          {
            modelProvider: PsAiModelProvider.OpenAI,
            modelName: "price-throws",
          }
        ),
        undefined
      );
      assert.equal(
        await manager.getModelPriceConfiguration(
          PsAiModelType.Text,
          PsAiModelSize.Small,
          {
            fallbackModelProvider: PsAiModelProvider.OpenAI,
            fallbackModelName: "fallback-price-throws",
          }
        ),
        undefined
      );

      await manager.saveTokenUsage(
        "id-lookup-throws",
        PsAiModelProvider.OpenAI,
        prices,
        PsAiModelType.Text,
        PsAiModelSize.Small,
        4,
        0,
        2,
        undefined,
        {
          modelProvider: PsAiModelProvider.OpenAI,
          modelName: "id-lookup-throws",
        }
      );
    } finally {
      Reflect.set(PsAiModel, "findOne", originalFindOne);
    }

    useStandardResponsesEnv();
    process.env.DISABLE_DB_INIT = "true";
    delete process.env.DISABLE_DB_USAGE_TRACKING;
    process.env.PS_EMIT_TOKEN_USAGE_EVENTS = "true";
    const { sequelize } = await import("../../dbModels/index.js");
    const { PsModelUsage } = await import("../../dbModels/modelUsage.js");
    const originalTransaction = Reflect.get(sequelize, "transaction");
    const originalFindOrCreate = Reflect.get(PsModelUsage, "findOrCreate");
    const disabledDbManager = new PsAiModelManager(
      [],
      [],
      256,
      0.4,
      "medium",
      0,
      42,
      7
    );
    let transactionCalls = 0;
    const receivedEvents: Array<{
      tokensIn: number;
      cachedInTokens: number;
      modelId: number;
    }> = [];
    const listener = (event: unknown) => {
      receivedEvents.push(
        event as {
          tokensIn: number;
          cachedInTokens: number;
          modelId: number;
        }
      );
    };
    policySynthEvents.on(TOKEN_USAGE_EVENT, listener);
    Reflect.set(sequelize, "transaction", async () => {
      transactionCalls += 1;
      throw new Error("disabled DB should not transact");
    });
    Reflect.set(PsModelUsage, "findOrCreate", async () => {
      throw new Error("disabled DB should not write usage rows");
    });
    try {
      await disabledDbManager.saveTokenUsage(
        "disabled-db-model",
        PsAiModelProvider.OpenAI,
        prices,
        PsAiModelType.Text,
        PsAiModelSize.Small,
        4,
        1,
        2,
        123
      );
    } finally {
      policySynthEvents.off(TOKEN_USAGE_EVENT, listener);
      Reflect.set(sequelize, "transaction", originalTransaction);
      Reflect.set(PsModelUsage, "findOrCreate", originalFindOrCreate);
    }
    assert.equal(transactionCalls, 0);
    assert.equal(receivedEvents[0].tokensIn, 3);
    assert.equal(receivedEvents[0].cachedInTokens, 1);
    assert.equal(receivedEvents[0].modelId, 123);
  });

  it("uses loaded, by-type, and environment price fallbacks", async () => {
    useStandardResponsesEnv();

    const manager = createNoopManager();
    const internals = asInternals(manager);
    assert.deepEqual(
      internals.applyPriceOverride(undefined, {
        costInTokensPerMillion: 4,
        costInCachedContextTokensPerMillion: 2,
        costOutTokensPerMillion: 8,
        currency: "USD",
      }),
      {
        costInTokensPerMillion: 4,
        costInCachedContextTokensPerMillion: 2,
        costOutTokensPerMillion: 8,
        currency: "USD",
      }
    );

    const large = new ScriptedChatModel(
      createModelConfig({
        modelSize: PsAiModelSize.Large,
        prices: {
          ...prices,
          costOutTokensPerMillion: 14,
        },
      })
    );
    registerModel(manager, large, PsAiModelType.Text, PsAiModelSize.Large);
    const largePrices = await manager.getModelPriceConfiguration(
      PsAiModelType.Text,
      PsAiModelSize.Large,
      {}
    );
    assert.equal(largePrices?.costOutTokensPerMillion, 14);

    const medium = new ScriptedChatModel(
      createModelConfig({
        modelSize: PsAiModelSize.Medium,
        prices: {
          ...prices,
          costOutTokensPerMillion: 16,
        },
      })
    );
    registerModel(manager, medium, PsAiModelType.Text, PsAiModelSize.Medium);
    const mediumPrices = await manager.getModelPriceConfiguration(
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      {}
    );
    assert.equal(mediumPrices?.costOutTokensPerMillion, 16);

    const defaultSizePrices = await manager.getModelPriceConfiguration(
      PsAiModelType.Text,
      "default-size" as PsAiModelSize,
      {}
    );
    assert.equal(defaultSizePrices?.costOutTokensPerMillion, 16);

    manager.models.clear();
    manager.modelsByType.set(
      PsAiModelType.Text,
      new ScriptedChatModel(
        createModelConfig({
          prices: {
            ...prices,
            costOutTokensPerMillion: 15,
          },
        })
      )
    );
    const byTypePrices = await manager.getModelPriceConfiguration(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {}
    );
    assert.equal(byTypePrices?.costOutTokensPerMillion, 15);

    const envManager = createNoopManager();
    process.env.PS_AI_MODEL_TYPE = PsAiModelType.Text;
    process.env.PS_AI_MODEL_SIZE = PsAiModelSize.Small;
    process.env.PS_AI_MODEL_PROVIDER = PsAiModelProvider.OpenAI;
    process.env.PS_AI_MODEL_NAME = "env-price-model";
    process.env.OPENAI_API_KEY = "env-price-key";
    const envPrices = await envManager.getModelPriceConfiguration(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      {
        priceOverride: {
          costInTokensPerMillion: 5,
          costInCachedContextTokensPerMillion: 1,
          costOutTokensPerMillion: 10,
          currency: "USD",
        },
      }
    );
    assert.equal(envPrices?.costOutTokensPerMillion, 10);
  });

  it("resolves model ids from database before emitting disabled tracking events", async () => {
    useStandardResponsesEnv();
    delete process.env.DISABLE_DB_INIT;
    process.env.DISABLE_DB_USAGE_TRACKING = "true";
    process.env.PS_EMIT_TOKEN_USAGE_EVENTS = "true";

    const { PsAiModel } = await import("../../dbModels/aiModel.js");
    const originalFindOne = Reflect.get(PsAiModel, "findOne");
    const dbResponses = [{ id: 901 }, { id: 902 }];
    Reflect.set(PsAiModel, "findOne", async (_query: unknown) => {
      return dbResponses.shift() ?? null;
    });

    const manager = new PsAiModelManager([], [], 256, 0.4, "medium", 0, 42, 7);
    const receivedEvents: Array<{ modelId: number }> = [];
    const listener = (event: unknown) => {
      receivedEvents.push(event as { modelId: number });
    };
    policySynthEvents.on(TOKEN_USAGE_EVENT, listener);

    try {
      await manager.saveTokenUsage(
        "override-id-model",
        PsAiModelProvider.OpenAI,
        prices,
        PsAiModelType.Text,
        PsAiModelSize.Small,
        10,
        0,
        5,
        undefined,
        {
          modelProvider: PsAiModelProvider.OpenAI,
          modelName: "override-id-model",
        }
      );
      await manager.saveTokenUsage(
        "fallback-id-model",
        PsAiModelProvider.OpenAI,
        prices,
        PsAiModelType.Text,
        PsAiModelSize.Small,
        10,
        0,
        5,
        undefined,
        {
          fallbackModelProvider: PsAiModelProvider.Anthropic,
          fallbackModelName: "fallback-id-model",
        }
      );
    } finally {
      policySynthEvents.off(TOKEN_USAGE_EVENT, listener);
      Reflect.set(PsAiModel, "findOne", originalFindOne);
    }

    assert.equal(receivedEvents[0].modelId, 901);
    assert.equal(receivedEvents[1].modelId, 902);
  });

  it("emits ephemeral usage events while tracking is enabled but no model id exists", async () => {
    useStandardResponsesEnv();
    delete process.env.DISABLE_DB_USAGE_TRACKING;
    process.env.PS_EMIT_TOKEN_USAGE_EVENTS = "true";
    const manager = new PsAiModelManager([], [], 256, 0.4, "medium", 0, 42, 7);
    const receivedEvents: Array<{
      tokensIn: number;
      cachedInTokens: number;
      modelId: number;
    }> = [];
    const listener = (event: unknown) => {
      receivedEvents.push(
        event as {
          tokensIn: number;
          cachedInTokens: number;
          modelId: number;
        }
      );
    };
    policySynthEvents.on(TOKEN_USAGE_EVENT, listener);

    try {
      await manager.saveTokenUsage(
        "ephemeral-usage-model",
        PsAiModelProvider.OpenAI,
        prices,
        PsAiModelType.Text,
        PsAiModelSize.Small,
        10,
        2,
        5,
        -1
      );
    } finally {
      policySynthEvents.off(TOKEN_USAGE_EVENT, listener);
    }

    assert.equal(receivedEvents[0].tokensIn, 8);
    assert.equal(receivedEvents[0].cachedInTokens, 2);
    assert.equal(receivedEvents[0].modelId, -1);
  });

  it("persists long-context token usage and surfaces persistence failures", async () => {
    useStandardResponsesEnv();
    delete process.env.DISABLE_DB_INIT;
    delete process.env.DISABLE_DB_USAGE_TRACKING;
    process.env.PS_EMIT_TOKEN_USAGE_EVENTS = "true";

    const { sequelize } = await import("../../dbModels/index.js");
    const { PsModelUsage } = await import("../../dbModels/modelUsage.js");
    const originalTransaction = Reflect.get(sequelize, "transaction");
    const originalFindOrCreate = Reflect.get(PsModelUsage, "findOrCreate");
    const persisted: Record<string, unknown>[] = [];
    const increments: Record<string, unknown>[] = [];
    const usageRecord = {
      increment: async (fields: Record<string, unknown>) => {
        increments.push(fields);
      },
    };

    Reflect.set(
      sequelize,
      "transaction",
      async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback({ id: "tx" })
    );
    Reflect.set(PsModelUsage, "findOrCreate", async (options: unknown) => {
      persisted.push(options as Record<string, unknown>);
      return [usageRecord, false];
    });

    const manager = new PsAiModelManager([], [], 256, 0.4, "medium", 0, 42, 7);
    const longContextPrices: PsBaseModelPriceConfiguration = {
      ...prices,
      longContextTokenThreshold: 50,
    };
    const receivedEvents: Array<{
      longContextTokenIn: number;
      longContextTokenInCached: number;
      longContextTokenOut: number;
    }> = [];
    const listener = (event: unknown) => {
      receivedEvents.push(
        event as {
          longContextTokenIn: number;
          longContextTokenInCached: number;
          longContextTokenOut: number;
        }
      );
    };
    policySynthEvents.on(TOKEN_USAGE_EVENT, listener);

    try {
      await manager.saveTokenUsage(
        "long-context-model",
        PsAiModelProvider.OpenAI,
        longContextPrices,
        PsAiModelType.Text,
        PsAiModelSize.Small,
        100,
        20,
        5,
        777
      );

      assert.equal(
        ((persisted[0].defaults as Record<string, unknown>)
          .long_context_token_in_count as number),
        80
      );
      assert.equal(
        ((persisted[0].defaults as Record<string, unknown>)
          .long_context_token_in_cached_context_count as number),
        20
      );
      assert.equal(increments[0].long_context_token_out_count, 5);
      assert.equal(receivedEvents[0].longContextTokenIn, 80);
      assert.equal(receivedEvents[0].longContextTokenInCached, 20);
      assert.equal(receivedEvents[0].longContextTokenOut, 5);

      Reflect.set(sequelize, "transaction", async () => {
        throw new Error("transaction failed");
      });
      await assert.rejects(
        () =>
          manager.saveTokenUsage(
            "failing-usage-model",
            PsAiModelProvider.OpenAI,
            prices,
            PsAiModelType.Text,
            PsAiModelSize.Small,
            10,
            0,
            5,
            777
          ),
        /transaction failed/
      );
    } finally {
      policySynthEvents.off(TOKEN_USAGE_EVENT, listener);
      Reflect.set(sequelize, "transaction", originalTransaction);
      Reflect.set(PsModelUsage, "findOrCreate", originalFindOrCreate);
    }
  });

  it("adds agent and user ids when delegating usage item persistence", async () => {
    useStandardResponsesEnv();
    const manager = new PsAiModelManager([], [], 256, 0.4, "medium", 0, 42, 7);
    let capturedPayload:
      | (PsModelUsageItemSaveContext & { userId: number; agentId: number })
      | undefined;
    Reflect.set(manager, "modelUsageItemManager", {
      saveUsageItem: async (
        payload: PsModelUsageItemSaveContext & {
          userId: number;
          agentId: number;
        }
      ) => {
        capturedPayload = payload;
      },
    });

    await manager.saveTokenUsageItem({
      modelName: "usage-item-model",
      modelProvider: PsAiModelProvider.OpenAI,
      prices,
      modelType: PsAiModelType.Text,
      modelSize: PsAiModelSize.Small,
      tokensIn: 10,
      cachedInTokens: 2,
      tokensOut: 5,
      streaming: false,
      modelId: 123,
    });

    assert.equal(capturedPayload?.agentId, 42);
    assert.equal(capturedPayload?.userId, 7);
    assert.equal(capturedPayload?.modelName, "usage-item-model");
  });

  it("counts tokens with a configured medium model encoder", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    manager.models.set(
      `${PsAiModelType.Text}_Medium`,
      new ScriptedChatModel(
        createModelConfig({
          modelName: "gpt-4o",
          modelSize: PsAiModelSize.Medium,
        })
      )
    );

    const count = await manager.getTokensFromMessages([
      { role: "user", message: "hello", name: "tester" },
      { role: "assistant", message: "world" },
    ]);

    assert.ok(count > 0);
  });

  it("counts tokens with the default encoder when no medium text model is configured", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();

    const count = await manager.getTokensFromMessages([
      { role: "user", message: "hello" },
    ]);

    assert.ok(count > 0);
  });
});

describe("PsAiModelManager call options", () => {
  it("executes the real retry sleep helper with a patched timer", async () => {
    useStandardResponsesEnv();
    const manager = createNoopManager();
    const originalSetTimeout = globalThis.setTimeout;
    const immediateSetTimeout = ((
      handler: Parameters<typeof setTimeout>[0],
      _timeout?: number,
      ...args: unknown[]
    ) => {
      if (typeof handler === "function") {
        const callback = handler as (...callbackArgs: unknown[]) => void;
        callback(...args);
      }
      return 0 as unknown as NodeJS.Timeout;
    }) as typeof setTimeout;

    globalThis.setTimeout = immediateSetTimeout;
    try {
      await asInternals(manager).sleepBeforeRetry(20);
    } finally {
      globalThis.setTimeout = originalSetTimeout;
    }
  });

  it("ramps forceTimeoutAndRetryMs across the retry budget", () => {
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
    assert.ok(
      internals.getTimeoutMsForRetry(options, undefined, 4, 10) > 2500
    );
    assert.ok(
      internals.getTimeoutMsForRetry(options, undefined, 4, 10) < 30000
    );
    assert.equal(
      internals.getTimeoutMsForRetry(options, undefined, 9, 10),
      30000
    );
    assert.ok(
      internals.getTimeoutMsForRetry(options, undefined, 48, 50) > 29000
    );
    assert.ok(
      internals.getTimeoutMsForRetry(options, undefined, 48, 50) < 30000
    );
    assert.equal(
      internals.getTimeoutMsForRetry(options, undefined, 49, 50),
      30000
    );
    assert.equal(internals.getTimeoutMsForRetry({}, 1234, 0, 5), 1234);
    assert.equal(
      internals.getTimeoutMsForRetry(
        { forceTimeoutAndRetryMs: 4000 },
        undefined,
        9,
        10
      ),
      30000
    );
    assert.equal(
      internals.getTimeoutMsForRetry(
        { forceTimeoutAndRetryMs: 35000 },
        undefined,
        20,
        50
      ),
      35000
    );
  });

  it("falls back through OpenAI Responses runtime override defaults", () => {
    useStandardResponsesEnv();

    const manager = createNoopManager();
    const internals = asInternals(manager);
    const responsesModel = new OpenAiResponses(
      createModelConfig({
        provider: PsAiModelProvider.OpenAIResponses,
        modelName: "responses-runtime",
        inferenceType: "flex",
        maxTokensOut: 777,
        temperature: 0.33,
        reasoningEffort: "high",
        reasoningMode: "pro",
        maxThinkingTokens: 55,
      }) as PsOpenAiModelConfig
    );

    Reflect.set(manager, "maxTokensOut", undefined);
    Reflect.set(manager, "modelTemperature", undefined);
    Reflect.set(manager, "reasoningEffort", undefined);
    Reflect.set(manager, "maxThinkingTokens", undefined);

    assert.deepEqual(internals.getResponsesRuntimeOverrides(responsesModel, {}), {
      inferenceType: "flex",
      maxTokensOut: 777,
      temperature: 0.33,
      reasoningEffort: "high",
      reasoningMode: "pro",
      maxThinkingTokens: 55,
    });
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
    const model = new NeverCompletingFirstAttemptModel({
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
    assert.deepEqual(
      model.requestOptionsHistory.map(
        (requestOptions) => requestOptions?.timeoutMs
      ),
      [10, 30000]
    );
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
        modelReasoningMode: "standard",
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
        modelReasoningMode: "pro",
      })
    );
    const third = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions({
        modelReasoningEffort: "medium",
        modelReasoningMode: "standard",
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
    assert.equal(third.config.reasoningMode, "standard");
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
        modelName: "gpt-5.6",
        modelReasoningEffort: "medium",
      })
    );

    assert.ok(first instanceof OpenAiResponses);

    const second = await internals.createEphemeralModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      createResponsesOptions({
        modelName: "gpt-5.6",
        modelReasoningEffort: "high",
        inferenceType: "fast",
        maxTokensOut: 1024,
        modelMaxThinkingTokens: 4096,
        modelTemperature: 0.15,
        modelReasoningMode: "pro",
      })
    );

    assert.strictEqual(second, first);
    assert.equal(second.config.reasoningEffort, "high");
    assert.equal(second.config.reasoningMode, "pro");
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
    assert.equal(captured.reasoning?.mode, "pro");
    assert.equal(captured.max_output_tokens, 1024);
    assert.equal(captured.service_tier, "priority");
    assert.equal(result.content, "ok");
  });

  it("preserves Responses state and clears a completed mode-only override", async () => {
    useStandardResponsesEnv();

    const manager = createManager({ model: "gpt-5.6" });
    const internals = asInternals(manager);
    const configuredModel = internals.modelsByType.get(
      PsAiModelType.TextReasoning
    );

    assert.ok(configuredModel instanceof OpenAiResponses);

    const cachedStatefulModel = internals.getStateIsolatedResponsesModel(
      configuredModel,
      {
        responsesStateKey: "conversation-a",
      }
    );

    assert.ok(cachedStatefulModel instanceof OpenAiResponses);

    const capturedRequests: RecordedResponsesRequest[] = [];
    setMockClient(cachedStatefulModel, {
      create: async (params) => {
        const request = params as RecordedResponsesRequest;
        capturedRequests.push(request);
        const responseNumber = capturedRequests.length;
        return {
          id:
            responseNumber === 1
              ? "resp-configured-first"
              : responseNumber === 2
                ? "resp-configured-second"
                : "resp-configured-third",
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text:
                    responseNumber === 1
                      ? "first"
                      : responseNumber === 2
                        ? "second"
                        : "third",
                },
              ],
            },
          ],
          usage: {},
        };
      },
    });

    const first = await manager.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      [{ role: "user", message: "hello" }],
      {
        responsesStateKey: "conversation-a",
      }
    );
    const second = await manager.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      [
        { role: "user", message: "hello" },
        { role: "user", message: "follow up" },
      ],
      {
        responsesStateKey: "conversation-a",
        modelReasoningMode: "pro",
      }
    );
    const third = await manager.callModel(
      PsAiModelType.TextReasoning,
      PsAiModelSize.Small,
      [
        { role: "user", message: "hello" },
        { role: "user", message: "follow up" },
        { role: "user", message: "one more" },
      ],
      {
        responsesStateKey: "conversation-a",
      }
    );

    assert.equal(first, "first");
    assert.equal(second, "second");
    assert.equal(third, "third");
    assert.equal(capturedRequests.length, 3);
    assert.equal(capturedRequests[0].previous_response_id, undefined);
    assert.equal(
      capturedRequests[1].previous_response_id,
      "resp-configured-first"
    );
    assert.equal(capturedRequests[1].reasoning?.mode, "pro");
    assert.equal(
      capturedRequests[2].previous_response_id,
      "resp-configured-second"
    );
    assert.equal(capturedRequests[2].reasoning?.mode, undefined);
    assert.equal(cachedStatefulModel.config.reasoningMode, undefined);
    assert.equal(internals.statefulResponsesModelCache.size, 1);
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

  it("evicts the oldest stateful Responses bucket when the cache is full", () => {
    useStandardResponsesEnv();

    const manager = createManager();
    const internals = asInternals(manager);
    internals.maxStatefulResponsesModelCacheEntries = 1;
    const configuredModel = internals.modelsByType.get(
      PsAiModelType.TextReasoning
    );
    assert.ok(configuredModel instanceof OpenAiResponses);

    const first = internals.getStateIsolatedResponsesModel(configuredModel, {
      responsesStateKey: "conversation-a",
    });
    const second = internals.getStateIsolatedResponsesModel(configuredModel, {
      responsesStateKey: "conversation-b",
    });
    const recreatedFirst = internals.getStateIsolatedResponsesModel(
      configuredModel,
      {
        responsesStateKey: "conversation-a",
      }
    );

    assert.notStrictEqual(first, second);
    assert.notStrictEqual(recreatedFirst, first);
    assert.equal(internals.statefulResponsesModelCache.size, 1);
  });

  it("handles direct stateful cache replacement and empty eviction keys", () => {
    useStandardResponsesEnv();

    const manager = createManager();
    const internals = asInternals(manager);
    const responsesModel = new OpenAiResponses(
      createModelConfig({
        provider: PsAiModelProvider.OpenAIResponses,
        modelName: "cache-direct-model",
      }) as PsOpenAiModelConfig
    );

    internals.cacheStatefulResponsesModel("same-key", responsesModel);
    internals.cacheStatefulResponsesModel("same-key", responsesModel);
    assert.equal(internals.statefulResponsesModelCache.size, 1);

    internals.statefulResponsesModelCache.clear();
    internals.maxStatefulResponsesModelCacheEntries = -1;
    internals.cacheStatefulResponsesModel("temporary-key", responsesModel);
    assert.equal(internals.statefulResponsesModelCache.size, 0);
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
      modelReasoningMode: "standard",
    });

    Reflect.set(first, "previousResponseId", "configured-resp");

    const second = internals.getStateIsolatedResponsesModel(configuredModel, {
      responsesStateKey: "conversation-a",
      modelReasoningEffort: "high",
      modelReasoningMode: "pro",
    });
    const third = internals.getStateIsolatedResponsesModel(configuredModel, {
      responsesStateKey: "conversation-a",
      modelReasoningEffort: "medium",
      modelReasoningMode: "standard",
    });

    assert.notStrictEqual(first, configuredModel);
    assert.strictEqual(second, first);
    assert.strictEqual(third, first);
    assert.equal(Reflect.get(third, "previousResponseId"), "configured-resp");
    assert.equal(third.config.reasoningEffort, "medium");
    assert.equal(third.config.reasoningMode, "standard");
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
    assert.ok(result);
    assert.equal(captured.temperature, 0.0);
    assert.equal(result.content, "ok");
  });
});
