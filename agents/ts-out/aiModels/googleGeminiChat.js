import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseChatModel } from "./baseChatModel.js";
export class GoogleGeminiChat extends BaseChatModel {
    client;
    model;
    constructor(config) {
        super(config.modelName || "gemini-pro", config.maxTokensOut || 4096);
        this.client = new GoogleGenerativeAI(config.apiKey);
        // We'll defer setting the system instruction (if any) until generate() is called.
        // Because we want to parse the messages array first, see how many system messages there are, etc.
        // Alternatively, you can handle it here if you prefer passing in config.systemInstruction explicitly.
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
        // 4. “Replay” user & assistant messages so that Gemini sees the context
        //    There is no official `role` param in chat.sendMessage, so we have to simulate it.
        for (const msg of messages) {
            if (msg.role === "system") {
                // already handled via systemInstruction
                continue;
            }
            // Option A: skip assistant messages entirely, since
            // Gemini doesn't have a separate place to store them.
            // Option B (shown here): Provide them anyway (prefixed) so the
            // model “hears” the entire conversation.
            if (msg.role === "assistant") {
                await chat.sendMessage(`[Assistant said]: ${msg.message}`);
            }
            else if (msg.role === "user") {
                await chat.sendMessage(msg.message);
            }
        }
        // 5. Finally, get a brand new completion from the last user message
        //    (or from an empty string if the last role is "assistant").
        const lastMsg = messages[messages.length - 1];
        const finalPrompt = lastMsg.role === "user" ? lastMsg.message : "Give me your final answer.";
        // Optionally handle streaming
        if (streaming) {
            const stream = await chat.sendMessageStream(finalPrompt);
            let done = false;
            let aggregated = "";
            while (!done) {
                //@ts-ignore
                const { value: chunk, done: streamDone } = await stream.next();
                done = streamDone;
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
            const result = await chat.sendMessage(finalPrompt);
            const content = result.response.text();
            return {
                tokensIn: result.response.usageMetadata?.promptTokenCount ?? 0,
                tokensOut: result.response.usageMetadata?.candidatesTokenCount ?? 0,
                content,
            };
        }
    }
    async getEstimatedNumTokensFromMessages(messages) {
        // This uses the library’s built-in countTokens feature.
        // Just be aware that the “role” concept is not directly recognized,
        // so we simply combine them in the correct structure:
        const contents = messages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.message }],
        }));
        const { totalTokens } = await this.model.countTokens({ contents });
        return totalTokens;
    }
}
//# sourceMappingURL=googleGeminiChat.js.map