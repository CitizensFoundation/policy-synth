import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseChatModel } from "./baseChatModel.js";
export class GoogleGeminiChat extends BaseChatModel {
    client;
    model;
    constructor(config) {
        super(config.modelName || "gemini-pro", config.maxTokensOut || 4096);
        this.client = new GoogleGenerativeAI(config.apiKey);
        this.model = this.client.getGenerativeModel({ model: this.modelName });
    }
    async generate(messages, streaming, streamingCallback) {
        const chat = this.model.startChat();
        // Add messages to the chat history
        for (const message of messages) {
            if (message.role === 'user') {
                await chat.sendMessage(message.message);
            }
            else if (message.role === 'assistant') {
                // For assistant messages, just send the message without the role option
                await chat.sendMessage(message.message);
            }
        }
        if (streaming) {
            const stream = await chat.sendMessageStream(messages[messages.length - 1].message);
            // Iterate over the stream using a while loop and the 'next' method
            let done = false;
            while (!done) {
                //@ts-ignore TODO: Check
                const { value: chunk, done: streamDone } = await stream.next();
                done = streamDone;
                if (chunk) {
                    const chunkText = chunk.text();
                    if (streamingCallback) {
                        streamingCallback(chunkText);
                    }
                }
            }
            // You'll need to track token usage yourself in streaming mode.
            // Google doesn't provide it in the chunks.
            return {
                tokensIn: 0, // Placeholder - you need to calculate this
                tokensOut: 0, // Placeholder - you need to calculate this
                content: '', // Content is built up in the streaming callback
            };
        }
        else {
            const result = await chat.sendMessage(messages[messages.length - 1].message);
            const content = result.response.text();
            return {
                tokensIn: result.response.usageMetadata?.promptTokenCount ?? 0,
                tokensOut: result.response.usageMetadata?.candidatesTokenCount ?? 0,
                content,
            };
        }
    }
    async getEstimatedNumTokensFromMessages(messages) {
        const contents = messages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.message }],
        }));
        const { totalTokens } = await this.model.countTokens({ contents });
        return totalTokens;
    }
}
export default GoogleGeminiChat;
//# sourceMappingURL=googleGeminiChat.js.map