import {
  GoogleGenAI,
  GenerateContentParameters,
  GenerateContentResponse,
  FunctionCallingConfigMode,
  FunctionDeclaration,
  FunctionCall,
  HarmBlockThreshold,
  HarmCategory,
  ToolConfig,
} from "@google/genai";

import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

import { BaseChatModel } from "./baseChatModel.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { appendFile } from "fs/promises";

export class GoogleGeminiChat extends BaseChatModel {
  private readonly ai: GoogleGenAI;
  readonly modelName: string;

  constructor(config: PsAiModelConfig) {
    super(
      config,
      config.modelName || "gemini-2.0-flash",
      config.maxTokensOut || 16_000
    );

    this.modelName = config.modelName || "gemini-2.0-flash";

    const useVertex = process.env.USE_GOOGLE_VERTEX_AI === "true";
    this.ai = useVertex
      ? new GoogleGenAI({
          vertexai: true,
          project: process.env.GOOGLE_CLOUD_PROJECT!,
          location: process.env.GOOGLE_CLOUD_LOCATION!,
        })
      : new GoogleGenAI({
          apiKey:
            config.apiKey ||
            process.env.PS_AGENT_GEMINI_API_KEY ||
            process.env.GOOGLE_API_KEY,
        });
  }

  /* ---------- helper utilities ---------- */

  private buildContents(
    messages: PsModelMessage[],
    media?: { mimeType: string; data: string }[]
  ): GenerateContentParameters["contents"] {
    const out: any[] = [];
    for (const m of messages) {
      if (m.role === "system" || m.role === "developer") continue; // handled via systemInstruction
      const role = m.role === "assistant" ? "model" : "user";
      out.push({ role, parts: [{ text: m.message }] });
    }
    media?.forEach((img) =>
      out.push({
        role: "user",
        parts: [{ inlineData: { mimeType: img.mimeType, data: img.data } }],
      })
    );
    return out;
  }

  private tokensOut(usage?: any): number {
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
  }

  private async logTokens(tokensIn: number, tokensOut: number, cached: number) {
    if (!process.env.DEBUG_TOKENS_COUNTS_TO_CSV_FILE) return;
    await appendFile(
      "/tmp/geminiTokenDebug.csv",
      `${this.modelName},${tokensIn},${tokensOut},${cached}\n`
    );
  }

  static safetySettings =
  [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    }
  ]

  assertGeminiNotBlocked(response: GenerateContentResponse) {
    if (!response.candidates?.length) {
      const pf = response.promptFeedback;
      if (pf?.blockReason) {
        // The prompt was blocked; include the reason in the error
        throw new Error(
          `Response was blocked via prompt: ${pf.blockReason} `
          + (pf.safetyRatings?.map(r => `${r.category}=${r.probability}`).join(', ') || '')
        );
      }
      throw new Error('Gemini returned no candidates; the prompt may be malformed.');
    }

    // check for blocked candidate
    const candidate = response.candidates[0];
    if (candidate.finishReason === 'SAFETY') {
      throw new Error(
        `Response was blocked via safety: `
        + (candidate.safetyRatings?.map(r => `${r.category}=${r.probability}`).join(', ') || '')
      );
    }
  }

  /* ---------- main generate() entry‑point ---------- */

  async generate(
    messages: PsModelMessage[],
    streaming = false,
    streamingCallback?: (chunk: string) => void,
    media?: { mimeType: string; data: string }[],
    tools?: ChatCompletionTool[],
    toolChoice: ChatCompletionToolChoiceOption | "auto" = "auto",
    allowedTools?: string[]
  ): Promise<PsBaseModelReturnParameters> {
    if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
      this.logger.debug(
        `Messages:\n${this.prettyPrintPromptMessages(messages.map((m) => ({
          role: m.role,
          content: m.message,
        })))}`
      );
    }
    /* ----- system prompt ----- */
    const systemInstruction = messages
      .filter((m) => m.role === "system" || m.role === "developer")
      .map((m) => m.message)
      .join("\n\n");

    /* ----- tool declarations / config ----- */
    let functionDeclarations: FunctionDeclaration[] | undefined;
    let toolConfig: ToolConfig | undefined;

    if (tools?.length) {
      functionDeclarations = tools
        .filter((t) => t.type === "function")
        .map((t) => ({
          name: t.function.name,
          description: t.function.description,
          parametersJsonSchema: t.function.parameters as any,
        }));

      let mode = FunctionCallingConfigMode.AUTO;
      let allowedNames = allowedTools;

      if (toolChoice === "none") {
        mode = FunctionCallingConfigMode.NONE;
      } else if (toolChoice !== "auto") {
        mode = FunctionCallingConfigMode.ANY;
        if (typeof toolChoice !== "string" && toolChoice.type === "function") {
          allowedNames = [toolChoice.function.name];
        }
      }
      toolConfig = {
        functionCallingConfig: { mode, allowedFunctionNames: allowedNames },
      };
    }


    const params: GenerateContentParameters = {
      model: this.modelName,
      contents: this.buildContents(messages, media),

      config: {
        systemInstruction: systemInstruction,
        tools: functionDeclarations ? [{ functionDeclarations }] : undefined,
        toolConfig,

        safetySettings: GoogleGeminiChat.safetySettings,
      },
    };

    /* ========== streaming ========== */
    if (streaming) {
      const stream = await this.ai.models.generateContentStream(params);
      let text = "";
      const toolCalls: FunctionCall[] = [];
      let last: GenerateContentResponse | undefined;

      for await (const chunk of stream) {
        this.assertGeminiNotBlocked(chunk);
        last = chunk;
        if (chunk.text) {
          text += chunk.text;
          streamingCallback?.(chunk.text);
        }
        if (chunk.functionCalls?.length) toolCalls.push(...chunk.functionCalls);
      }

      const usage = last?.usageMetadata ?? {};
      const tokensIn = usage.promptTokenCount ?? 0;
      const tokensOut = this.tokensOut(usage);
      const cached = usage.cachedContentTokenCount ?? 0;
      await this.logTokens(tokensIn, tokensOut, cached);

      return {
        content: text,
        tokensIn,
        tokensOut,
        cachedInTokens: cached,
        toolCalls: toolCalls.map((fc) => ({
          id: fc.id ?? "",
          name: fc.name ?? "unknown",
          arguments: (fc.args as Record<string, unknown>) ?? {},
        })),
      };
    }

    /* ========== non‑streaming ========== */
    const response = await this.ai.models.generateContent(params);
    this.assertGeminiNotBlocked(response);

    const usage = response.usageMetadata ?? {};
    const tokensIn = usage.promptTokenCount ?? 0;
    const tokensOut = this.tokensOut(usage);
    const cached = usage.cachedContentTokenCount ?? 0;
    await this.logTokens(tokensIn, tokensOut, cached);

    return {
      content: response.text || "",
      tokensIn,
      tokensOut,
      cachedInTokens: cached,
      toolCalls: (response.functionCalls ?? []).map((fc) => ({
        id: fc.id ?? "",
        name: fc.name ?? "unknown",
        arguments: (fc.args as Record<string, unknown>) ?? {},
      })),
    };
  }
}
