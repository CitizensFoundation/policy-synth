import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { ClaudeChat } from "../aiModels/claudeChat.js";
import { OpenAiChat } from "../aiModels/openAiChat.js";
import { OpenAiResponses } from "../aiModels/openAiResponses.js";
import { GoogleGeminiChat } from "../aiModels/googleGeminiChat.js";
import { GoogleGeminiThought } from "../aiModels/googleGeminiThought.js";
import { AzureOpenAiChat } from "../aiModels/azureOpenAiChat.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import type { Transaction, Op } from "sequelize";
import type { Sequelize } from "sequelize";
import type { PsAiModel as PsAiModelDb } from "../dbModels/aiModel.js";
import { TiktokenModel, encoding_for_model } from "tiktoken";
import { PolicySynthAgentBase } from "./agentBase.js";
import type { PsModelUsage as PsModelUsageType } from "../dbModels/modelUsage.js";
import { TokenLimitChunker } from "./tokenLimitChunker.js";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";
import { PsAiModelProvider } from "../aiModelTypes.js";
import { policySynthEvents, TOKEN_USAGE_EVENT } from "./events.js";
import { PsModelUsageItemManager } from "./modelUsageItemManager.js";

// Lazy loaded database modules
let SequelizeModule: any;
let sequelize: Sequelize | undefined;
let PsAiModel: typeof PsAiModelDb | undefined;
let PsModelUsage: typeof PsModelUsageType | undefined;
let loadDbModulesPromise: Promise<void> | undefined;

async function loadDbModules() {
  if (process.env.DISABLE_DB_INIT) {
    return;
  }
  if (!loadDbModulesPromise) {
    loadDbModulesPromise = (async () => {
      PolicySynthAgentBase.logger.debug("Loading Sequelize modules");
      SequelizeModule = await import("sequelize");
      ({ sequelize } = await import("../dbModels/index.js"));
      ({ PsAiModel: PsAiModel } = await import("../dbModels/aiModel.js"));
      ({ PsModelUsage: PsModelUsage } = await import(
        "../dbModels/modelUsage.js"
      ));
      if (!SequelizeModule || !sequelize || !PsAiModel || !PsModelUsage) {
        throw new Error("Failed to initialize Sequelize modules");
      }
      PolicySynthAgentBase.logger.debug("Sequelize modules loaded");
    })();
  } else {
    PolicySynthAgentBase.logger.debug("Sequelize modules already loading/loaded");
  }

  try {
    await loadDbModulesPromise;
  } catch (error) {
    PolicySynthAgentBase.logger.error(
      `Failed to load Sequelize modules: ${error}`
    );
    // Allow retries if loading failed previously
    loadDbModulesPromise = undefined;
    throw error;
  }
}

export class PsAiModelManager extends PolicySynthAgentBase {
  private modelUsageItemManager = new PsModelUsageItemManager();
  private statefulResponsesModelCache: Map<string, OpenAiResponses> = new Map();
  models: Map<string, BaseChatModel> = new Map();
  modelsByType: Map<PsAiModelType, BaseChatModel> = new Map();
  modelIds: Map<string, number> = new Map();
  modelIdsByType: Map<PsAiModelType, number> = new Map();
  rateLimits: PsModelRateLimitTracking = {};
  userId: number;
  agentId: number;

  maxTokensOut: number;
  modelTemperature: number;
  reasoningEffort: PsReasoningEffort = "medium";
  maxThinkingTokens: number;

  limitedLLMmaxRetryCount = 5;
  mainLLMmaxRetryCount = 50;
  private readonly forcedTimeoutEscalationStartRetryCount = 10;
  private readonly forcedTimeoutEscalationTargetMs = 30000;
  maxStatefulResponsesModelCacheEntries: number = Math.max(
    1,
    Number.parseInt(
      process.env.PS_RESPONSES_STATEFUL_CACHE_MAX_ENTRIES || "100",
      10
    ) || 100
  );
  modelCallTimeoutMs: number = parseInt(
    process.env.PS_MODEL_CALL_TIMEOUT_MS || "600000"
  );

  constructor(
    aiModels: PsAiModelAttributes[],
    accessConfiguration: YpGroupPrivateAccessConfiguration[],
    maxTokensOut: number = 4096,
    modelTemperature: number = 0.7,
    reasoningEffort: PsReasoningEffort = "medium",
    maxThinkingTokens: number = 0,
    agentId: number,
    userId: number
  ) {
    super();
    this.maxTokensOut = maxTokensOut;
    this.modelTemperature = modelTemperature;
    this.reasoningEffort = reasoningEffort;
    this.maxThinkingTokens = maxThinkingTokens;
    this.userId = userId;
    this.agentId = agentId;
    this.modelCallTimeoutMs = parseInt(
      process.env.PS_MODEL_CALL_TIMEOUT_MS || "600000"
    );
    this.initializeModels(aiModels, accessConfiguration);
  }

  initializeOneModelFromEnv() {
    const modelType = process.env.PS_AI_MODEL_TYPE as PsAiModelType;
    const modelSize = process.env.PS_AI_MODEL_SIZE as PsAiModelSize;
    const modelProvider = process.env.PS_AI_MODEL_PROVIDER as PsAiModelProvider;
    const modelName = process.env.PS_AI_MODEL_NAME;
    let apiKey: string | undefined;
    let createModel: (baseConfig: PsAiModelConfig) => BaseChatModel | undefined;
    const providerKey = modelProvider?.toLowerCase();

    switch (providerKey) {
      case PsAiModelProvider.OpenAI:
      case PsAiModelProvider.OpenAIResponses.toLowerCase():
        apiKey = process.env.OPENAI_API_KEY;
        createModel =
          providerKey === PsAiModelProvider.OpenAIResponses.toLowerCase()
            ? (baseConfig) => new OpenAiResponses(baseConfig)
            : (baseConfig) => new OpenAiChat(baseConfig);
        break;
      case PsAiModelProvider.Anthropic:
        apiKey = process.env.ANTHROPIC_API_KEY;
        createModel = (baseConfig) => new ClaudeChat(baseConfig);
        break;
      case PsAiModelProvider.Google:
        apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        createModel = (baseConfig) => new GoogleGeminiChat(baseConfig);
        break;
      case PsAiModelProvider.Azure:
        apiKey = process.env.AZURE_API_KEY;
        createModel = (baseConfig) => {
          if (
            !process.env.PS_AI_MODEL_ENDPOINT ||
            !process.env.PS_AI_MODEL_DEPLOYMENT_NAME
          ) {
            this.logger.warn("Missing Azure-specific environment variables");
            return undefined;
          }

          return new AzureOpenAiChat({
            ...baseConfig,
            endpoint: process.env.PS_AI_MODEL_ENDPOINT,
            deploymentName: process.env.PS_AI_MODEL_DEPLOYMENT_NAME,
          });
        };
        break;
      default:
        throw new Error(`Unsupported model provider: ${modelProvider}`);
    }

    if (!modelType || !modelSize || !modelProvider || !modelName || !apiKey) {
      this.logger.warn(
        "Missing required environment variables for AI model initialization"
      );
      return;
    }

    const modelKey = `${modelType}_${modelSize}`;
    let model = this.models.get(modelKey);

    if (!model) {
      const baseConfig: PsAiModelConfig = {
        apiKey: apiKey,
        modelName: modelName,
        provider: modelProvider,
        maxTokensOut: this.maxTokensOut,
        temperature: this.modelTemperature,
        reasoningEffort: this.reasoningEffort,
        maxThinkingTokens: this.maxThinkingTokens,
        timeoutMs: this.modelCallTimeoutMs,
        modelType: modelType,
        modelSize: modelSize,
        prices: {} as any,
      };

      model = createModel(baseConfig);
      if (!model) {
        return;
      }

      model.provider = modelProvider;
      this.models.set(modelKey, model);
      this.modelsByType.set(modelType, model);
      this.modelIds.set(modelKey, -1); // Use -1 to indicate ephemeral/no DB row
      this.modelIdsByType.set(modelType, -1);

      this.logger.info(
        `Initialized AI model from environment variables: ${modelKey}`
      );
    }

    return model;
  }

  initializeModels(
    aiModels: PsAiModelAttributes[],
    accessConfiguration: YpGroupPrivateAccessConfiguration[]
  ) {
    if (!aiModels || aiModels.length === 0) {
      this.logger.info(`No AI models found for agent ${this.agentId}`);
      if (process.env.PS_AI_MODEL_TYPE) {
        this.initializeOneModelFromEnv();
      }
      return;
    }

    for (const model of aiModels) {
      const modelType = model.configuration.type;
      const modelSize = model.configuration.modelSize;
      const modelKey = `${modelType}_${modelSize}`;
      this.logger.debug(
        `Initializing model ${model.id} ${modelType} ${modelSize} ${modelKey}`
      );
      const apiKeyConfig = accessConfiguration.find(
        (access) => access.aiModelId === model.id
      );

      if (!apiKeyConfig) {
        this.logger.warn(
          `API key configuration not found for model ${model.id} ${modelType} ${modelSize} ${modelKey}`
        );
        continue;
      }

      const baseConfig: PsAiModelConfig = {
        apiKey: apiKeyConfig.apiKey,
        modelName: model.configuration.model,
        provider: model.configuration.provider,
        inferenceType: model.configuration.inferenceType,
        regionalProcessing: model.configuration.regionalProcessing,
        maxTokensOut: this.maxTokensOut,
        maxContextTokens: model.configuration.maxContextTokens,
        temperature: this.modelTemperature,
        reasoningEffort: this.reasoningEffort,
        maxThinkingTokens: this.maxThinkingTokens,
        timeoutMs:
          (model.configuration as any).timeoutMs ?? this.modelCallTimeoutMs,
        modelType: modelType,
        modelSize: modelSize,
        prices: model.configuration.prices,
      };

      this.logger.debug(
        `Reasoning effort is set to ${this.reasoningEffort} here`
      );

      let newModel: BaseChatModel;

      switch (model.configuration.provider) {
        case PsAiModelProvider.Anthropic:
          newModel = new ClaudeChat(baseConfig);
          break;
        case PsAiModelProvider.OpenAI:
          newModel = new OpenAiChat(baseConfig);
          break;
        case PsAiModelProvider.OpenAIResponses:
          newModel = new OpenAiResponses(baseConfig);
          break;
        case PsAiModelProvider.Google:
          newModel = new GoogleGeminiChat(baseConfig);
          break;
        case PsAiModelProvider.Azure:
          newModel = new AzureOpenAiChat({
            ...baseConfig,
            endpoint: model.configuration.endpoint!,
            deploymentName: model.configuration.deploymentName!,
          });
          break;
        default:
          this.logger.warn(
            `Unsupported model provider: ${model.configuration.provider}`
          );
          continue;
      }

      newModel.provider = model.configuration.provider;
      newModel.dbModelId = model.id;
      this.models.set(modelKey, newModel);
      this.modelsByType.set(modelType, newModel);
      this.modelIds.set(modelKey, model.id);
      this.modelIdsByType.set(modelType, model.id);

      this.logger.debug(
        `Initialized model ${newModel.config.modelName} ${newModel.config.maxContextTokens} ${newModel.config.maxTokensOut}`
      );
    }

    if (this.models.size === 0) {
      throw new Error("No supported AI models found");
    }
  }

  /**
   * Creates a one-off ephemeral model instance, merging overrides from `options`.
   * If provider is not specified, we'll reuse the provider from the fallback model
   * or environment. This returns `undefined` if no ephemeral override was requested.
   */
  private async createEphemeralModel(
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    options: PsCallModelOptions
  ): Promise<BaseChatModel | undefined> {
    // Determine if user actually wants ephemeral overrides
    const isOverrideRequested =
      (options.modelProvider != null && options.modelName != null) ||
      options.regionalProcessing != null ||
      options.inferenceType != null;

    if (!isOverrideRequested) {
      return undefined;
    } else {
      const loggingOptions: PsCallModelOptions = {
        ...options,
        promptImages: options.promptImages?.map((image) => ({
          ...image,
          data: image.data.slice(0, 200),
        })),
      };
      this.logger.debug(
        `Ephemeral override requested for ${modelType} ${modelSize} ${JSON.stringify(
          loggingOptions,
          null,
          2
        ).slice(0, 500)}…`
      );
    }

    // Fall back to a known model (or the first model of the same type)
    const fallbackModelKey = `${modelType}_${modelSize}`;
    let fallbackModel = this.models.get(fallbackModelKey);
    if (!fallbackModel) {
      // if not found by size, use any model of that type
      fallbackModel = this.modelsByType.get(modelType);
    }

    if (!fallbackModel) {
      // As a last-ditch: might rely on environment
      // You can choose to throw instead if no fallback is found
      this.logger.warn(
        `No fallback model found for ephemeral override of ${modelType} ${modelSize}. Trying to initialize one from environment variables.`
      );
      fallbackModel = this.initializeOneModelFromEnv();
      if (!fallbackModel) {
        this.logger.warn(
          `No fallback model found for ephemeral override of ${modelType} ${modelSize}.`
        );
        return undefined;
      }
    }

    // We need a provider, name, etc. If user didn't supply `modelProvider`, reuse fallback's
    const fallbackProvider =
      fallbackModel.provider ||
      fallbackModel.config?.provider ||
      "";
    const provider = options.modelProvider ?? fallbackProvider;
    const overrideModelName = options.modelName ?? String(fallbackModel.modelName);
    const isContextOnlyOverride =
      options.modelProvider == null && options.modelName == null;

    // Figure out the best API key for that provider:
    const usesFallbackProvider =
      provider.toLowerCase() === fallbackProvider.toLowerCase();
    const fallbackApiKey = usesFallbackProvider
      ? fallbackModel.config?.apiKey
      : undefined;
    const envApiKey = this.getApiKeyForProvider(provider);
    const apiKey =
      (isContextOnlyOverride ? fallbackApiKey : undefined) ||
      envApiKey ||
      fallbackApiKey ||
      "";

    // Try to load model configuration from database for cost reporting
    let dbModel: PsAiModelDb | null = null;
    if (!process.env.DISABLE_DB_INIT) {
      await loadDbModules();
      const sequelizeModule = SequelizeModule;
      const sequelizeInstance = sequelize!;
      const PsAiModelModel = PsAiModel!;

      try {
        const escapedProvider = sequelizeInstance.escape(provider);
        const escapedModelName = sequelizeInstance.escape(overrideModelName);
        dbModel = await PsAiModelModel.findOne({
          where: {
            [sequelizeModule.Op.and]: [
              sequelizeInstance.literal(
                `configuration->>'provider' = ${escapedProvider}`
              ),
              sequelizeInstance.literal(
                `configuration->>'model' = ${escapedModelName}`
              ),
            ],
          },
        });
        if (dbModel) {
          this.logger.info(
            `Loaded ephemeral model from DB: ${provider} ${overrideModelName}`
          );
        } else {
          this.logger.warn(
            `Ephemeral model ${provider} ${overrideModelName} not found in DB`
          );
        }
      } catch (err) {
        this.logger.error(`Error looking up ephemeral model in DB: ${err}`);
      }
    }

    const dbConfig = dbModel?.configuration as
      | PsAiModelConfiguration
      | undefined;

    // Merge ephemeral config
    const ephemeralConfig: PsAiModelConfig = {
      apiKey,
      modelName:
        overrideModelName ?? dbConfig?.model ?? fallbackModel.modelName,
      provider: provider,
      inferenceType:
        options.inferenceType ??
        dbConfig?.inferenceType ??
        fallbackModel.config?.inferenceType,
      regionalProcessing:
        options.regionalProcessing ??
        dbConfig?.regionalProcessing ??
        fallbackModel.config?.regionalProcessing,
      maxTokensOut:
        options.maxTokensOut ?? this.maxTokensOut ?? dbConfig?.maxTokensOut,
      maxContextTokens: dbConfig?.maxContextTokens,
      temperature:
        options.modelTemperature ??
        dbConfig?.defaultTemperature ??
        this.modelTemperature,
      reasoningEffort: options.modelReasoningEffort ?? this.reasoningEffort,
      maxThinkingTokens:
        options.modelMaxThinkingTokens ?? this.maxThinkingTokens,
      modelType: options.modelType ?? dbConfig?.type ?? modelType,
      modelSize: dbConfig?.modelSize ?? modelSize,
      timeoutMs: dbConfig?.timeoutMs ?? this.modelCallTimeoutMs,
      prices: dbConfig?.prices ?? fallbackModel.config?.prices ?? ({} as any),
    };

    this.logger.debug(
      `Ephemeral config: ${JSON.stringify(ephemeralConfig, null, 2)}`
    );

    const usesOpenAiResponses =
      provider.toLowerCase() === PsAiModelProvider.OpenAIResponses.toLowerCase() ||
      (provider.toLowerCase() === PsAiModelProvider.OpenAI &&
        Boolean(options.useOpenAiResponsesIfOpenAi));
    const responsesStateKey = this.getResponsesStateKey(options);
    const useStatefulResponsesCache =
      usesOpenAiResponses && Boolean(responsesStateKey);
    const statelessCacheKey = useStatefulResponsesCache
      ? undefined
      : JSON.stringify({
          config: ephemeralConfig,
          useThoughtSignatures: Boolean(options.useThoughtSignatures),
          useOpenAiResponsesIfOpenAi: Boolean(options.useOpenAiResponsesIfOpenAi),
          responsesStateKey: undefined,
        });

    if (statelessCacheKey) {
      const cachedModel = this.models.get(statelessCacheKey);
      if (cachedModel) {
        this.logger.debug(
          `Using cached ephemeral model for config: ${statelessCacheKey}`
        );
        return cachedModel;
      }
    }

    // Construct ephemeral model
    let ephemeralModel: BaseChatModel;
    switch (provider.toLowerCase()) {
      case PsAiModelProvider.OpenAI:
        if (options.useOpenAiResponsesIfOpenAi) {
          ephemeralModel = new OpenAiResponses(ephemeralConfig);
        } else {
          ephemeralModel = new OpenAiChat(ephemeralConfig);
        }
        break;
      case PsAiModelProvider.OpenAIResponses.toLowerCase():
        ephemeralModel = new OpenAiResponses(ephemeralConfig);
        break;
      case PsAiModelProvider.Anthropic:
        ephemeralModel = new ClaudeChat(ephemeralConfig);
        break;
      case PsAiModelProvider.Google:
        if (options.useThoughtSignatures) {
          ephemeralModel = new GoogleGeminiThought(ephemeralConfig);
        } else {
          ephemeralModel = new GoogleGeminiChat(ephemeralConfig);
        }
        break;
      case PsAiModelProvider.Azure:
        // You may want to incorporate fallback's endpoint and deployment
        // or see if user provided them in `options` somehow
        ephemeralModel = new AzureOpenAiChat({
          ...ephemeralConfig,
          endpoint:
            (fallbackModel as any).endpoint ?? process.env.PS_AI_MODEL_ENDPOINT,
          deploymentName:
            (fallbackModel as any).deploymentName ??
            process.env.PS_AI_MODEL_DEPLOYMENT_NAME,
        });
        break;
      default:
        this.logger.warn(
          `Unsupported ephemeral provider: ${provider} ${modelType} ${modelSize} ${JSON.stringify(
            options,
            null,
            2
          )}`
        );
        return undefined;
    }

    if (dbModel) {
      ephemeralModel.dbModelId = dbModel.id;
    }

    ephemeralModel.provider = provider;

    if (useStatefulResponsesCache) {
      return this.getStateIsolatedResponsesModel(
        ephemeralModel,
        options,
        true
      );
    }

    // Cache the ephemeral model so subsequent calls reuse the instance
    this.models.set(statelessCacheKey!, ephemeralModel);
    this.modelIds.set(statelessCacheKey!, dbModel?.id ?? -1);

    return ephemeralModel;
  }

  private getApiKeyForProvider(provider: string): string {
    switch (provider.toLowerCase()) {
      case PsAiModelProvider.OpenAI:
      case PsAiModelProvider.OpenAIResponses.toLowerCase():
        return process.env.OPENAI_API_KEY || "";
      case PsAiModelProvider.Anthropic:
        return process.env.ANTHROPIC_API_KEY || "";
      case PsAiModelProvider.Google:
        return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
      case PsAiModelProvider.Azure:
        return process.env.AZURE_API_KEY || "";
      default:
        return "";
    }
  }

  /**
   * Returns a non-mutating merge of the base prices with any provided override.
   * If no override is supplied, the original prices are returned.
   */
  private applyPriceOverride(
    basePrices: PsBaseModelPriceConfiguration | undefined,
    priceOverride?: Partial<PsBaseModelPriceConfiguration>
  ): PsBaseModelPriceConfiguration | undefined {
    if (!priceOverride || Object.keys(priceOverride).length === 0) {
      return basePrices;
    } else {
      this.logger.debug(`Price override created but NOT applied: ${JSON.stringify(priceOverride)}`);
    }
    if (!basePrices) {
      return priceOverride as PsBaseModelPriceConfiguration;
    }
    return {
      ...basePrices,
      ...priceOverride,
    };
  }

  async callModel(
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions
  ) {
    if (process.env.PS_PROMPT_DEBUG) {
      this.logger.debug("\n\n\n\n\n\n\n\nDebugging callModel");
      this.logger.debug(`modelType: ${modelType}`);
      this.logger.debug(`modelSize: ${modelSize}`);
      this.logger.debug(`messages: ${JSON.stringify(messages)}`);
    }

    switch (modelType) {
      case PsAiModelType.Text:
      case PsAiModelType.TextReasoning:
        return await this.callTextModel(
          modelType,
          modelSize,
          messages,
          options
        );
      case PsAiModelType.Embedding:
        return await this.callEmbeddingModel(messages);
      case PsAiModelType.MultiModal:
        return await this.callMultiModalModel(messages);
      case PsAiModelType.Audio:
        return await this.callAudioModel(messages);
      case PsAiModelType.Video:
        return await this.callVideoModel(messages);
      case PsAiModelType.Image:
        return await this.callImageModel(messages);
      default:
        throw new Error(`Unsupported model type: ${modelType}`);
    }
  }

  async callTextModel(
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions
  ) {
    // 1) Check for ephemeral override
    const ephemeralModel = await this.createEphemeralModel(
      modelType,
      modelSize,
      options
    );
    if (ephemeralModel) {
      // If ephemeral model is requested, just use it
      return await this.runTextModelCall(
        ephemeralModel,
        ephemeralModel.config?.modelType ?? modelType,
        ephemeralModel.config?.modelSize ?? modelSize,
        messages,
        options
      );
    }

    // 2) Otherwise, do your fallback priority as before
    const getFallbackPriority = (size: PsAiModelSize): PsAiModelSize[] => {
      switch (size) {
        case PsAiModelSize.Large:
          return [
            PsAiModelSize.Large,
            PsAiModelSize.Medium,
            PsAiModelSize.Small,
          ];
        case PsAiModelSize.Medium:
          return [
            PsAiModelSize.Medium,
            PsAiModelSize.Large,
            PsAiModelSize.Small,
          ];
        case PsAiModelSize.Small:
          return [
            PsAiModelSize.Small,
            PsAiModelSize.Medium,
            PsAiModelSize.Large,
          ];
        default:
          return [
            PsAiModelSize.Medium,
            PsAiModelSize.Large,
            PsAiModelSize.Small,
          ];
      }
    };

    const modelSizePriority = getFallbackPriority(modelSize);

    let model: BaseChatModel | undefined;
    let selectedModelSize: PsAiModelSize = modelSize;

    for (const size of modelSizePriority) {
      const modelKey = `${modelType}_${size}`;
      this.logger.debug(`Checking model ${modelKey}`);
      model = this.models.get(modelKey);
      if (model) {
        selectedModelSize = size;
        if (size !== modelSize) {
          this.logger.warn(`Model not found for ${modelSize}, using ${size}`);
        }
        break;
      }
    }

    if (!model) {
      // fallback to "any" model by type
      model = this.modelsByType.get(modelType);
      if (model) {
        this.logger.warn(
          `Model not found by size, using default ${modelType} model`
        );
        selectedModelSize = model.config.modelSize;
      } else {
        throw new Error(`No model available for type ${modelType}`);
      }
    }

    model = this.getStateIsolatedResponsesModel(model, options);

    return this.runTextModelCall(
      model,
      modelType,
      selectedModelSize,
      messages,
      options
    );
  }

  static prohibitedContentErrors: string[] = [
    "prohibited content",
    "response was blocked",
    "response was blocked due to prohibited content",
    "response was blocked due to other",
    "failed to generate output due to special tokens",
    "invalid content",
    "violating our usage policy",
    "content management policy",
    "response was blocked due to prohibited_content",
    "prohibited_content",
    "not allowed by our safety system",
  ];

  static providerAuthenticationErrors: string[] = [
    "invalid_grant",
    "invalid_rapt",
    "reauth related error",
    "unauthorized",
    "unauthenticated",
    "authentication failed",
    "invalid api key",
    "api key not valid",
    "permission denied",
  ];

  static getErrorStatus = (err: any): number | undefined => {
    const status =
      err?.response?.status ?? err?.status ?? err?.statusCode ?? err?.code;
    if (typeof status === "number" && Number.isFinite(status)) {
      return status;
    }
    if (typeof status === "string") {
      const parsed = Number.parseInt(status, 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  static getErrorMessage = (err: any): string => {
    const rawMessage =
      err?.response?.data?.error?.message ??
      err?.response?.data?.message ??
      err?.message ??
      err?.response?.data ??
      "";
    if (typeof rawMessage === "string") {
      return rawMessage;
    }
    try {
      return JSON.stringify(rawMessage);
    } catch {
      return String(rawMessage);
    }
  };

  static isProhibitedContentError = (err: any) => {
    const lowerCaseMessage = PsAiModelManager.getErrorMessage(err).toLowerCase();

    const isError = PsAiModelManager.prohibitedContentErrors.some((error) =>
      lowerCaseMessage.includes(error)
    );
    if (isError) {
      this.logger.error(
        `Prohibited content error, invoking fallback model: ${err.message}`
      );
    }
    return isError;
  };

  static isMissingParameterError = (err: any) => {
    const status = PsAiModelManager.getErrorStatus(err);
    const message = PsAiModelManager.getErrorMessage(err);
    return (
      status === 400 &&
      typeof message === "string" &&
      message.toLowerCase().includes("missing parameter")
    );
  };

  static isProviderAuthenticationError = (err: any) => {
    const status = PsAiModelManager.getErrorStatus(err);
    const lowerCaseMessage = PsAiModelManager.getErrorMessage(err).toLowerCase();
    if (
      status !== undefined &&
      ![400, 401, 403].includes(status)
    ) {
      return false;
    }
    return PsAiModelManager.providerAuthenticationErrors.some((error) =>
      lowerCaseMessage.includes(error)
    );
  };

  static general400Error = (err: any) => {
    const status = PsAiModelManager.getErrorStatus(err);
    const message = PsAiModelManager.getErrorMessage(err);
    return (
      status === 400 ||
      (typeof message === "string" && message.startsWith("400"))
    );
  };

  private logDetailedServerError(
    model: BaseChatModel,
    error: any,
    messages: PsModelMessage[],
    retryCount: number
  ) {
    try {
      const status = error?.response?.status ?? error.status;
      const statusText = error?.response?.statusText ?? "";
      this.logger.error(
        `5xx error from model ${model.modelName} (${
          retryCount + 1
        } retries): ${status} ${statusText} - ${error.message}`
      );
      if (error?.response?.data) {
        const data =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data, null, 2);
        this.logger.error(`Response body: ${data}`);
      }
      if (error?.response?.headers) {
        this.logger.error(
          `Response headers: ${JSON.stringify(error.response.headers, null, 2)}`
        );
      }
      if (error.stack) {
        this.logger.error(error.stack);
      }
      const prompt = model.prettyPrintPromptMessages(
        messages.map((m) => ({ role: m.role, content: m.message }))
      );
      this.logger.warn(`Prompt leading to error:\n${prompt}`);
    } catch (logErr) {
      this.logger.error(`Failed to log detailed server error: ${logErr}`);
    }
  }

  /**
   * Actually does the call against the chosen model,
   * with your retry logic, parseJson, usage tracking, etc.
   */
  private async runTextModelCall(
    model: BaseChatModel,
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions
  ): Promise<any> {
    let retryCount = 0;
    let maxRetries = options.limitedRetries
      ? this.limitedLLMmaxRetryCount
      : this.mainLLMmaxRetryCount;

    if (options.overrideMaxRetries) {
      maxRetries = options.overrideMaxRetries;
    }

    // Track if we've tried the fallback model yet:
    let usedFallback = false;
    const hasExplicitFallback = !!(
      options.fallbackModelProvider && options.fallbackModelName
    );

    // Simple helper to check if error is 5xx or "prohibited content".
    const is5xxError = (err: any, retryCount: number) => {
      const message = (
        typeof err === "string" ? err : err?.message || ""
      ).toLowerCase();
      const status =
        err?.response?.status ?? err?.status ?? err?.statusCode ?? err?.code;
      const statusNumber =
        typeof status === "number"
          ? status
          : typeof status === "string"
            ? Number.parseInt(status, 10)
            : undefined;
      const has529InMessage = /\b529\b/.test(message);

      // Check for socket/network errors (transient connection issues)
      const causeCode = err?.cause?.code;
      const isSocketError =
        causeCode === "UND_ERR_SOCKET" ||
        causeCode === "ECONNRESET" ||
        causeCode === "ECONNREFUSED" ||
        causeCode === "ETIMEDOUT" ||
        causeCode === "EPIPE" ||
        message.includes("terminated") ||
        message.includes("socket hang up") ||
        message.includes("network error");

      if (
        (typeof statusNumber === "number" &&
          Number.isFinite(statusNumber) &&
          statusNumber >= 500 &&
          statusNumber < 600) ||
        has529InMessage ||
        message.includes("500 internal server error") ||
        message.includes("503 service unavailable") ||
        message.includes("fetch failed") ||
        message.includes("overloaded") ||
        isSocketError
      ) {
        this.logDetailedServerError(model, err, messages, retryCount);
        return true;
      }
      return false;
    };

    const isUnknownError = (err: any) => {
      if (!err.message) return false;
      const lowerCaseMessage = err.message.toLowerCase();
      return lowerCaseMessage.includes("error: unknown");
    };

    while (retryCount < maxRetries) {
      try {
        this.logger.info(`Calling ${model.modelName}...`);
        if (options.simulateContentErrorForFallbackDebugging) {
          throw new Error("Test error: Response was blocked due to OTHER");
        }
        const timeoutMs = this.getTimeoutMsForRetry(
          options,
          model.config.timeoutMs,
          retryCount,
          maxRetries
        );
        const requestOptions = this.getModelRequestOptions(options);
        const results = (await this.callWithTimeout(
          model,
          messages,
          options.streamingCallbacks,
          timeoutMs,
          options.promptImages,
          options.functions,
          options.toolChoice,
          options.allowedTools,
          requestOptions
        )) as PsBaseModelReturnParameters | undefined;

        if (results) {
          const {
            tokensIn,
            tokensOut,
            cachedInTokens,
            reasoningTokens,
            audioTokens,
            usageItemData,
            content,
            toolCalls,
          } = results;

          const configuredPrices =
            this.applyPriceOverride(
              model.config?.prices,
              options.priceOverride
            ) ?? model.config.prices;

          await this.saveTokenUsageItem({
            modelName: String(model.modelName),
            modelProvider: model.provider ?? "Unknown",
            prices: configuredPrices,
            modelType,
            modelSize,
            tokensIn,
            cachedInTokens: cachedInTokens ?? 0,
            tokensOut,
            reasoningTokens,
            audioTokens,
            streaming: Boolean(options.streamingCallbacks),
            modelId: model.dbModelId,
            regionalProcessing: model.config?.regionalProcessing,
            inferenceType: model.config?.inferenceType,
            usageItemData,
          });

          await this.saveTokenUsage(
            model.modelName,
            model.provider ?? "Unknown",
            configuredPrices,
            modelType,
            modelSize,
            tokensIn,
            cachedInTokens ?? 0,
            tokensOut,
            model.dbModelId
          );

          const hasToolCalls = Boolean(toolCalls && toolCalls.length);
          const trimmedContent = content.trim();
          if (
            options.returnBaseModelResult &&
            (hasToolCalls || trimmedContent || results.phase)
          ) {
            return { ...results, content: trimmedContent };
          }

          if (hasToolCalls) {
            return { toolCalls };
          }
          if (options.parseJson) {
            let parsedJson: unknown;
            try {
              parsedJson = this.parseJsonResponse(trimmedContent);
            } catch (error) {
              retryCount++;
              this.logger.warn(
                `JSON parse failure: retrying callTextModel. Attempt #${retryCount}`
              );
              if (retryCount >= this.limitedLLMmaxRetryCount - 1) {
                throw new Error(
                  `500 Internal Server Error: JSON parse failure, max retries reached, rethrowing error.`
                );
              }
              await this.sleepBeforeRetry(retryCount);
              continue;
            }
            // Some models might respond with stringified empty array etc.
            if (
              parsedJson === '"[]"' ||
              parsedJson === "[]" ||
              parsedJson === "'[]'"
            ) {
              this.logger.warn(
                `JSON processing returned an empty array string: ${parsedJson}`
              );
              parsedJson = [];
            }
            return parsedJson;
          } else {
            return trimmedContent;
          }
        } else {
          // If results are empty
          retryCount++;
          this.logger.warn(
            `callTextModel response was empty, retrying. Attempt #${retryCount}`
          );
          await this.sleepBeforeRetry(retryCount);
        }
      } catch (error: any) {
        const isProviderAuthenticationError =
          PsAiModelManager.isProviderAuthenticationError(error);

        if (PsAiModelManager.isMissingParameterError(error)) {
          this.logger.error(
            `Missing parameter error from model: ${error.message || error}`
          );
          throw error;
        }

        // Provider auth failures can be surfaced as 400s by SDKs, but they
        // are still eligible for an immediate fallback model attempt.
        if (isProviderAuthenticationError && !hasExplicitFallback) {
          this.logger.error(
            `Provider authentication error from model: ${error.message || error}`
          );
          throw error;
        }

        if (
          PsAiModelManager.general400Error(error) &&
          retryCount > 1 &&
          !isProviderAuthenticationError
        ) {
          this.logger.error(
            `General 400 error from model: ${error.message || error}`
          );
          throw error;
        }

        if (error.message === "Model call timed out") {
          const timedOutAtMs = this.getTimeoutMsForRetry(
            options,
            model.config.timeoutMs,
            retryCount,
            maxRetries
          );
          retryCount++;
          this.logger.warn(
            `Model call timed out after ${timedOutAtMs}ms, retrying immediately. Attempt #${retryCount}`
          );
          continue;
        }
        if (TokenLimitChunker.isTokenLimitError(error)) {
          if (options.disableChunkingRetry) {
            this.logger.error(
              "Token limit error encountered after chunking; giving up."
            );
            throw error;
          }
          // Disable chunking when using the OpenAI Responses API
          const usingOpenAiResponses =
            model instanceof OpenAiResponses ||
            (model.provider || "").toLowerCase() ===
              PsAiModelProvider.OpenAIResponses;
          if (usingOpenAiResponses) {
            this.logger.warn(
              "TokenLimitChunker disabled for OpenAI Responses; rethrowing error."
            );
            throw error;
          }
          this.logger.error(
            "Token limit exceeded, invoking chunking handler and retrying"
          );
          const handler: TokenLimitChunker = new TokenLimitChunker(this);
          return await handler.handle(
            model,
            modelType,
            modelSize,
            messages,
            options,
            error
          );
        }
        if (is5xxError(error, retryCount) && retryCount < 3) {
          retryCount++;
          this.logger.warn(
            `5xx error: retrying callTextModel. Attempt #${retryCount}`
          );
          await this.sleepBeforeRetry(retryCount);
          continue;
        }
        let tooMany429s = false;
        if (
          options.fallbackModelProvider &&
          !usedFallback &&
          options.retryLimitFor429sUntilFallback !== undefined &&
          error.message &&
          error.message.includes("429") &&
          retryCount >= options.retryLimitFor429sUntilFallback
        ) {
          tooMany429s = true;
          this.logger.warn(
            `Encountered too many 429 errors. Attempting fallback model: ${options.fallbackModelProvider} / ${options.fallbackModelName}`
          );
        }

        let tooManyRetriesWithFallback = false;
        if (
          retryCount >= this.limitedLLMmaxRetryCount - 1 &&
          options.fallbackModelProvider &&
          !usedFallback
        ) {
          tooManyRetriesWithFallback = true;
        }

        if (
          (is5xxError(error, retryCount) ||
            isProviderAuthenticationError ||
            PsAiModelManager.isProhibitedContentError(error) ||
            tooMany429s ||
            tooManyRetriesWithFallback ||
            isUnknownError(error)) &&
          !usedFallback
        ) {
          // If we have a fallback model defined in options, try once
          if (options.fallbackModelProvider && options.fallbackModelName) {
            this.logger.warn(
              `Encountered 5xx, provider auth, content-prohibited error or too many 429s. Attempting fallback model: ${options.fallbackModelProvider} / ${options.fallbackModelName}`
            );

            // Create ephemeral fallback with user-supplied fallback provider/name:
            const fallbackEphemeral = await this.createEphemeralModel(
              options.fallbackModelType ?? modelType,
              modelSize,
              {
                modelProvider: options.fallbackModelProvider,
                modelName: options.fallbackModelName,
                inferenceType: options.inferenceType,
                regionalProcessing: options.regionalProcessing,
                modelTemperature: options.modelTemperature,
                safetyIdentifier: options.safetyIdentifier,
                responsesStateKey: options.responsesStateKey,
                maxTokensOut: options.maxTokensOut,
                modelMaxThinkingTokens: options.modelMaxThinkingTokens,
                modelReasoningEffort: options.modelReasoningEffort,
              }
            );
            if (!fallbackEphemeral) {
              this.logger.error(
                `Unable to create fallback ephemeral model, rethrowing error. All debug information: ${JSON.stringify(
                  {
                    error,
                    options,
                    model,
                    messages,
                    retryCount,
                    maxRetries,
                    usedFallback,
                    tooMany429s,
                    is5xxError: is5xxError(error, retryCount),
                    isUnknownError: isUnknownError(error),
                  },
                  null,
                  2
                )}`
              );
              throw error;
            }

            usedFallback = true;

            // Run the fallback through the same retry path as a normal model
            // call, but prevent another fallback hop from this fallback.
            try {
              const fallbackOptions: PsCallModelOptions = { ...options };
              delete fallbackOptions.fallbackModelProvider;
              delete fallbackOptions.fallbackModelName;
              delete fallbackOptions.fallbackModelType;
              delete fallbackOptions.simulateContentErrorForFallbackDebugging;
              fallbackOptions.disableChunkingRetry = true;
              if (fallbackOptions.parseJson) {
                const maxFallbackJsonParseAttempts = 4;
                fallbackOptions.overrideMaxRetries = Math.min(
                  fallbackOptions.overrideMaxRetries ??
                    maxFallbackJsonParseAttempts,
                  maxFallbackJsonParseAttempts
                );
              }

              return await this.runTextModelCall(
                fallbackEphemeral,
                fallbackEphemeral.config?.modelType ?? modelType,
                fallbackEphemeral.config?.modelSize ?? modelSize,
                messages,
                fallbackOptions
              );
            } catch (fallbackError) {
              if (TokenLimitChunker.isTokenLimitError(fallbackError)) {
                if (options.disableChunkingRetry) {
                  this.logger.error(
                    "Token limit error encountered after chunking; giving up."
                  );
                  throw fallbackError;
                }
                // Disable chunking when using the OpenAI Responses API
                const fallbackUsingOpenAiResponses =
                  fallbackEphemeral instanceof OpenAiResponses ||
                  ((fallbackEphemeral.provider || "").toLowerCase() ===
                    PsAiModelProvider.OpenAIResponses);
                if (fallbackUsingOpenAiResponses) {
                  this.logger.warn(
                    "TokenLimitChunker disabled for OpenAI Responses (fallback); rethrowing error."
                  );
                  throw fallbackError;
                }
                this.logger.error(
                  "Token limit exceeded in fallback model, invoking chunking handler and retrying"
                );
                const handler: TokenLimitChunker = new TokenLimitChunker(this);
                return await handler.handle(
                  fallbackEphemeral,
                  fallbackEphemeral.config?.modelType ?? modelType,
                  fallbackEphemeral.config?.modelSize ?? modelSize,
                  messages,
                  options,
                  fallbackError
                );
              }
              // If fallback also fails, throw the original or fallback error
              this.logger.error("Fallback model also failed. Throwing error.");
              throw fallbackError;
            }
          }
        }

        // If the error was not 5xx or prohibited, or fallback is not possible or used up:
        if (error.message && error.message.includes("429")) {
          this.logger.warn(
            "429 error: rate limit or too many requests; retrying..."
          );
        } else {
          this.logger.error(`Error from model: ${error.message || error}`);
        }

        if (retryCount >= maxRetries - 1) {
          this.logger.error("Reached max retries, rethrowing error.");
          throw error;
        }

        retryCount++;
        await this.sleepBeforeRetry(retryCount);
      }
    }

    this.logger.error(
      "Unrecoverable Error in runTextModelCall method - no valid response after retries"
    );
    throw new Error("Model call failed after maximum retries");
  }

  private getResponsesRuntimeOverrides(
    model: OpenAiResponses,
    options: PsCallModelOptions
  ): Pick<
    PsOpenAiModelConfig,
    | "inferenceType"
    | "maxTokensOut"
    | "temperature"
    | "reasoningEffort"
    | "maxThinkingTokens"
  > {
    const baseConfig = model.getCloneConfig();

    return {
      inferenceType: options.inferenceType ?? baseConfig.inferenceType,
      maxTokensOut:
        options.maxTokensOut ?? this.maxTokensOut ?? baseConfig.maxTokensOut,
      temperature:
        options.modelTemperature ??
        baseConfig.temperature ??
        this.modelTemperature,
      reasoningEffort:
        options.modelReasoningEffort ??
        this.reasoningEffort ??
        baseConfig.reasoningEffort,
      maxThinkingTokens:
        options.modelMaxThinkingTokens ??
        this.maxThinkingTokens ??
        baseConfig.maxThinkingTokens,
    };
  }

  private getStatefulResponsesCacheKey(
    model: OpenAiResponses,
    responsesStateKey: string
  ): string {
    const transportIdentity = model.getResponsesContinuationIdentity();

    return JSON.stringify({
      responsesStateKey,
      provider: model.provider ?? model.config?.provider ?? null,
      modelName: transportIdentity.modelName,
      dbModelId: model.dbModelId ?? null,
      regionalProcessing: transportIdentity.regionalProcessing ?? null,
      transportBaseUrl: transportIdentity.transportBaseUrl ?? null,
      usingAzure: transportIdentity.usingAzure,
    });
  }

  private getStateIsolatedResponsesModel(
    model: BaseChatModel,
    options: PsCallModelOptions,
    cacheOriginalModel: boolean = false
  ): BaseChatModel {
    if (!(model instanceof OpenAiResponses)) {
      return model;
    }

    const responsesStateKey = this.getResponsesStateKey(options);
    if (!responsesStateKey) {
      return model;
    }

    const cacheKey = this.getStatefulResponsesCacheKey(
      model,
      responsesStateKey
    );
    const runtimeOverrides = this.getResponsesRuntimeOverrides(model, options);
    const cachedModel = this.getCachedStatefulResponsesModel(cacheKey);
    if (cachedModel) {
      cachedModel.applyRuntimeResponsesOverrides(runtimeOverrides);
      return cachedModel;
    }

    const isolatedModel = cacheOriginalModel
      ? model
      : new OpenAiResponses(model.getCloneConfig());
    isolatedModel.provider = model.provider;
    isolatedModel.dbModelId = model.dbModelId;
    isolatedModel.applyRuntimeResponsesOverrides(runtimeOverrides);
    this.cacheStatefulResponsesModel(cacheKey, isolatedModel);

    return isolatedModel;
  }

  private getCachedStatefulResponsesModel(
    cacheKey: string
  ): OpenAiResponses | undefined {
    const cachedModel = this.statefulResponsesModelCache.get(cacheKey);
    if (!cachedModel) {
      return undefined;
    }

    this.statefulResponsesModelCache.delete(cacheKey);
    this.statefulResponsesModelCache.set(cacheKey, cachedModel);
    return cachedModel;
  }

  private cacheStatefulResponsesModel(
    cacheKey: string,
    model: OpenAiResponses
  ): void {
    if (this.statefulResponsesModelCache.has(cacheKey)) {
      this.statefulResponsesModelCache.delete(cacheKey);
    }

    this.statefulResponsesModelCache.set(cacheKey, model);

    while (
      this.statefulResponsesModelCache.size >
      this.maxStatefulResponsesModelCacheEntries
    ) {
      const oldestKey = this.statefulResponsesModelCache.keys().next()
        .value as string | undefined;
      if (!oldestKey) {
        break;
      }

      this.statefulResponsesModelCache.delete(oldestKey);
      this.logger.debug(
        `Evicted stateful OpenAI Responses model from cache: ${oldestKey}`
      );
    }
  }

  private getResponsesStateKey(
    options: PsCallModelOptions
  ): string | undefined {
    const responsesStateKey = options.responsesStateKey?.trim();
    if (responsesStateKey) {
      return responsesStateKey;
    }

    const safetyIdentifier = options.safetyIdentifier?.trim();
    return safetyIdentifier ? safetyIdentifier : undefined;
  }

  private getModelRequestOptions(
    options: PsCallModelOptions
  ): PsModelRequestOptions | undefined {
    if (!options.safetyIdentifier && !options.geminiRegions?.length) {
      return undefined;
    }

    return {
      safetyIdentifier: options.safetyIdentifier,
      geminiRegions: options.geminiRegions,
    };
  }

  private getTimeoutMsForRetry(
    options: PsCallModelOptions,
    modelTimeoutMs: number | undefined,
    retryCount: number,
    maxRetries: number
  ) {
    const configuredTimeoutMs =
      options.forceTimeoutAndRetryMs ?? modelTimeoutMs ?? this.modelCallTimeoutMs;

    if (options.forceTimeoutAndRetryMs === undefined) {
      return configuredTimeoutMs;
    }

    return this.getEscalatedForcedTimeoutMs(
      options.forceTimeoutAndRetryMs,
      retryCount,
      maxRetries
    );
  }

  private getEscalatedForcedTimeoutMs(
    forcedTimeoutMs: number,
    retryCount: number,
    maxRetries: number
  ) {
    const targetTimeoutMs = Math.max(
      forcedTimeoutMs,
      this.forcedTimeoutEscalationTargetMs
    );

    if (
      retryCount < this.forcedTimeoutEscalationStartRetryCount ||
      maxRetries <= this.forcedTimeoutEscalationStartRetryCount ||
      forcedTimeoutMs >= targetTimeoutMs
    ) {
      return forcedTimeoutMs;
    }

    const rampRetryCount =
      maxRetries - this.forcedTimeoutEscalationStartRetryCount;
    const retryProgress =
      (retryCount - this.forcedTimeoutEscalationStartRetryCount + 1) /
      rampRetryCount;
    const timeoutMs =
      forcedTimeoutMs + (targetTimeoutMs - forcedTimeoutMs) * retryProgress;

    return Math.ceil(timeoutMs);
  }

  private callWithTimeout(
    model: BaseChatModel,
    messages: PsModelMessage[],
    streamingCallbacks: any,
    timeoutMs: number,
    media?: { mimeType: string; data: string }[],
    tools?: ChatCompletionTool[],
    toolChoice?: ChatCompletionToolChoiceOption | "auto",
    allowedTools?: string[],
    requestOptions?: PsModelRequestOptions
  ): Promise<PsBaseModelReturnParameters | undefined> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Model call timed out")),
        timeoutMs
      );
      model
        .generate(
          messages,
          !!streamingCallbacks,
          streamingCallbacks,
          media,
          tools,
          toolChoice,
          allowedTools,
          requestOptions
        )
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private async sleepBeforeRetry(retryCount: number) {
    const sleepTime = 4500 + Math.max(retryCount - 1, 0) * 5000;
    const cappedTime = Math.min(sleepTime, 90000);
    this.logger.debug(`Sleeping ${cappedTime}ms before next attempt`);
    return new Promise((resolve) => setTimeout(resolve, cappedTime));
  }

  async callEmbeddingModel(messages: PsModelMessage[]) {
    this.logger.warn("Embedding model call not yet implemented");
    return null;
  }

  async callMultiModalModel(messages: PsModelMessage[]) {
    this.logger.warn("Multi-modal model call not yet implemented");
    return null;
  }

  async callAudioModel(messages: PsModelMessage[]) {
    this.logger.warn("Audio model call not yet implemented");
    return null;
  }

  async callVideoModel(messages: PsModelMessage[]) {
    this.logger.warn("Video model call not yet implemented");
    return null;
  }

  async callImageModel(messages: PsModelMessage[]) {
    this.logger.warn("Image model call not yet implemented");
    return null;
  }

  /**
   * Returns the price configuration for a given model call. This will first
   * check for an explicit model override via `options` and attempt to load that
   * model configuration from the database. If not found, it will fall back to
   * the currently loaded models using the same fallback logic as `callTextModel`.
   */
  public async getModelPriceConfiguration(
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    options: PsCallModelOptions
  ): Promise<PsBaseModelPriceConfiguration | undefined> {
    // 1) Ephemeral override - try to fetch config from DB
    if (
      options.modelProvider &&
      options.modelName &&
      !process.env.DISABLE_DB_INIT
    ) {
      await loadDbModules();
      const sequelizeModule = SequelizeModule;
      const sequelizeInstance = sequelize!;
      const PsAiModelModel = PsAiModel!;

      try {
        const escapedProvider = sequelizeInstance.escape(options.modelProvider);
        const escapedModelName = sequelizeInstance.escape(options.modelName);
        const dbModel = await PsAiModelModel.findOne({
          where: {
            [sequelizeModule.Op.and]: [
              sequelizeInstance.literal(
                `configuration->>'provider' = ${escapedProvider}`
              ),
              sequelizeInstance.literal(
                `configuration->>'model' = ${escapedModelName}`
              ),
            ],
          },
        });

        if (dbModel) {
          const cfg = dbModel.configuration as PsAiModelConfiguration;
          this.logger.debug(
            `Found price configuration for override: ${options.modelProvider} ${
              options.modelName
            }: ${JSON.stringify(cfg.prices, null, 2)}`
          );
          return this.applyPriceOverride(cfg.prices, options.priceOverride);
        }
      } catch (err) {
        this.logger.error(`Error looking up price configuration: ${err}`);
      }
    }

    // 2) Fallback model from options
    if (
      options.fallbackModelProvider &&
      options.fallbackModelName &&
      !process.env.DISABLE_DB_INIT
    ) {
      await loadDbModules();
      const sequelizeModule = SequelizeModule;
      const sequelizeInstance = sequelize!;
      const PsAiModelModel = PsAiModel!;

      try {
        const escapedProvider = sequelizeInstance.escape(
          options.fallbackModelProvider
        );
        const escapedModelName = sequelizeInstance.escape(
          options.fallbackModelName
        );
        const dbFallback = await PsAiModelModel.findOne({
          where: {
            [sequelizeModule.Op.and]: [
              sequelizeInstance.literal(
                `configuration->>'provider' = ${escapedProvider}`
              ),
              sequelizeInstance.literal(
                `configuration->>'model' = ${escapedModelName}`
              ),
            ],
          },
        });

        if (dbFallback) {
          const cfg = dbFallback.configuration as PsAiModelConfiguration;
          this.logger.debug(
            `Found price configuration for fallback: ${
              options.fallbackModelProvider
            } ${options.fallbackModelName}: ${JSON.stringify(
              cfg.prices,
              null,
              2
            )}`
          );
          return this.applyPriceOverride(cfg.prices, options.priceOverride);
        }
      } catch (err) {
        this.logger.error(
          `Error looking up fallback price configuration: ${err}`
        );
      }
    }

    // 3) Use loaded models with fallback by size and type
    const getFallbackPriority = (size: PsAiModelSize): PsAiModelSize[] => {
      switch (size) {
        case PsAiModelSize.Large:
          return [
            PsAiModelSize.Large,
            PsAiModelSize.Medium,
            PsAiModelSize.Small,
          ];
        case PsAiModelSize.Medium:
          return [
            PsAiModelSize.Medium,
            PsAiModelSize.Large,
            PsAiModelSize.Small,
          ];
        case PsAiModelSize.Small:
          return [
            PsAiModelSize.Small,
            PsAiModelSize.Medium,
            PsAiModelSize.Large,
          ];
        default:
          return [
            PsAiModelSize.Medium,
            PsAiModelSize.Large,
            PsAiModelSize.Small,
          ];
      }
    };

    for (const size of getFallbackPriority(modelSize)) {
      const key = `${modelType}_${size}`;
      const model = this.models.get(key);
      if (model) {
        return this.applyPriceOverride(
          model.config?.prices,
          options.priceOverride
        );
      }
    }

    const byType = this.modelsByType.get(modelType);
    if (byType) {
      return this.applyPriceOverride(
        byType.config?.prices,
        options.priceOverride
      );
    }

    // Last chance: check environment-initialized model
    const envModel = this.initializeOneModelFromEnv();
    return this.applyPriceOverride(
      envModel?.config?.prices,
      options.priceOverride
    );
  }

  private async getModelIdByProviderAndName(
    provider?: string,
    modelName?: string
  ): Promise<number | undefined> {
    if (!provider || !modelName || process.env.DISABLE_DB_INIT) {
      return undefined;
    }

    await loadDbModules();
    const sequelizeModule = SequelizeModule;
    const sequelizeInstance = sequelize!;
    const PsAiModelModel = PsAiModel!;

    try {
      const escapedProvider = sequelizeInstance.escape(provider);
      const escapedModelName = sequelizeInstance.escape(modelName);
      const dbModel = await PsAiModelModel.findOne({
        where: {
          [sequelizeModule.Op.and]: [
            sequelizeInstance.literal(
              `configuration->>'provider' = ${escapedProvider}`
            ),
            sequelizeInstance.literal(
              `configuration->>'model' = ${escapedModelName}`
            ),
          ],
        },
      });

      return dbModel?.id;
    } catch (err) {
      this.logger.error(
        `Error looking up model id for ${provider} ${modelName}: ${err}`
      );
      return undefined;
    }
  }

  public async saveTokenUsage(
    modelName: string,
    modelProvider: string,
    prices: PsBaseModelPriceConfiguration,
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    tokensIn: number,
    cachedInTokens: number,
    tokensOut: number,
    modelIdOverride?: number,
    callOptions?: PsCallModelOptions
  ) {
    const modelKey = `${modelType}_${modelSize}`;
    let finalModelId =
      modelIdOverride ??
      this.modelIds.get(modelKey) ??
      -1;

    if (
      (modelIdOverride === undefined || modelIdOverride === null) &&
      callOptions
    ) {
      const overrideModelId = await this.getModelIdByProviderAndName(
        callOptions.modelProvider,
        callOptions.modelName
      );
      if (overrideModelId !== undefined) {
        finalModelId = overrideModelId;
      } else {
        const fallbackModelId = await this.getModelIdByProviderAndName(
          callOptions.fallbackModelProvider,
          callOptions.fallbackModelName
        );
        if (fallbackModelId !== undefined) {
          finalModelId = fallbackModelId;
        }
      }
    }

    // Check for usage tracking disable
    const disableUsageTracking =
      process.env.DISABLE_DB_USAGE_TRACKING === "true";
    if (disableUsageTracking) {
      this.logger.info(
        `(Database Usage Tracking Disabled) Token usage for ${modelName} (${modelType} ${modelSize}): in=${tokensIn} cached=${cachedInTokens} out=${tokensOut}`
      );
      if (process.env.PS_EMIT_TOKEN_USAGE_EVENTS) {
        policySynthEvents.emit(TOKEN_USAGE_EVENT, {
          modelName,
          modelProvider,
          modelType,
          modelSize,
          tokensIn,
          tokensOut,
          cachedInTokens,
          agentId: this.agentId,
          userId: this.userId,
          modelId: finalModelId,
          timestamp: Date.now(),
        });
      }
      return;
    }

    let longContextTokenIn = 0;
    let longContextTokenInCached = 0;
    let longContextTokenOut = 0;

    if (
      prices &&
      prices.longContextTokenThreshold &&
      tokensIn >= prices.longContextTokenThreshold
    ) {
      longContextTokenIn = cachedInTokens
        ? tokensIn - cachedInTokens
        : tokensIn;
      longContextTokenOut = tokensOut;
      longContextTokenInCached = cachedInTokens ?? 0;
      tokensIn = 0;
      tokensOut = 0;
      cachedInTokens = 0;
    } else {
      if (cachedInTokens) {
        tokensIn = tokensIn - cachedInTokens;
      }
    }

    if (finalModelId === -1) {
      this.logger.error(
        `Token usage not saved in data base (modelId:${finalModelId}) for agent ${this.agentId} but model is ephemeral`
      );
      if (process.env.PS_EMIT_TOKEN_USAGE_EVENTS) {
        policySynthEvents.emit(TOKEN_USAGE_EVENT, {
          modelName,
          modelProvider,
          modelType,
          modelSize,
          tokensIn,
          tokensOut,
          cachedInTokens,
          agentId: this.agentId,
          userId: this.userId,
          modelId: finalModelId,
          timestamp: Date.now(),
        });
      }
      return;
    }

    if (process.env.DISABLE_DB_INIT) {
      this.logger.info(
        `(Database Initialization Disabled) Token usage for ${modelName} (${modelType} ${modelSize}) was not persisted: in=${tokensIn} cached=${cachedInTokens} out=${tokensOut}`
      );
      if (process.env.PS_EMIT_TOKEN_USAGE_EVENTS) {
        policySynthEvents.emit(TOKEN_USAGE_EVENT, {
          modelName,
          modelProvider,
          modelType,
          modelSize,
          tokensIn,
          tokensOut,
          cachedInTokens,
          agentId: this.agentId,
          userId: this.userId,
          modelId: finalModelId,
          timestamp: Date.now(),
        });
      }
      return;
    }

    try {
      await loadDbModules();
      const sequelizeInstance = sequelize!;
      const PsModelUsageModel = PsModelUsage!;

      await sequelizeInstance.transaction(async (t: Transaction) => {
        const [usage, created] = await PsModelUsageModel.findOrCreate({
          where: {
            model_id: finalModelId,
            agent_id: this.agentId,
          },
          defaults: {
            token_in_count: tokensIn,
            token_out_count: tokensOut,
            token_in_cached_context_count: cachedInTokens,
            long_context_token_in_count: longContextTokenIn,
            long_context_token_out_count: longContextTokenOut,
            long_context_token_in_cached_context_count:
              longContextTokenInCached,
            model_id: finalModelId,
            agent_id: this.agentId,
            user_id: this.userId,
          },
          transaction: t,
        });

        if (!created) {
          await usage.increment(
            {
              token_in_count: tokensIn,
              token_out_count: tokensOut,
              token_in_cached_context_count: cachedInTokens,
              long_context_token_in_count: longContextTokenIn,
              long_context_token_out_count: longContextTokenOut,
              long_context_token_in_cached_context_count:
                longContextTokenInCached,
            },
            { transaction: t }
          );
        }
      });

      this.logger.info(
        `Saved tokens id: ${finalModelId} type:${modelType}/${modelSize} provider:${modelProvider} model:${modelName} agent:${this.agentId} user:${this.userId} in:${tokensIn} cached:${cachedInTokens} longIn:${longContextTokenIn} longCached:${longContextTokenInCached} out:${tokensOut} longOut:${longContextTokenOut}`
      );
      if (process.env.PS_EMIT_TOKEN_USAGE_EVENTS) {
        policySynthEvents.emit(TOKEN_USAGE_EVENT, {
          modelName,
          modelProvider,
          modelType,
          modelSize,
          tokensIn,
          tokensOut,
          cachedInTokens,
          longContextTokenIn: longContextTokenIn,
          longContextTokenInCached: longContextTokenInCached,
          longContextTokenOut: longContextTokenOut,
          agentId: this.agentId,
          userId: this.userId,
          modelId: finalModelId,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      this.logger.error("Error saving or updating token usage in database");
      this.logger.error(error);
      throw error;
    }
  }

  public async saveTokenUsageItem(ctx: PsModelUsageItemSaveContext) {
    await this.modelUsageItemManager.saveUsageItem({
      ...ctx,
      userId: this.userId,
      agentId: this.agentId,
    });
  }

  public async getTokensFromMessages(
    messages: PsModelMessage[]
  ): Promise<number> {
    // Example usage of Tiktoken for GPT-based models
    let encoding;
    // Check for your default text model, or fallback to e.g. "gpt-4"
    if (this.models.has(`${PsAiModelType.Text}_Medium`)) {
      encoding = encoding_for_model(
        this.models.get(`${PsAiModelType.Text}_Medium`)!
          .modelName as TiktokenModel
      );
    } else {
      encoding = encoding_for_model("gpt-4");
    }
    let totalTokens = 0;

    for (const message of messages) {
      // Every message follows <im_start>{role/name}\n{content}<im_end>\n
      totalTokens += 4;
      for (const [key, value] of Object.entries(message)) {
        totalTokens += encoding.encode(value).length;
        if (key === "name") {
          // Role is always required and always 1 token
          totalTokens -= 1;
        }
      }
    }
    // Every reply is primed with <im_start>assistant
    totalTokens += 2;
    encoding.free();

    return totalTokens;
  }
}
