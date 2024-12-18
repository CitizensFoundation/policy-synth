import OpenAI from "openai";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model } from "tiktoken";
import { PsAiModelType } from "../aiModelTypes.js";
export class OpenAiChat extends BaseChatModel {
    client;
    modelConfig;
    constructor(config) {
        let { apiKey, modelName = "gpt-4o", maxTokensOut = 4096, temperature = 0.7, } = config;
        super(modelName, maxTokensOut);
        if (process.env.PS_AGENT_OPENAI_API_KEY) {
            apiKey = process.env.PS_AGENT_OPENAI_API_KEY;
        }
        this.client = new OpenAI({ apiKey });
        this.modelConfig = config;
    }
    async generate(messages, streaming, streamingCallback) {
        const formattedMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        this.logger.debug(`Reasoning effort is set to ${this.modelConfig.reasoningEffort}`);
        this.logger.debug(`Temperature is set to ${this.modelConfig.temperature}`);
        this.logger.debug(`Max tokens out is set to ${this.modelConfig.maxTokensOut}`);
        this.logger.debug(`Model type is set to ${this.modelConfig.modelType}`);
        this.logger.debug(`Model size is set to ${this.modelConfig.modelSize}`);
        if (streaming) {
            const stream = await this.client.chat.completions.create({
                model: this.modelName,
                messages: formattedMessages,
                stream: true,
                reasoning_effort: this.modelConfig.reasoningEffort,
                temperature: this.modelConfig.modelType == PsAiModelType.TextReasoning
                    ? undefined
                    : this.modelConfig.temperature,
                max_tokens: this.modelConfig.modelType == PsAiModelType.TextReasoning
                    ? undefined
                    : this.modelConfig.maxTokensOut,
                max_completion_tokens: this.modelConfig.modelType == PsAiModelType.TextReasoning
                    ? this.modelConfig.maxTokensOut
                    : undefined,
            });
            for await (const chunk of stream) {
                if (streamingCallback) {
                    streamingCallback(chunk.choices[0]?.delta?.content || "");
                }
            }
        }
        else {
            const response = await this.client.chat.completions.create({
                model: this.modelName,
                messages: formattedMessages,
                reasoning_effort: this.modelConfig.reasoningEffort,
                temperature: this.modelConfig.modelType == PsAiModelType.TextReasoning
                    ? undefined
                    : this.modelConfig.temperature,
                max_tokens: this.modelConfig.modelType == PsAiModelType.TextReasoning
                    ? undefined
                    : this.modelConfig.maxTokensOut,
                max_completion_tokens: this.modelConfig.modelType == PsAiModelType.TextReasoning
                    ? this.modelConfig.maxTokensOut
                    : undefined,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                this.logger.error("No content returned from OpenAI");
                this.logger.error(JSON.stringify(response, null, 2));
            }
            const tokensIn = response.usage.prompt_tokens;
            const tokensOut = response.usage.completion_tokens;
            const cachedTokens = response.usage.prompt_tokens_details?.cached_tokens || 0;
            const completion_tokens_details = response.usage.completion_tokens_details;
            // Adjust the tokensIn to reflect the 50% discount for cached tokens
            const adjustedTokensIn = tokensIn - cachedTokens * 0.5;
            const cacheRatio = (cachedTokens / tokensIn) * 100;
            this.logger.debug(JSON.stringify({
                tokensIn,
                cachedTokens,
                cacheRatio,
                tokensOut,
                adjustedTokensIn,
                content,
                completion_tokens_details,
            }, null, 2));
            return {
                tokensIn: adjustedTokensIn,
                tokensOut,
                cacheRatio,
                content,
            };
        }
    }
    async getEstimatedNumTokensFromMessages(messages) {
        const encoding = encoding_for_model(this.modelName);
        const formattedMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        const tokenCounts = formattedMessages.map((msg) => encoding.encode(msg.content).length);
        return tokenCounts.reduce((acc, count) => acc + count, 0);
    }
}
export default OpenAiChat;
//# sourceMappingURL=openAiChat.js.map