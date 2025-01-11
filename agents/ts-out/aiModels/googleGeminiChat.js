import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseChatModel } from "./baseChatModel.js";
export class GoogleGeminiChat extends BaseChatModel {
    client;
    model;
    constructor(config) {
        super(config.modelName || "gemini-pro", config.maxTokensOut || 4096);
        this.client = new GoogleGenerativeAI(config.apiKey);
    }
    async generate(messages, streaming, streamingCallback) {
        // 1. Extract system messages & combine them
        const systemContent = messages
            .filter((m) => m.role === "system")
            .map((m) => m.message)
            .join("\n\n");
        // 2. Create the model with `systemInstruction`
        this.model = this.client.getGenerativeModel({
            model: this.modelName,
            systemInstruction: systemContent || "",
        });
        // 3. Start the conversation
        const chat = this.model.startChat();
        let finalPrompt = "";
        // Check if we have exactly one system + one user
        if (messages.length === 2 &&
            (messages[0].role === "system" || messages[0].role === "developer") &&
            messages[1].role === "user") {
            // Only one user message -> send it directly, unchanged
            finalPrompt = messages[1].message;
        }
        else {
            // More than two messages -> aggregate them all into a single text
            let promptChatlogText = "";
            for (const msg of messages) {
                if (msg.role === "system" || msg.role === "developer") {
                    // Handled via systemInstruction; skip
                    continue;
                }
                if (msg.role === "assistant") {
                    // Let Gemini see assistant context
                    promptChatlogText += `[Assistant said]: ${msg.message}\n\n`;
                }
                else if (msg.role === "user") {
                    // Let Gemini see user context
                    promptChatlogText += `[User said]: ${msg.message}\n\n`;
                }
            }
            finalPrompt = promptChatlogText;
        }
        //console.debug(`[Final prompt]: ${finalPrompt}`);
        if (streaming) {
            // Stream the response
            const stream = await chat.sendMessageStream(finalPrompt);
            let done = false;
            let aggregated = "";
            while (!done) {
                //@ts-ignore
                const { value: chunk, done: streamDone } = await stream.next();
                done = streamDone || !chunk;
                if (chunk) {
                    const text = chunk.text();
                    aggregated += text;
                    if (streamingCallback) {
                        streamingCallback(text);
                    }
                }
            }
            return {
                tokensIn: 0,
                tokensOut: 0,
                content: aggregated,
            };
        }
        else {
            // Single-shot response
            //console.log("Calling Gemini...");
            const result = await chat.sendMessage(finalPrompt);
            const content = result.response.text();
            //console.log(`RESPONSE: ${JSON.stringify(result.response, null, 2)}`);
            return {
                tokensIn: result.response.usageMetadata?.promptTokenCount ?? 0,
                tokensOut: result.response.usageMetadata?.candidatesTokenCount ?? 0,
                content,
            };
        }
    }
    async getEstimatedNumTokensFromMessages(messages) {
        // This uses the library’s built-in countTokens feature.
        const contents = messages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.message }],
        }));
        const { totalTokens } = await this.model.countTokens({ contents });
        return totalTokens;
    }
}
//# sourceMappingURL=googleGeminiChat.js.map