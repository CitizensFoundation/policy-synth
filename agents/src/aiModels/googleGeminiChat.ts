import {
  GoogleGenerativeAI,
  GenerativeModel as GoogleAiGenerativeModel,
  HarmBlockThreshold,
  HarmCategory as GenerativeHarmCategory, // Rename to avoid clash
} from "@google/generative-ai";

import {
  VertexAI,
  GenerativeModel as VertexAiGenerativeModel, // Rename to avoid clash
  Part,
  Content,
  GenerateContentResult,
  HarmCategory as VertexHarmCategory,
} from "@google-cloud/vertexai";

import { BaseChatModel } from "./baseChatModel.js";
import { types } from "util";
import { PsAiModel } from "../dbModels/aiModel.js";
import { appendFile } from "fs/promises";

export class GoogleGeminiChat extends BaseChatModel {
  private useVertexAi: boolean;
  private googleAiClient?: GoogleGenerativeAI;
  private vertexAiClient?: VertexAI;
  modelName: string;
  vertexProjectId?: string;
  vertexLocation?: string;

  // Use a union type for the model instance
  model!: GoogleAiGenerativeModel | VertexAiGenerativeModel;

  constructor(config: PsAiModelConfig) {
    super(config, config.modelName || "gemini-pro", config.maxTokensOut || 16000); // maxTokensOut might be handled differently or not applicable in Vertex SDK calls directly

    this.modelName = config.modelName || "gemini-pro"; // Store model name
    this.useVertexAi = process.env.USE_GOOGLE_VERTEX_AI === "true";

    if (!this.useVertexAi && process.env.USE_GOOGLE_VERTEX_AI_FOR_MODELS) {
      const listOfModels =
        process.env.USE_GOOGLE_VERTEX_AI_FOR_MODELS?.split(",");
      if (listOfModels?.includes(this.modelName)) {
        this.useVertexAi = true;
      }
    }

    if (this.useVertexAi) {
      this.vertexProjectId = process.env.GOOGLE_CLOUD_PROJECT;
      this.vertexLocation = process.env.GOOGLE_CLOUD_LOCATION;

      if (!this.vertexProjectId) {
        throw new Error(
          "Vertex AI requires a Google Cloud Project ID. Provide it in config.project or set GOOGLE_CLOUD_PROJECT environment variable."
        );
      }
      if (!this.vertexLocation) {
        throw new Error(
          "Vertex AI requires a Location. Provide it in config.location or set GOOGLE_CLOUD_LOCATION environment variable."
        );
      }

      this.vertexAiClient = new VertexAI({
        project: this.vertexProjectId,
        location: this.vertexLocation,
      });
      this.logger.info("Using Google Cloud Vertex AI");
    } else {
      if (!config.apiKey) {
        throw new Error(
          "Google Generative AI requires an API key. Provide it in config.apiKey."
        );
      }
      this.googleAiClient = new GoogleGenerativeAI(config.apiKey);
      this.logger.info("Using Google Generative AI API");
    }
  }

  private buildVertexContents(
    messages: PsModelMessage[],
    media?: { mimeType: string; data: string }[]
  ): Content[] {
    const contents: Content[] = [];
    for (const msg of messages) {
      // Skip system/developer messages as they are handled by systemInstruction
      if (msg.role === "system" || msg.role === "developer") {
        continue;
      }
      // Map roles: 'assistant' maps to 'model' in Vertex AI context
      const role = msg.role === "assistant" ? "model" : "user";
      contents.push({ role, parts: [{ text: msg.message }] });
    }

    // --- NEW: append inline media parts if provided
    if (media?.length) {
      for (const img of media) {
        contents.push({
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: img.mimeType,
                data: img.data,
              },
            },
          ],
        });
      }
    }

    return contents;
  }

  static vertexSafetySettingsBlockNone = [
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
  ];

  static generativeAiSafetySettingsBlockNone = [
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
  ];

  private async debugTokenCounts(
    tokensIn: number,
    tokensOut: number,
    cachedInTokens: number
  ) {
    if (!process.env.DEBUG_TOKENS_COUNTS_TO_CSV_FILE) {
      return;
    }

    const prices = this.config?.prices;
    let longContextTokensIn = 0;
    let longContextTokensOut = 0;

    if (
      prices?.longContextTokenThreshold &&
      tokensIn >= prices.longContextTokenThreshold
    ) {
      longContextTokensIn = cachedInTokens ? tokensIn - cachedInTokens : tokensIn;
      longContextTokensOut = tokensOut;
      tokensIn = 0;
      tokensOut = 0;
      cachedInTokens = 0;
    } else if (cachedInTokens) {
      tokensIn = tokensIn - cachedInTokens;
    }

    const line = `${this.modelName},${tokensIn},${tokensOut},${longContextTokensIn},${longContextTokensOut},${cachedInTokens}\n`;
    try {
      await appendFile("/tmp/geminiTokenDebug.csv", line);
    } catch (err) {
      this.logger.error(`Failed to write token debug data: ${err}`);
    }
  }

  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: (chunk: string) => void,
    media?: { mimeType: string; data: string }[]
  ): Promise<PsBaseModelReturnParameters | undefined> {
    if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
      this.logger.debug(`Messages:\n${JSON.stringify(messages, null, 2)}`);
    }

    /**
     * Helper: robust extraction of "tokens out".
     * Google / Vertex omit candidatesTokenCount for some (esp. long-context)
     * calls – but totalTokenCount is still returned.
     */
    const getTokensOut = (usage?: any) => {
      if (!usage) return 0;
      if (usage.candidatesTokenCount != null) return usage.candidatesTokenCount;
      if (usage.totalTokenCount != null && usage.promptTokenCount != null) {
        return (
          usage.totalTokenCount -
          usage.promptTokenCount -
          (usage.toolUsePromptTokenCount ?? 0)
        );
      }
      return 0;
    };

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
        safetySettings: GoogleGeminiChat.vertexSafetySettingsBlockNone,
      });
    } else if (!this.useVertexAi && this.googleAiClient) {
      this.model = this.googleAiClient.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemContent,
        safetySettings: GoogleGeminiChat.generativeAiSafetySettingsBlockNone,
      });
    } else {
      throw new Error("Client not initialized correctly."); // Should not happen
    }

    // --- Prepare Request Data ---
    let vertexContents: Content[] | undefined;
    let googleAiFinalPrompt: string | undefined;

    if (this.useVertexAi) {
      vertexContents = this.buildVertexContents(messages, media);
      this.logger.debug(
        `Vertex AI Contents:\n${JSON.stringify(vertexContents, null, 2)}`
      );
    } else {
      // Use original logic for Google AI API prompt construction
      if (
        messages.length === 2 &&
        (messages[0].role === "system" || messages[0].role === "developer") &&
        messages[1].role === "user"
      ) {
        googleAiFinalPrompt = messages[1].message;
      } else {
        let promptChatlogText = "";
        for (const msg of messages) {
          if (msg.role === "system" || msg.role === "developer") continue; // Handled via systemInstruction
          if (msg.role === "assistant") {
            promptChatlogText += `[Assistant said]: ${msg.message}\n\n`;
          } else if (msg.role === "user") {
            promptChatlogText += `[User said]: ${msg.message}\n\n`;
          }
        }
        googleAiFinalPrompt = promptChatlogText;
      }
      this.logger.debug(`[Google AI Final prompt]: ${googleAiFinalPrompt}`);
    }

    // --- Execute Request ---
    if (streaming) {
      this.logger.debug(`Streaming request`);
      let aggregated = "";
      if (this.useVertexAi && vertexContents) {
        const streamResult = await (
          this.model as VertexAiGenerativeModel
        ).generateContentStream({ contents: vertexContents });

        for await (const item of streamResult.stream) {
          // Ensure item and its properties exist before accessing text()
          const text = item?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            aggregated += text;
            if (streamingCallback) {
              streamingCallback(text);
            }
          } else {
            this.logger.warn(
              "Received stream chunk without text content:",
              JSON.stringify(item)
            );
          }
        }
        // Vertex AI streaming response doesn't easily provide token counts in the same way.
        return {
          tokensIn: 0, // Placeholder - Vertex stream might not provide this easily
          tokensOut: 0, // Placeholder
          content: aggregated,
        };
      } else if (!this.useVertexAi && googleAiFinalPrompt !== undefined) {
        this.logger.debug(`Google AI Streaming request`);
        const chat = (this.model as GoogleAiGenerativeModel).startChat(); // Needs history if not single turn
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
      } else {
        throw new Error("Invalid state for streaming generation.");
      }
    } else {
      // Non-streaming
      this.logger.debug(`Non-streaming request`);
      if (this.useVertexAi && vertexContents) {
        this.logger.debug(`Vertex AI Final prompt with images count: ${vertexContents.length}`);
        const result: GenerateContentResult = await (
          this.model as VertexAiGenerativeModel
        ).generateContent({ contents: vertexContents });
        const response = result.response;
        const content =
          response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!content && response.candidates?.[0]?.finishReason !== "STOP") {
          const errorMessage =
            response.candidates?.[0]?.finishReason || "Unknown";

          this.logger.error(
            `Vertex AI Error: ${errorMessage}`,
            response.candidates?.[0]?.safetyRatings
          );

          throw new Error(`Vertex AI Error: ${errorMessage}`);
        }
        //console.log(`VERTEX RESPONSE: ${JSON.stringify(response, null, 2)}`);
        const tokensIn = response.usageMetadata?.promptTokenCount ?? 0;
        const tokensOut = getTokensOut(response.usageMetadata);
        const cachedInTokens =
          result.response.usageMetadata?.cachedContentTokenCount ?? 0;
        await this.debugTokenCounts(tokensIn, tokensOut, cachedInTokens);
        return {
          tokensIn,
          tokensOut,
          cachedInTokens,
          content: content,
        };
      } else if (!this.useVertexAi && googleAiFinalPrompt !== undefined) {
        this.logger.debug(
          `Google AI Final prompt with media count: ${media?.length}`
        );
        if (media?.length) {
          const parts: Part[] = [
            { text: googleAiFinalPrompt },
            ...media.map((img) => ({
              inlineData: { mimeType: img.mimeType, data: img.data },
            })),
          ];

          this.logger.debug(`Google AI Final prompt with images parts: ${parts.length}`);

          const result = await (this.model as GoogleAiGenerativeModel).generateContent(parts);
          const content = result.response.text();
          const tokensIn = result.response.usageMetadata?.promptTokenCount ?? 0;
          const tokensOut = getTokensOut(result.response.usageMetadata);
          const cachedInTokens = result.response.usageMetadata?.cachedContentTokenCount ?? 0;
          await this.debugTokenCounts(tokensIn, tokensOut, cachedInTokens);
          return { tokensIn, tokensOut, cachedInTokens, content };
        }

        const chat = (this.model as GoogleAiGenerativeModel).startChat({
          safetySettings: GoogleGeminiChat.generativeAiSafetySettingsBlockNone
        });
        const result = await chat.sendMessage(googleAiFinalPrompt);
        const content = result.response.text();
        //console.log(`GOOGLE AI RESPONSE: ${JSON.stringify(result.response, null, 2)}`);
        const tokensIn = result.response.usageMetadata?.promptTokenCount ?? 0;
        const tokensOut = getTokensOut(result.response.usageMetadata);
        const cachedInTokens =
          result.response.usageMetadata?.cachedContentTokenCount ?? 0;
        await this.debugTokenCounts(tokensIn, tokensOut, cachedInTokens);
        return {
          tokensIn,
          tokensOut,
          cachedInTokens,
          content,
        };
      } else {
        throw new Error("Invalid state for non-streaming generation.");
      }
    }
  }
}
