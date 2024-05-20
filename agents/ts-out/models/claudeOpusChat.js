import Anthropic from "@anthropic-ai/sdk";
import { BaseChatModel } from "./baseChatModel";
import { encoding_for_model } from "tiktoken";
export class ClaudeOpusChat extends BaseChatModel {
    client;
    constructor(apiKey, modelName = "claude-3-opus-20240229", maxTokensOut = 4096) {
        super(modelName, maxTokensOut);
        this.client = new Anthropic({ apiKey });
    }
    async generate(messages, streaming, streamingCallback) {
        const formattedMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        if (streaming) {
            const stream = await this.client.messages.create({
                max_tokens: this.maxTokensOut,
                messages: formattedMessages,
                model: this.modelName,
                stream: true,
            });
            for await (const messageStreamEvent of stream) {
                if (streamingCallback) {
                    streamingCallback(messageStreamEvent);
                }
            }
        }
        else {
            const response = await this.client.messages.create({
                max_tokens: this.maxTokensOut,
                messages: formattedMessages,
                model: this.modelName,
            });
            return response;
        }
    }
    async getNumTokensFromMessages(messages) {
        const encoding = encoding_for_model(this.modelName);
        const formattedMessages = messages.map((msg) => msg.message).join(" ");
        const tokenCount = encoding.encode(formattedMessages).length;
        return Promise.resolve(tokenCount);
    }
}
export default ClaudeOpusChat;
//# sourceMappingURL=claudeOpusChat.js.map