import { ClaudeChat } from "../aiModels/claudeChat.js";
import { OpenAiChat } from "../aiModels/openAiChat.js";
import { GoogleGeminiChat } from "../aiModels/googleGeminiChat.js";
import { AzureOpenAiChat } from "../aiModels/azureOpenAiChat.js";
import { PsModelUsage } from "../dbModels/modelUsage.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { sequelize } from "../dbModels/sequelize.js";
import { encoding_for_model } from "tiktoken";
import { PolicySynthAgentBase } from "./agentBase.js";
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
    limitedLLMmaxRetryCount = 1;
    mainLLMmaxRetryCount = 10;
    constructor(aiModels, accessConfiguration, maxModelTokensOut = 4096, modelTemperature = 0.7, agentId, userId) {
        super();
        this.maxModelTokensOut = maxModelTokensOut;
        this.modelTemperature = modelTemperature;
        this.userId = userId;
        this.agentId = agentId;
        this.initializeModels(aiModels, accessConfiguration);
    }
    initializeModels(aiModels, accessConfiguration) {
        if (!aiModels || aiModels.length === 0) {
            this.logger.info(`No AI models found for agent ${this.agentId}`);
            return;
        }
        for (const model of aiModels) {
            const modelType = model.configuration.type;
            const modelSize = model.configuration.modelSize;
            const modelKey = `${modelType}_${modelSize}`;
            this.logger.debug(`Initializing model ${model.id} ${modelKey}`);
            const apiKeyConfig = accessConfiguration.find((access) => access.aiModelId === model.id);
            this.logger.debug(`Initializing model ${model.id}`);
            this.logger.debug(`Initializing model ${modelType}`);
            this.logger.debug(`Initializing model ${modelKey}`);
            this.logger.debug(`Initializing model ${modelSize}`);
            this.logger.debug(`Access configuration: ${JSON.stringify(accessConfiguration)}`);
            if (!apiKeyConfig) {
                this.logger.warn(`API key configuration not found for model ${model.id}`);
                continue;
            }
            const baseConfig = {
                apiKey: apiKeyConfig.apiKey,
                modelName: model.configuration.model,
                maxTokensOut: this.maxModelTokensOut,
                temperature: this.modelTemperature,
            };
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
    async callModel(modelType, modelSize, messages, parseJson = true, limitedRetries = false, tokenOutEstimate = 120, streamingCallbacks) {
        if (process.env.PS_PROMPT_DEBUG) {
            this.logger.debug("\n\n\n\n\n\n\n\nDebugging callModel");
            this.logger.debug(`modelType: ${modelType}`);
            this.logger.debug(`modelSize: ${modelSize}`);
            this.logger.debug(`messages: ${JSON.stringify(messages)}\n\n\n\n\n\n\n\n`);
        }
        switch (modelType) {
            case PsAiModelType.Text:
            case PsAiModelType.TextReasoning:
                return await this.callTextModel(modelType, modelSize, messages, parseJson, limitedRetries, tokenOutEstimate, streamingCallbacks);
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
    async callTextModel(modelType, modelSize, messages, parseJson = true, limitedRetries = false, tokenOutEstimate = 120, streamingCallbacks) {
        let selectedModelSize = modelSize;
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
            model = this.modelsByType.get(modelType);
            if (model) {
                this.logger.warn(`Model not found by size, using default ${modelType} model`);
            }
            else {
                throw new Error(`No model available for type ${modelType}`);
            }
        }
        try {
            let retryCount = 0;
            const maxRetries = limitedRetries
                ? this.limitedLLMmaxRetryCount
                : this.mainLLMmaxRetryCount;
            let retry = true;
            while (retry && retryCount < maxRetries) {
                try {
                    //const estimatedTokensToAdd = tokensIn + tokenOutEstimate;
                    //TODO: Get Rate limit working again
                    //await this.checkRateLimits(modelType, estimatedTokensToAdd);
                    //await this.updateRateLimits(modelType, tokensIn);
                    const results = await model.generate(messages, !!streamingCallbacks, streamingCallbacks);
                    if (results) {
                        const { tokensIn, tokensOut, content } = results;
                        //await this.updateRateLimits(modelType, tokensOut);
                        await this.saveTokenUsage(modelType, selectedModelSize, tokensIn, tokensOut);
                        if (parseJson) {
                            let parsedJson;
                            try {
                                parsedJson = this.parseJsonResponse(content.trim());
                            }
                            catch (error) {
                                retryCount++;
                                this.logger.warn(`Retrying callTextModel ${retryCount}`);
                                continue;
                            }
                            if (parsedJson == '"[]"' ||
                                parsedJson == "[]" ||
                                parsedJson == "'[]'") {
                                this.logger.warn(`JSON processing returned an empty array string ${parsedJson}`);
                                parsedJson = [];
                            }
                            return parsedJson;
                        }
                        else {
                            return content.trim();
                        }
                    }
                    else {
                        retryCount++;
                        this.logger.warn(`callTextModel response was empty, retrying`);
                    }
                }
                catch (error) {
                    this.logger.warn("Error from model, retrying");
                    if (error.message && error.message.indexOf("429") > -1) {
                        this.logger.warn("429 error, retrying");
                    }
                    if (error.message &&
                        (error.message.indexOf("Failed to generate output due to special tokens in the input") > -1 ||
                            error.message.indexOf("The model produced invalid content. Consider modifying") > -1)) {
                        this.logger.error("Failed to generate output due to special tokens in the input stopping or The model produced invalid content.");
                        retryCount = maxRetries;
                    }
                    else {
                        this.logger.warn(error);
                        this.logger.warn(error.stack);
                    }
                    if (retryCount >= maxRetries) {
                        throw error;
                    }
                    else {
                        retryCount++;
                    }
                }
                const sleepTime = 4500 + retryCount * 5000;
                this.logger.debug(`Sleeping for ${sleepTime} ms before retrying. Retry count: ${retryCount}}`);
                await new Promise((resolve) => setTimeout(resolve, sleepTime));
            }
        }
        catch (error) {
            this.logger.error("Unrecoverable Error in callTextModel method");
            this.logger.error(error);
            throw error;
        }
    }
    async callEmbeddingModel(messages) {
        // Placeholder for embedding model call
        this.logger.warn("Embedding model call not yet implemented");
        return null;
    }
    async callMultiModalModel(messages) {
        // Placeholder for multi-modal model call
        this.logger.warn("Multi-modal model call not yet implemented");
        return null;
    }
    async callAudioModel(messages) {
        // Placeholder for audio model call
        this.logger.warn("Audio model call not yet implemented");
        return null;
    }
    async callVideoModel(messages) {
        // Placeholder for video model call
        this.logger.warn("Video model call not yet implemented");
        return null;
    }
    async callImageModel(messages) {
        // Placeholder for image model call
        this.logger.warn("Image model call not yet implemented");
        return null;
    }
    async saveTokenUsage(modelType, modelSize, tokensIn, tokensOut) {
        this.logger.debug(`Saving token usage for model ${modelType} tokensIn: ${tokensIn} tokensOut: ${tokensOut}`);
        const modelKey = `${modelType}_${modelSize}`;
        const model = this.models.get(modelKey);
        const modelId = this.modelIds.get(modelKey);
        if (!model || !modelId) {
            this.logger.error(`Model of type ${modelType} and size ${modelSize} not initialized`);
            this.logger.debug("Available models:", Array.from(this.models.keys()));
            this.logger.debug("Available modelIds:", Array.from(this.modelIds.keys()));
            throw new Error(`Model of type ${modelType} and size ${modelSize} not initialized`);
        }
        this.logger.debug(`Model: ${model.modelName}`);
        try {
            // Use a transaction to ensure data consistency
            await sequelize.transaction(async (t) => {
                const [usage, created] = await PsModelUsage.findOrCreate({
                    where: {
                        model_id: modelId,
                        agent_id: this.agentId,
                    },
                    defaults: {
                        token_in_count: tokensIn,
                        token_out_count: tokensOut,
                        token_in_cached_context_count: 0,
                        model_id: modelId,
                        agent_id: this.agentId,
                        user_id: this.userId,
                    },
                    transaction: t,
                });
                if (!created) {
                    // Use increment to safely update the counters only if the record wasn't just created
                    await usage.increment({
                        token_in_count: tokensIn,
                        token_out_count: tokensOut,
                    }, { transaction: t });
                }
                this.logger.debug("Usage after update: ", usage.get({ plain: true }));
            });
            this.logger.info(`Token usage updated for agent ${this.agentId} and model ${model.modelName}`);
        }
        catch (error) {
            this.logger.error("Error saving or updating token usage in database");
            this.logger.error(error);
            throw error;
        }
    }
    async getTokensFromMessages(messages) {
        let encoding;
        if (this.models.get(PsAiModelType.Text)) {
            encoding = encoding_for_model(this.models.get(PsAiModelType.Text).modelName);
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
                    totalTokens -= 1; // Role is always required and always 1 token
                }
            }
        }
        totalTokens += 2; // Every reply is primed with <im_start>assistant
        encoding.free(); // Free up the memory used by the encoder
        return totalTokens;
    }
}
//# sourceMappingURL=agentModelManager.js.map