import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory as GenerativeHarmCategory, // Rename to avoid clash
 } from "@google/generative-ai";
import { VertexAI, HarmCategory as VertexHarmCategory, } from "@google-cloud/vertexai";
import { BaseChatModel } from "./baseChatModel.js";
export class GoogleGeminiChat extends BaseChatModel {
    useVertexAi;
    googleAiClient;
    vertexAiClient;
    modelName;
    vertexProjectId;
    vertexLocation;
    // Use a union type for the model instance
    model;
    constructor(config) {
        super(config.modelName || "gemini-pro", config.maxTokensOut || 16000); // maxTokensOut might be handled differently or not applicable in Vertex SDK calls directly
        this.modelName = config.modelName || "gemini-pro"; // Store model name
        this.useVertexAi = process.env.USE_GOOGLE_VERTEX_AI === "true";
        if (!this.useVertexAi && process.env.USE_GOOGLE_VERTEX_AI_FOR_MODELS) {
            const listOfModels = process.env.USE_GOOGLE_VERTEX_AI_FOR_MODELS?.split(",");
            if (listOfModels?.includes(this.modelName)) {
                this.useVertexAi = true;
            }
        }
        if (this.useVertexAi) {
            this.vertexProjectId = process.env.GOOGLE_CLOUD_PROJECT;
            this.vertexLocation = process.env.GOOGLE_CLOUD_LOCATION;
            if (!this.vertexProjectId) {
                throw new Error("Vertex AI requires a Google Cloud Project ID. Provide it in config.project or set GOOGLE_CLOUD_PROJECT environment variable.");
            }
            if (!this.vertexLocation) {
                throw new Error("Vertex AI requires a Location. Provide it in config.location or set GOOGLE_CLOUD_LOCATION environment variable.");
            }
            this.vertexAiClient = new VertexAI({
                project: this.vertexProjectId,
                location: this.vertexLocation,
            });
            this.logger.info("Using Google Cloud Vertex AI");
        }
        else {
            if (!config.apiKey) {
                throw new Error("Google Generative AI requires an API key. Provide it in config.apiKey.");
            }
            this.googleAiClient = new GoogleGenerativeAI(config.apiKey);
            this.logger.info("Using Google Generative AI API");
        }
    }
    buildVertexContents(messages) {
        const contents = [];
        for (const msg of messages) {
            // Skip system/developer messages as they are handled by systemInstruction
            if (msg.role === "system" || msg.role === "developer") {
                continue;
            }
            // Map roles: 'assistant' maps to 'model' in Vertex AI context
            const role = msg.role === "assistant" ? "model" : "user";
            contents.push({ role, parts: [{ text: msg.message }] });
        }
        return contents;
    }
    async generate(messages, streaming, streamingCallback) {
        if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
            this.logger.debug(`Messages:\n${JSON.stringify(messages, null, 2)}`);
        }
        // 1. Extract system messages & combine them
        const systemContent = messages
            .filter((m) => m.role === "system" || m.role === "developer") // Include developer role as per original
            .map((m) => m.message)
            .join("\n\n");
        // --- Initialize Model ---
        // This needs to be done here because systemInstruction is part of model initialization
        if (this.useVertexAi && this.vertexAiClient) {
            this.model = this.vertexAiClient.getGenerativeModel({
                model: this.modelName,
                systemInstruction: systemContent,
                safetySettings: [
                    {
                        category: VertexHarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: VertexHarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: VertexHarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: VertexHarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: VertexHarmCategory.HARM_CATEGORY_UNSPECIFIED,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                ],
            });
        }
        else if (!this.useVertexAi && this.googleAiClient) {
            this.model = this.googleAiClient.getGenerativeModel({
                model: this.modelName,
                systemInstruction: systemContent,
                safetySettings: [
                    {
                        category: GenerativeHarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: GenerativeHarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: GenerativeHarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: GenerativeHarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: GenerativeHarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                ],
            });
        }
        else {
            throw new Error("Client not initialized correctly."); // Should not happen
        }
        // --- Prepare Request Data ---
        let vertexContents;
        let googleAiFinalPrompt;
        if (this.useVertexAi) {
            vertexContents = this.buildVertexContents(messages);
            this.logger.debug(`Vertex AI Contents:\n${JSON.stringify(vertexContents, null, 2)}`);
        }
        else {
            // Use original logic for Google AI API prompt construction
            if (messages.length === 2 &&
                (messages[0].role === "system" || messages[0].role === "developer") &&
                messages[1].role === "user") {
                googleAiFinalPrompt = messages[1].message;
            }
            else {
                let promptChatlogText = "";
                for (const msg of messages) {
                    if (msg.role === "system" || msg.role === "developer")
                        continue; // Handled via systemInstruction
                    if (msg.role === "assistant") {
                        promptChatlogText += `[Assistant said]: ${msg.message}\n\n`;
                    }
                    else if (msg.role === "user") {
                        promptChatlogText += `[User said]: ${msg.message}\n\n`;
                    }
                }
                googleAiFinalPrompt = promptChatlogText;
            }
            this.logger.debug(`[Google AI Final prompt]: ${googleAiFinalPrompt}`);
        }
        // --- Execute Request ---
        if (streaming) {
            let aggregated = "";
            if (this.useVertexAi && vertexContents) {
                const streamResult = await this.model.generateContentStream({ contents: vertexContents });
                for await (const item of streamResult.stream) {
                    // Ensure item and its properties exist before accessing text()
                    const text = item?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        aggregated += text;
                        if (streamingCallback) {
                            streamingCallback(text);
                        }
                    }
                    else {
                        this.logger.warn("Received stream chunk without text content:", JSON.stringify(item));
                    }
                }
                // Vertex AI streaming response doesn't easily provide token counts in the same way.
                return {
                    tokensIn: 0, // Placeholder - Vertex stream might not provide this easily
                    tokensOut: 0, // Placeholder
                    content: aggregated,
                };
            }
            else if (!this.useVertexAi && googleAiFinalPrompt !== undefined) {
                const chat = this.model.startChat(); // Needs history if not single turn
                const stream = await chat.sendMessageStream(googleAiFinalPrompt); // Note: This simplification might lose context for Google AI API if history wasn't managed correctly before.
                let done = false;
                while (!done) {
                    //@ts-ignore - Assuming stream.next() exists and works as before
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
                    tokensIn: 0, // Placeholder - original code didn't return tokens for streaming
                    tokensOut: 0, // Placeholder
                    content: aggregated,
                };
            }
            else {
                throw new Error("Invalid state for streaming generation.");
            }
        }
        else {
            // Non-streaming
            if (this.useVertexAi && vertexContents) {
                const result = await this.model.generateContent({ contents: vertexContents });
                const response = result.response;
                const content = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (!content && response.candidates?.[0]?.finishReason !== "STOP") {
                    this.logger.error(`Vertex AI Error: ${response.candidates?.[0]?.finishReason || "Unknown"}`, response.candidates?.[0]?.safetyRatings);
                }
                //console.log(`VERTEX RESPONSE: ${JSON.stringify(response, null, 2)}`);
                return {
                    tokensIn: response.usageMetadata?.promptTokenCount ?? 0,
                    tokensOut: response.usageMetadata?.candidatesTokenCount ?? 0,
                    content: content,
                };
            }
            else if (!this.useVertexAi && googleAiFinalPrompt !== undefined) {
                const chat = this.model.startChat(); // Needs history if not single turn
                const result = await chat.sendMessage(googleAiFinalPrompt); // Note: This simplification might lose context for Google AI API if history wasn't managed correctly before.
                const content = result.response.text();
                //console.log(`GOOGLE AI RESPONSE: ${JSON.stringify(result.response, null, 2)}`);
                return {
                    tokensIn: result.response.usageMetadata?.promptTokenCount ?? 0,
                    tokensOut: result.response.usageMetadata?.candidatesTokenCount ?? 0,
                    content,
                };
            }
            else {
                throw new Error("Invalid state for non-streaming generation.");
            }
        }
    }
}
//# sourceMappingURL=googleGeminiChat.js.map