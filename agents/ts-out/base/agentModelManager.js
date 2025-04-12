import { ClaudeChat } from "../aiModels/claudeChat.js";
import { OpenAiChat } from "../aiModels/openAiChat.js";
import { GoogleGeminiChat } from "../aiModels/googleGeminiChat.js";
import { AzureOpenAiChat } from "../aiModels/azureOpenAiChat.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { encoding_for_model } from "tiktoken";
import { PolicySynthAgentBase } from "./agentBase.js";
let cachedPsModelUsage;
let cachedSequelize;
export class PsAiModelManager extends PolicySynthAgentBase {
    models = new Map();
    modelsByType = new Map();
    modelIds = new Map();
    modelIdsByType = new Map();
    rateLimits = {};
    userId;
    agentId;
    maxModelTokensOut;
    modelTemperature;
    reasoningEffort = "medium";
    maxThinkingTokens;
    limitedLLMmaxRetryCount = 3;
    mainLLMmaxRetryCount = 75;
    constructor(aiModels, accessConfiguration, maxModelTokensOut = 4096, modelTemperature = 0.7, reasoningEffort = "medium", maxThinkingTokens = 0, agentId, userId) {
        super();
        this.maxModelTokensOut = maxModelTokensOut;
        this.modelTemperature = modelTemperature;
        this.reasoningEffort = reasoningEffort;
        this.maxThinkingTokens = maxThinkingTokens;
        this.userId = userId;
        this.agentId = agentId;
        this.initializeModels(aiModels, accessConfiguration);
    }
    initializeOneModelFromEnv() {
        const modelType = process.env.PS_AI_MODEL_TYPE;
        const modelSize = process.env.PS_AI_MODEL_SIZE;
        const modelProvider = process.env.PS_AI_MODEL_PROVIDER;
        const modelName = process.env.PS_AI_MODEL_NAME;
        let apiKey;
        switch (modelProvider?.toLowerCase()) {
            case "openai":
                apiKey = process.env.OPENAI_API_KEY;
                break;
            case "anthropic":
                apiKey = process.env.ANTHROPIC_API_KEY;
                break;
            case "google":
                apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
                break;
            case "azure":
                apiKey = process.env.AZURE_API_KEY;
                break;
            default:
                throw new Error(`Unsupported model provider: ${modelProvider}`);
        }
        if (!modelType || !modelSize || !modelProvider || !modelName || !apiKey) {
            this.logger.warn("Missing required environment variables for AI model initialization");
            return;
        }
        const modelKey = `${modelType}_${modelSize}`;
        let model = this.models.get(modelKey);
        if (!model) {
            const baseConfig = {
                apiKey: apiKey,
                modelName: modelName,
                maxTokensOut: this.maxModelTokensOut,
                temperature: this.modelTemperature,
                reasoningEffort: this.reasoningEffort,
                maxThinkingTokens: this.maxThinkingTokens,
                modelType: modelType,
                modelSize: modelSize,
            };
            switch (modelProvider.toLowerCase()) {
                case "anthropic":
                    model = new ClaudeChat(baseConfig);
                    break;
                case "openai":
                    model = new OpenAiChat(baseConfig);
                    break;
                case "google":
                    model = new GoogleGeminiChat(baseConfig);
                    break;
                case "azure":
                    if (!process.env.PS_AI_MODEL_ENDPOINT ||
                        !process.env.PS_AI_MODEL_DEPLOYMENT_NAME) {
                        this.logger.warn("Missing Azure-specific environment variables");
                        return;
                    }
                    model = new AzureOpenAiChat({
                        ...baseConfig,
                        endpoint: process.env.PS_AI_MODEL_ENDPOINT,
                        deploymentName: process.env.PS_AI_MODEL_DEPLOYMENT_NAME,
                    });
                    break;
                default:
                    this.logger.warn(`Unsupported model provider: ${modelProvider}`);
                    return;
            }
            if (model) {
                this.models.set(modelKey, model);
                this.modelsByType.set(modelType, model);
                this.modelIds.set(modelKey, -1); // Use -1 to indicate ephemeral/no DB row
                this.modelIdsByType.set(modelType, -1);
                this.logger.info(`Initialized AI model from environment variables: ${modelKey}`);
            }
            else {
                this.logger.warn(`Failed to initialize AI model from environment variables: ${modelKey}`);
            }
        }
        return model;
    }
    initializeModels(aiModels, accessConfiguration) {
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
            this.logger.debug(`Initializing model ${model.id} ${modelType} ${modelSize} ${modelKey}`);
            const apiKeyConfig = accessConfiguration.find((access) => access.aiModelId === model.id);
            if (!apiKeyConfig) {
                this.logger.warn(`API key configuration not found for model ${model.id}`);
                continue;
            }
            const baseConfig = {
                apiKey: apiKeyConfig.apiKey,
                modelName: model.configuration.model,
                maxTokensOut: this.maxModelTokensOut,
                temperature: this.modelTemperature,
                reasoningEffort: this.reasoningEffort,
                maxThinkingTokens: this.maxThinkingTokens,
                modelType: modelType,
                modelSize: modelSize,
            };
            this.logger.debug(`Reasoning effort is set to ${this.reasoningEffort} here`);
            let newModel;
            switch (model.configuration.provider) {
                case "anthropic":
                    newModel = new ClaudeChat(baseConfig);
                    break;
                case "openai":
                    newModel = new OpenAiChat(baseConfig);
                    break;
                case "google":
                    newModel = new GoogleGeminiChat(baseConfig);
                    break;
                case "azure":
                    newModel = new AzureOpenAiChat({
                        ...baseConfig,
                        endpoint: model.configuration.endpoint,
                        deploymentName: model.configuration.deploymentName,
                    });
                    break;
                default:
                    this.logger.warn(`Unsupported model provider: ${model.configuration.provider}`);
                    continue;
            }
            this.models.set(modelKey, newModel);
            this.modelsByType.set(modelType, newModel);
            this.modelIds.set(modelKey, model.id);
            this.modelIdsByType.set(modelType, model.id);
        }
        if (this.models.size === 0) {
            throw new Error("No supported AI models found");
        }
    }
    /**
     * Creates a one-off ephemeral model instance, merging overrides from `options`.
     * If provider is not specified, we’ll reuse the provider from the fallback model
     * or environment. This returns `undefined` if no ephemeral override was requested.
     */
    createEphemeralModel(modelType, modelSize, options) {
        // Determine if user actually wants ephemeral overrides
        const isOverrideRequested = options.modelProvider != null ||
            options.modelName != null ||
            options.modelTemperature != null ||
            options.modelMaxTokens != null ||
            options.modelMaxThinkingTokens != null ||
            options.modelReasoningEffort != null;
        if (!isOverrideRequested) {
            return undefined;
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
            fallbackModel = this.initializeOneModelFromEnv();
            if (!fallbackModel) {
                this.logger.warn(`No fallback model found for ephemeral override of ${modelType} ${modelSize}.`);
                return undefined;
            }
        }
        // We need a provider, name, etc. If user didn’t supply `modelProvider`, reuse fallback’s
        const fallbackProvider = fallbackModel.provider || ""; // Add a `provider` getter to your BaseChatModel or store it in your config
        const provider = options.modelProvider ?? fallbackProvider;
        // Figure out the best API key for that provider:
        const apiKey = this.getApiKeyForProvider(provider);
        // Merge ephemeral config
        const ephemeralConfig = {
            apiKey,
            modelName: options.modelName ?? fallbackModel.modelName,
            maxTokensOut: options.modelMaxTokens ?? this.maxModelTokensOut,
            temperature: options.modelTemperature ?? this.modelTemperature,
            reasoningEffort: options.modelReasoningEffort ?? this.reasoningEffort,
            maxThinkingTokens: options.modelMaxThinkingTokens ?? this.maxThinkingTokens,
            modelType,
            modelSize,
        };
        // Construct ephemeral model
        let ephemeralModel;
        switch (provider.toLowerCase()) {
            case "openai":
                ephemeralModel = new OpenAiChat(ephemeralConfig);
                break;
            case "anthropic":
                ephemeralModel = new ClaudeChat(ephemeralConfig);
                break;
            case "google":
                ephemeralModel = new GoogleGeminiChat(ephemeralConfig);
                break;
            case "azure":
                // You may want to incorporate fallback’s endpoint and deployment
                // or see if user provided them in `options` somehow
                ephemeralModel = new AzureOpenAiChat({
                    ...ephemeralConfig,
                    endpoint: fallbackModel.endpoint ?? process.env.PS_AI_MODEL_ENDPOINT,
                    deploymentName: fallbackModel.deploymentName ??
                        process.env.PS_AI_MODEL_DEPLOYMENT_NAME,
                });
                break;
            default:
                this.logger.warn(`Unsupported ephemeral provider: ${provider}`);
                return undefined;
        }
        return ephemeralModel;
    }
    getApiKeyForProvider(provider) {
        switch (provider.toLowerCase()) {
            case "openai":
                return process.env.OPENAI_API_KEY || "";
            case "anthropic":
                return process.env.ANTHROPIC_API_KEY || "";
            case "google":
                return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
            case "azure":
                return process.env.AZURE_API_KEY || "";
            default:
                return "";
        }
    }
    async callModel(modelType, modelSize, messages, options) {
        if (process.env.PS_PROMPT_DEBUG) {
            this.logger.debug("\n\n\n\n\n\n\n\nDebugging callModel");
            this.logger.debug(`modelType: ${modelType}`);
            this.logger.debug(`modelSize: ${modelSize}`);
            this.logger.debug(`messages: ${JSON.stringify(messages)}`);
        }
        switch (modelType) {
            case PsAiModelType.Text:
            case PsAiModelType.TextReasoning:
                return await this.callTextModel(modelType, modelSize, messages, options);
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
    async callTextModel(modelType, modelSize, messages, options) {
        // 1) Check for ephemeral override
        const ephemeralModel = this.createEphemeralModel(modelType, modelSize, options);
        if (ephemeralModel) {
            // If ephemeral model is requested, just use it
            return await this.runTextModelCall(ephemeralModel, modelType, modelSize, messages, options);
        }
        // 2) Otherwise, do your fallback priority as before
        const getFallbackPriority = (size) => {
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
        let model;
        let selectedModelSize = modelSize;
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
            // fallback to “any” model by type
            model = this.modelsByType.get(modelType);
            if (model) {
                this.logger.warn(`Model not found by size, using default ${modelType} model`);
            }
            else {
                throw new Error(`No model available for type ${modelType}`);
            }
        }
        return this.runTextModelCall(model, modelType, selectedModelSize, messages, options);
    }
    static prohibitedContentErrors = [
        "prohibited content",
        "response was blocked due to prohibited content",
        "response was blocked due to other",
        "failed to generate output due to special tokens",
        "invalid content",
        "violating our usage policy",
        "content management policy",
        "response was blocked due to prohibited_content",
        "prohibited_content",
        "not allowed by our safety system"
    ];
    static isProhibitedContentError = (err) => {
        if (!err.message)
            return false;
        const lowerCaseMessage = err.message.toLowerCase();
        return PsAiModelManager.prohibitedContentErrors.some((error) => lowerCaseMessage.includes(error));
    };
    /**
     * Actually does the call against the chosen model,
     * with your retry logic, parseJson, usage tracking, etc.
     */
    async runTextModelCall(model, modelType, modelSize, messages, options) {
        let retryCount = 0;
        let maxRetries = options.limitedRetries
            ? this.limitedLLMmaxRetryCount
            : this.mainLLMmaxRetryCount;
        if (options.overrideMaxRetries) {
            maxRetries = options.overrideMaxRetries;
        }
        // Track if we’ve tried the fallback model yet:
        let usedFallback = false;
        // Simple helper to check if error is 5xx or "prohibited content".
        const is5xxError = (err) => err?.response?.status >= 500 && err?.response?.status < 600;
        const isUnknownError = (err) => {
            if (!err.message)
                return false;
            const lowerCaseMessage = err.message.toLowerCase();
            return lowerCaseMessage.includes("error: unknown");
        };
        while (retryCount < maxRetries) {
            try {
                console.log(`Calling ${model.modelName}...`);
                if (options.simulateContentErrorForFallbackDebugging) {
                    throw new Error("Test error: Response was blocked due to OTHER");
                }
                const results = await model.generate(messages, !!options.streamingCallbacks, options.streamingCallbacks);
                if (results) {
                    const { tokensIn, tokensOut, content } = results;
                    await this.saveTokenUsage(modelType, modelSize, tokensIn, tokensOut);
                    if (options.parseJson) {
                        let parsedJson;
                        try {
                            parsedJson = this.parseJsonResponse(content.trim());
                        }
                        catch (error) {
                            retryCount++;
                            this.logger.warn(`JSON parse failure: retrying callTextModel. Attempt #${retryCount}`);
                            await this.sleepBeforeRetry(retryCount);
                            continue;
                        }
                        // Some models might respond with stringified empty array etc.
                        if (parsedJson === '"[]"' ||
                            parsedJson === "[]" ||
                            parsedJson === "'[]'") {
                            this.logger.warn(`JSON processing returned an empty array string: ${parsedJson}`);
                            parsedJson = [];
                        }
                        return parsedJson;
                    }
                    else {
                        return content.trim();
                    }
                }
                else {
                    // If results are empty
                    retryCount++;
                    this.logger.warn(`callTextModel response was empty, retrying. Attempt #${retryCount}`);
                    await this.sleepBeforeRetry(retryCount);
                }
            }
            catch (error) {
                let tooMany429s = false;
                if (options.fallbackModelProvider &&
                    !usedFallback &&
                    options.retryLimitFor429sUntilFallback !== undefined &&
                    error.message &&
                    error.message.includes("429") &&
                    retryCount >= options.retryLimitFor429sUntilFallback) {
                    tooMany429s = true;
                    this.logger.warn(`Encountered too many 429 errors. Attempting fallback model: ${options.fallbackModelProvider} / ${options.fallbackModelName}`);
                }
                if ((is5xxError(error) ||
                    PsAiModelManager.isProhibitedContentError(error) ||
                    tooMany429s ||
                    isUnknownError(error)) &&
                    !usedFallback) {
                    // If we have a fallback model defined in options, try once
                    if (options.fallbackModelProvider && options.fallbackModelName) {
                        this.logger.warn(`Encountered 5xx, content-prohibited error or too many 429s. Attempting fallback model: ${options.fallbackModelProvider} / ${options.fallbackModelName}`);
                        usedFallback = true;
                        // Create ephemeral fallback with user-supplied fallback provider/name:
                        const fallbackEphemeral = this.createEphemeralModel(options.fallbackModelType ?? modelType, modelSize, {
                            modelProvider: options.fallbackModelProvider,
                            modelName: options.fallbackModelName,
                            modelTemperature: options.modelTemperature,
                            modelMaxTokens: options.modelMaxTokens,
                            modelMaxThinkingTokens: options.modelMaxThinkingTokens,
                            modelReasoningEffort: options.modelReasoningEffort,
                        });
                        if (!fallbackEphemeral) {
                            this.logger.warn(`Unable to create fallback ephemeral model, rethrowing error.`);
                            throw error;
                        }
                        // Attempt the call with the fallback ephemeral model (no further fallback if this fails)
                        try {
                            console.log(`Calling Fallback: ${options.fallbackModelProvider}, ${options.fallbackModelName}...`);
                            const fallbackResults = await fallbackEphemeral.generate(messages, !!options.streamingCallbacks, options.streamingCallbacks);
                            if (fallbackResults) {
                                const { tokensIn, tokensOut, content } = fallbackResults;
                                await this.saveTokenUsage(modelType, modelSize, tokensIn, tokensOut);
                                return options.parseJson
                                    ? this.parseJsonResponse(content.trim())
                                    : content.trim();
                            }
                            else {
                                // Fallback returned empty result; let's break out
                                this.logger.warn("Fallback returned empty result; aborting");
                                throw error;
                            }
                        }
                        catch (fallbackError) {
                            // If fallback also fails, throw the original or fallback error
                            this.logger.error("Fallback model also failed. Throwing error.");
                            throw fallbackError;
                        }
                    }
                }
                // If the error was not 5xx or prohibited, or fallback is not possible or used up:
                if (error.message && error.message.includes("429")) {
                    this.logger.warn("429 error: rate limit or too many requests; retrying...");
                }
                else {
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
        this.logger.error("Unrecoverable Error in runTextModelCall method - no valid response after retries");
        throw new Error("Model call failed after maximum retries");
    }
    async sleepBeforeRetry(retryCount) {
        const sleepTime = 4500 + Math.max(retryCount - 1, 0) * 5000;
        this.logger.debug(`Sleeping ${sleepTime}ms before next attempt`);
        return new Promise((resolve) => setTimeout(resolve, sleepTime));
    }
    async callEmbeddingModel(messages) {
        this.logger.warn("Embedding model call not yet implemented");
        return null;
    }
    async callMultiModalModel(messages) {
        this.logger.warn("Multi-modal model call not yet implemented");
        return null;
    }
    async callAudioModel(messages) {
        this.logger.warn("Audio model call not yet implemented");
        return null;
    }
    async callVideoModel(messages) {
        this.logger.warn("Video model call not yet implemented");
        return null;
    }
    async callImageModel(messages) {
        this.logger.warn("Image model call not yet implemented");
        return null;
    }
    async saveTokenUsage(modelType, modelSize, tokensIn, tokensOut) {
        // Check for usage tracking disable
        const disableUsageTracking = process.env.DISABLE_DB_USAGE_TRACKING === "true";
        if (disableUsageTracking) {
            this.logger.info(`(Database Usage Tracking Disabled) Token usage for ${modelType} (${modelSize}): in=${tokensIn} out=${tokensOut}`);
            return;
        }
        // Attempt to find the model in your manager:
        const modelKey = `${modelType}_${modelSize}`;
        const model = this.models.get(modelKey);
        const modelId = this.modelIds.get(modelKey);
        // If ephemeral or missing, fallback to -1 or bail
        const finalModelId = modelId ?? -1; // -1 for ephemeral or not found
        // Lazy-load usage models
        if (!cachedPsModelUsage) {
            const module = await import("../dbModels/modelUsage.js");
            cachedPsModelUsage = module.PsModelUsage;
            const { sequelize } = await import("../dbModels/sequelize.js");
            cachedSequelize = sequelize;
        }
        const PsModelUsage = cachedPsModelUsage;
        const sequelize = cachedSequelize;
        try {
            await sequelize.transaction(async (t) => {
                const [usage, created] = await PsModelUsage.findOrCreate({
                    where: {
                        model_id: finalModelId,
                        agent_id: this.agentId,
                    },
                    defaults: {
                        token_in_count: tokensIn,
                        token_out_count: tokensOut,
                        token_in_cached_context_count: 0,
                        model_id: finalModelId,
                        agent_id: this.agentId,
                        user_id: this.userId,
                    },
                    transaction: t,
                });
                if (!created) {
                    await usage.increment({
                        token_in_count: tokensIn,
                        token_out_count: tokensOut,
                    }, { transaction: t });
                }
            });
            this.logger.info(`Token usage updated (modelId:${finalModelId}) for agent ${this.agentId}`);
        }
        catch (error) {
            this.logger.error("Error saving or updating token usage in database");
            this.logger.error(error);
            throw error;
        }
    }
    async getTokensFromMessages(messages) {
        // Example usage of Tiktoken for GPT-based models
        let encoding;
        // Check for your default text model, or fallback to e.g. "gpt-4"
        if (this.models.has(`${PsAiModelType.Text}_Medium`)) {
            encoding = encoding_for_model(this.models.get(`${PsAiModelType.Text}_Medium`)
                .modelName);
        }
        else {
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
//# sourceMappingURL=agentModelManager.js.map