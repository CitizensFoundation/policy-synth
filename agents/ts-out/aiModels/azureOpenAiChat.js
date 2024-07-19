import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model } from "tiktoken";
export class AzureOpenAiChat extends BaseChatModel {
    client;
    deploymentName;
    constructor(config) {
        super(config.modelName || "gpt-4o", config.maxTokensOut || 4096);
        this.client = new OpenAIClient(config.endpoint, new AzureKeyCredential(config.apiKey));
        this.deploymentName = config.deploymentName;
    }
    async generate(messages, streaming, streamingCallback) {
        const chatMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        if (streaming) {
            const events = await this.client.streamChatCompletions(this.deploymentName, chatMessages, { maxTokens: this.maxTokensOut });
            for await (const event of events) {
                for (const choice of event.choices) {
                    const delta = choice.delta?.content;
                    if (delta !== undefined && streamingCallback) {
                        streamingCallback(delta);
                    }
                }
            }
            // Deal with tokenusage here
        }
        else {
            const result = await this.client.getChatCompletions(this.deploymentName, chatMessages, { maxTokens: this.maxTokensOut });
            const content = result.choices.map((choice) => choice.message?.content).join("");
            return { tokensIn: result.usage?.promptTokens ?? 0, tokensOut: result.usage?.completionTokens ?? 0, content };
        }
    }
    async getEstimatedNumTokensFromMessages(messages) {
        const encoder = encoding_for_model(this.modelName);
        const chatMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        const tokenCounts = chatMessages.map((msg) => encoder.encode(msg.content).length);
        return tokenCounts.reduce((acc, count) => acc + count, 0);
    }
}
//# sourceMappingURL=azureOpenAiChat.js.map