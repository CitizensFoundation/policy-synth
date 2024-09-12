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
            //console.debug(`Generated response: ${JSON.stringify(response, null, 2)}`);
            return {
                tokensIn: response.usage.prompt_tokens,
                tokensOut: response.usage.completion_tokens,
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