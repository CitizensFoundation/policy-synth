import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model } from "tiktoken";
export class AzureOpenAiChat extends BaseChatModel {
    client;
    deploymentName;
    reasoningEffort = 'medium';
    temperature = 0.7;
    constructor(config) {
        super(config.modelName || "gpt-4", config.maxTokensOut || 4096);
        const scope = "https://cognitiveservices.azure.com/.default";
        const credential = new DefaultAzureCredential();
        const azureADTokenProvider = getBearerTokenProvider(credential, scope);
        this.client = new AzureOpenAI({
            azureADTokenProvider,
            deployment: config.deploymentName,
            apiVersion: "2024-10-21"
        });
        this.deploymentName = config.deploymentName;
        this.reasoningEffort = config.reasoningEffort || 'medium';
        this.temperature = config.temperature || 0.7;
    }
    async generate(messages, streaming, streamingCallback) {
        const chatMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        if (streaming) {
            // Streaming scenario
            const events = await this.client.chat.completions.create({
                messages: chatMessages,
                max_tokens: this.maxTokensOut,
                stream: true,
                model: "", // Model is required, use "" for Azure deployments
                reasoning_effort: this.reasoningEffort,
                temperature: this.temperature
            });
            for await (const event of events) {
                for (const choice of event.choices) {
                    const delta = choice.delta?.content;
                    if (delta != null && streamingCallback) {
                        streamingCallback(delta);
                    }
                }
            }
        }
        else {
            // Non-streaming scenario
            const result = await this.client.chat.completions.create({
                messages: chatMessages,
                max_tokens: this.maxTokensOut,
                model: "", // Model is required, use "" for Azure deployments
                reasoning_effort: this.reasoningEffort,
                temperature: this.temperature
            });
            const content = result.choices.map((choice) => choice.message?.content ?? "").join("");
            const usage = result.usage;
            return {
                tokensIn: usage?.prompt_tokens ?? 0,
                tokensOut: usage?.completion_tokens ?? 0,
                content,
            };
        }
    }
    async getEstimatedNumTokensFromMessages(messages) {
        const encoder = encoding_for_model(this.modelName);
        const tokenCounts = messages.map((msg) => encoder.encode(msg.message).length);
        return tokenCounts.reduce((acc, count) => acc + count, 0);
    }
}
//# sourceMappingURL=azureOpenAiChat.js.map