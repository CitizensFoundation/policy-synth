import OpenAI from "openai";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model } from "tiktoken";
export class OpenAiChat extends BaseChatModel {
    client;
    constructor(config) {
        let { apiKey, modelName = "gpt-4o", maxTokensOut = 4096 } = config;
        super(modelName, maxTokensOut);
        if (process.env.PS_AGENT_OPENAI_API_KEY) {
            apiKey = process.env.PS_AGENT_OPENAI_API_KEY;
        }
        console.debug(`Using OpenAI API key: ${apiKey}`);
        this.client = new OpenAI({ apiKey });
    }
    async generate(messages, streaming, streamingCallback) {
        const formattedMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        if (streaming) {
            const stream = await this.client.chat.completions.create({
                model: this.modelName,
                messages: formattedMessages,
                stream: true,
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
            });
            const content = response.choices[0]?.message?.content;
            const tokensIn = response.usage.prompt_tokens;
            const tokensOut = response.usage.completion_tokens;
            const cachedTokens = response.usage.prompt_tokens_details?.cached_tokens || 0;
            // Adjust the tokensIn to reflect the 50% discount for cached tokens
            const adjustedTokensIn = tokensIn - (cachedTokens * 0.5);
            const cacheRatio = (cachedTokens / tokensIn) * 100;
            console.debug({
                tokensIn,
                cachedTokens,
                cacheRatio,
                tokensOut,
                adjustedTokensIn,
                content,
            });
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