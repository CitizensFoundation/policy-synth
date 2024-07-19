import Anthropic from "@anthropic-ai/sdk";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model } from "tiktoken";
export class ClaudeChat extends BaseChatModel {
    client;
    constructor(config) {
        const { apiKey, modelName = "claude-3-opus-20240229", maxTokensOut = 4096, } = config;
        super(modelName, maxTokensOut);
        this.client = new Anthropic({ apiKey });
    }
    async generate(messages, streaming, streamingCallback) {
        let systemMessage;
        const formattedMessages = messages
            .filter((msg) => {
            if (msg.role === "system") {
                systemMessage = msg.message;
                return false;
            }
            return true;
        })
            .map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        const requestOptions = {
            max_tokens: this.maxTokensOut,
            messages: formattedMessages,
            model: this.modelName,
        };
        if (systemMessage) {
            requestOptions.system = systemMessage;
        }
        if (streaming) {
            const stream = await this.client.messages.create({
                ...requestOptions,
                stream: true,
            });
            for await (const messageStreamEvent of stream) {
                if (streamingCallback) {
                    streamingCallback(messageStreamEvent);
                }
            }
            return undefined;
            // TODO: Deal with token usage here
        }
        else {
            const response = await this.client.messages.create(requestOptions);
            console.debug(`Generated response: ${JSON.stringify(response, null, 2)}`);
            return {
                tokensIn: response.usage.input_tokens,
                tokensOut: response.usage.output_tokens,
                content: response.content[0].text,
            };
        }
    }
    async getEstimatedNumTokensFromMessages(messages) {
        //TODO: Get the right encoding
        const encoding = encoding_for_model(
        /*this.modelName*/ "gpt-4o");
        const formattedMessages = messages.map((msg) => msg.message).join(" ");
        const tokenCount = encoding.encode(formattedMessages).length;
        return Promise.resolve(tokenCount);
    }
}
export default ClaudeChat;
//# sourceMappingURL=claudeChat.js.map