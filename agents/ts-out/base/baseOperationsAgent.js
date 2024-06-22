import { ClaudeOpusChat } from "../aiModels/claudeOpusChat.js";
import { OpenAiChat } from "../aiModels/openAiChat.js";
import { GoogleGeminiChat } from "../aiModels/googleGeminiChat.js";
import { AzureOpenAiChat } from "../aiModels/azureOpenAiChat.js";
import { PsModelUsage } from "../dbModels/modelUsage.js";
import { Op } from "sequelize";
import { PolicySynthBaseAgent } from "./baseAgent.js";
export class PolicySynthOperationsAgent extends PolicySynthBaseAgent {
    agent;
    models = new Map();
    limitedLLMmaxRetryCount = 3;
    mainLLMmaxRetryCount = 10;
    rateLimits = {};
    constructor(agent) {
        super();
        this.agent = agent;
        this.initializeModels();
    }
    async initializeModels() {
        const aiModels = this.agent.AiModels;
        if (!aiModels || aiModels.length === 0) {
            throw new Error("No AI models associated with this agent");
        }
        if (!this.agent.Group || !this.agent.Group.configuration) {
            throw new Error("Agent group or group configuration not found");
        }
        const groupConfig = this.agent.Group.configuration;
        for (const model of aiModels) {
            const modelType = model.configuration.type;
            const apiKeyConfig = groupConfig.aiModelAccess.find(access => access.aiModelId === model.id);
            if (!apiKeyConfig) {
                this.logger.warn(`API key configuration not found for model ${model.id}`);
                continue;
            }
            const baseConfig = {
                apiKey: apiKeyConfig.apiKey,
                modelName: model.name,
                maxTokensOut: this.agent.configuration.maxTokensOut || model.configuration.maxTokensOut || 4096,
                temperature: this.agent.configuration.temperature || model.configuration.defaultTemperature || 0.5,
            };
            switch (model.configuration.provider) {
                case "anthropic":
                    this.models.set(modelType, new ClaudeOpusChat(baseConfig));
                    break;
                case "openai":
                    this.models.set(modelType, new OpenAiChat(baseConfig));
                    break;
                case "google":
                    this.models.set(modelType, new GoogleGeminiChat(baseConfig));
                    break;
                case "azure":
                    this.models.set(modelType, new AzureOpenAiChat({
                        ...baseConfig,
                        endpoint: model.configuration.endpoint,
                        deploymentName: model.configuration.deploymentName,
                    }));
                    break;
                default:
                    this.logger.warn(`Unsupported model provider: ${model.configuration.provider}`);
            }
        }
        if (this.models.size === 0) {
            throw new Error("No supported AI models found for this agent");
        }
    }
    async callModel(modelType, messages, parseJson = true, limitedRetries = false, tokenOutEstimate = 120, streamingCallbacks) {
        switch (modelType) {
            case PsAiModelType.Text:
                return this.callTextModel(messages, parseJson, limitedRetries, tokenOutEstimate, streamingCallbacks);
            case PsAiModelType.Embedding:
                return this.callEmbeddingModel(messages);
            case PsAiModelType.MultiModal:
                return this.callMultiModalModel(messages);
            case PsAiModelType.Audio:
                return this.callAudioModel(messages);
            case PsAiModelType.Video:
                return this.callVideoModel(messages);
            case PsAiModelType.Image:
                return this.callImageModel(messages);
            default:
                throw new Error(`Unsupported model type: ${modelType}`);
        }
    }
    async callTextModel(messages, parseJson = true, limitedRetries = false, tokenOutEstimate = 120, streamingCallbacks) {
        const model = this.models.get(PsAiModelType.Text);
        if (!model) {
            throw new Error(`No model available for type ${PsAiModelType.Text}`);
        }
        try {
            let retryCount = 0;
            const maxRetries = limitedRetries
                ? this.limitedLLMmaxRetryCount
                : this.mainLLMmaxRetryCount;
            let retry = true;
            while (retry && retryCount < maxRetries) {
                try {
                    const tokensIn = await model.getNumTokensFromMessages(messages);
                    const estimatedTokensToAdd = tokensIn + tokenOutEstimate;
                    //TODO: Get Rate limit working again
                    //await this.checkRateLimits(PsAiModelType.Text, estimatedTokensToAdd);
                    //await this.updateRateLimits(PsAiModelType.Text, tokensIn);
                    const response = await model.generate(messages, !!streamingCallbacks, streamingCallbacks);
                    if (response) {
                        const tokensOut = await model.getNumTokensFromMessages([{ role: "assistant", message: response }]);
                        //await this.updateRateLimits(PsAiModelType.Text, tokensOut);
                        await this.saveTokenUsage(PsAiModelType.Text, tokensIn, tokensOut);
                        if (parseJson) {
                            let parsedJson;
                            try {
                                parsedJson = this.parseJsonResponse(response.trim());
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
                            return response.trim();
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
    async saveTokenUsage(modelType, tokensIn, tokensOut) {
        const model = this.models.get(modelType);
        if (!model) {
            throw new Error(`Model of type ${modelType} not initialized`);
        }
        try {
            const [usage, created] = await PsModelUsage.findOrCreate({
                where: {
                    //TODO: Check this, make less fragile
                    model_id: this.agent.AiModels.find(m => m.name === model.modelName).id,
                    agent_id: this.agent.id,
                    created_at: {
                        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) // Today's date
                    }
                },
                defaults: {
                    token_in_count: tokensIn,
                    token_out_count: tokensOut,
                    model_id: this.agent.AiModels.find(m => m.name === model.modelName).id,
                    agent_id: this.agent.id,
                    user_id: this.agent.user_id
                }
            });
            if (!created) {
                // If the record already existed, update the counters
                await usage.update({
                    token_in_count: usage.token_in_count + tokensIn,
                    token_out_count: usage.token_out_count + tokensOut,
                });
            }
            this.logger.info(`Token usage updated for agent ${this.agent.id} and model ${model.modelName}`);
        }
        catch (error) {
            this.logger.error("Error saving or updating token usage in database");
            this.logger.error(error);
        }
    }
    formatNumber(number, fractions = 0) {
        return new Intl.NumberFormat("en-US", {
            maximumFractionDigits: fractions,
        }).format(number);
    }
}
//# sourceMappingURL=baseOperationsAgent.js.map