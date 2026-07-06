import {
  GoogleGenAI,
  type GenerateContentConfig,
  GenerateContentParameters,
  GenerateContentResponse,
  FunctionCallingConfigMode,
  FunctionDeclaration,
  FunctionCall,
  HarmBlockThreshold,
  HarmCategory,
  ThinkingLevel,
  type ThinkingConfig,
  ToolConfig,
} from "@google/genai";

import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

import { BaseChatModel } from "./baseChatModel.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { appendFile } from "fs/promises";

const DEFAULT_GEMINI_MODEL_NAME = "gemini-2.5-flash-lite";

const parseModelAllowlist = (value?: string): Set<string> => {
  if (!value) return new Set<string>();
  return new Set(
    value
      .split(",")
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0)
  );
};

type UsageItemPayload = PsModelUsageItemProviderData & Record<string, unknown>;
type UsageItemResult = PsBaseModelReturnParameters & {
  usageItemData?: UsageItemPayload;
};
type GeminiExecutionContext = {
  requestedRegions: string[];
  selectedRegion: string | null;
};

export class GoogleGeminiChat extends BaseChatModel {
  ai!: GoogleGenAI;
  readonly modelName: string;
  readonly useVertex: boolean;
  private readonly vertexProject?: string;
  private readonly defaultVertexLocation?: string;
  private readonly vertexClients = new Map<string, GoogleGenAI>();
  private nextGeminiRegionIndex = 0;

  constructor(config: PsAiModelConfig) {
    super(
      config,
      config.modelName || DEFAULT_GEMINI_MODEL_NAME,
      config.maxTokensOut || 16_000
    );

    this.modelName = config.modelName || DEFAULT_GEMINI_MODEL_NAME;

    const vertexModelAllowlist = parseModelAllowlist(
      process.env.USE_GOOGLE_VERTEX_AI_FOR_MODELS
    );
    const useVertexForModel = vertexModelAllowlist.has(
      this.modelName.toLowerCase()
    );
    const useVertex =
      process.env.USE_GOOGLE_VERTEX_AI === "true" || useVertexForModel;
    this.useVertex = useVertex;
    this.vertexProject = process.env.GOOGLE_CLOUD_PROJECT ?? undefined;
    this.defaultVertexLocation = process.env.GOOGLE_CLOUD_LOCATION ?? undefined;

    if (useVertex) {
      if (this.defaultVertexLocation) {
        this.logger.debug(
          `Using Vertex AI for Gemini with default location ${this.defaultVertexLocation}`
        );
        this.ai = this.createVertexAi(this.defaultVertexLocation);
        this.vertexClients.set(this.defaultVertexLocation, this.ai);
      }
    } else {
      this.logger.debug(`Using direct Google GenAI client for Gemini not Vertex`);
      this.ai = this.createDirectAi(config);
    }
  }

  /* ---------- helper utilities ---------- */

  private createDirectAi(config: PsAiModelConfig): GoogleGenAI {
    return new GoogleGenAI({
      apiKey:
        config.apiKey ||
        process.env.PS_AGENT_GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY,
    });
  }

  private createVertexAi(location: string): GoogleGenAI {
    return new GoogleGenAI({
      vertexai: true,
      project: this.vertexProject!,
      location,
    });
  }

  private getDefaultAi(): GoogleGenAI {
    if (this.ai) {
      return this.ai;
    }

    if (!this.useVertex) {
      throw new Error("Gemini client is not initialized");
    }

    if (!this.defaultVertexLocation) {
      throw new Error(
        "Vertex Gemini requires GOOGLE_CLOUD_LOCATION or requestOptions.geminiRegions"
      );
    }

    this.ai = this.createVertexAi(this.defaultVertexLocation);
    this.vertexClients.set(this.defaultVertexLocation, this.ai);
    return this.ai;
  }

  protected getAiForLocation(location?: string): GoogleGenAI {
    if (!this.useVertex) {
      return this.getDefaultAi();
    }

    const effectiveLocation = location ?? this.defaultVertexLocation;
    if (!effectiveLocation) {
      throw new Error(
        "Vertex Gemini requires GOOGLE_CLOUD_LOCATION or requestOptions.geminiRegions"
      );
    }

    if (this.defaultVertexLocation && effectiveLocation === this.defaultVertexLocation) {
      return this.getDefaultAi();
    }

    const cachedClient = this.vertexClients.get(effectiveLocation);
    if (cachedClient) {
      return cachedClient;
    }

    const client = this.createVertexAi(effectiveLocation);
    this.vertexClients.set(effectiveLocation, client);
    return client;
  }

  private normalizeGeminiRegions(regions?: string[]): string[] {
    if (!regions?.length) {
      return [];
    }

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const region of regions) {
      const trimmed = region.trim();
      if (!trimmed || seen.has(trimmed)) {
        continue;
      }

      seen.add(trimmed);
      normalized.push(trimmed);
    }

    return normalized;
  }

  private getNextGeminiRegionStartIndex(regionCount: number): number {
    if (regionCount <= 1) {
      return 0;
    }

    const startIndex = this.nextGeminiRegionIndex % regionCount;
    this.nextGeminiRegionIndex = (startIndex + 1) % regionCount;
    return startIndex;
  }

  protected shouldUseGeminiRegionOverrides(): boolean {
    return true;
  }

  private isGemini3Model(): boolean {
    return /gemini-3/i.test(String(this.getApiModelName()));
  }

  private mapReasoningEffortToThinkingLevel(
    effort: PsReasoningEffort
  ): ThinkingLevel {
    switch (effort) {
      case "low":
        return ThinkingLevel.LOW;
      case "medium":
        return ThinkingLevel.MEDIUM;
      case "high":
      case "xhigh":
      case "max":
        return ThinkingLevel.HIGH;
    }
  }

  private buildThinkingConfig(): ThinkingConfig | undefined {
    if (this.isGemini3Model()) {
      return this.config.reasoningEffort
        ? {
            thinkingLevel: this.mapReasoningEffortToThinkingLevel(
              this.config.reasoningEffort
            ),
          }
        : undefined;
    }

    return typeof this.config.maxThinkingTokens === "number" &&
      Number.isFinite(this.config.maxThinkingTokens) &&
      this.config.maxThinkingTokens > 0
      ? { thinkingBudget: this.config.maxThinkingTokens }
      : undefined;
  }

  private buildGeminiExecutionPlan(requestOptions?: PsModelRequestOptions): {
    requestedRegions: string[];
    attemptRegions: Array<string | undefined>;
  } {
    if (!this.useVertex) {
      return {
        requestedRegions: [],
        attemptRegions: [undefined],
      };
    }

    const requestedRegions = this.shouldUseGeminiRegionOverrides()
      ? this.normalizeGeminiRegions(requestOptions?.geminiRegions)
      : [];

    if (requestedRegions.length > 0) {
      const startIndex = this.getNextGeminiRegionStartIndex(
        requestedRegions.length
      );

      return {
        requestedRegions,
        attemptRegions: [
          ...requestedRegions.slice(startIndex),
          ...requestedRegions.slice(0, startIndex),
        ],
      };
    }

    if (this.defaultVertexLocation) {
      return {
        requestedRegions: [],
        attemptRegions: [this.defaultVertexLocation],
      };
    }

    throw new Error(
      "Vertex Gemini requires GOOGLE_CLOUD_LOCATION or requestOptions.geminiRegions"
    );
  }

  protected buildContents(
    messages: PsModelMessage[],
    media?: PsPromptImage[]
  ): GenerateContentParameters["contents"] {
    const out: any[] = [];
    for (const m of messages) {
      if (m.role === "system" || m.role === "developer") continue; // handled via systemInstruction
      if (m.role === "assistant" && m.phase === "commentary") continue;

      if (m.role === "assistant" && m.toolCall) {
        out.push(this.buildAssistantToolCallMessage(m));
        continue;
      }

      if (m.role === "tool") {
        const responsePayload = this.parseToolResponse(m.message);
        out.push({
          role: "function",
          parts: [
            {
              functionResponse: {
                name: m.name ?? "tool_response",
                response: responsePayload,
              },
            },
          ],
        });
        continue;
      }

      const role = m.role === "assistant" ? "model" : "user";
      const text = m.message ?? "";
      out.push({ role, parts: [{ text }] });
    }
    media?.forEach((img) =>
      out.push({
        role: "user",
        parts: [{ inlineData: { mimeType: img.mimeType, data: img.data } }],
      })
    );
    return out;
  }

  protected buildAssistantToolCallMessage(message: PsModelMessage): {
    role: string;
    parts: any[];
  } {
    return {
      role: "model",
      parts: [
        {
          functionCall: {
            name: message.toolCall!.name,
            args: message.toolCall!.arguments ?? {},
          },
        },
      ],
    };
  }

  parseToolResponse(message: string): Record<string, unknown> {
    if (!message) return {};
    try {
      return JSON.parse(message);
    } catch {
      return { result: message };
    }
  }

  tokensOut(usage?: any): number {
    if (!usage) return 0;
    const thoughts = usage.thoughtsTokenCount ?? 0;
    if (usage.candidatesTokenCount != null)
      return usage.candidatesTokenCount + thoughts;
    if (usage.totalTokenCount != null && usage.promptTokenCount != null) {
      return (
        usage.totalTokenCount -
        usage.promptTokenCount -
        (usage.toolUsePromptTokenCount ?? 0)
      );
    }
    return 0;
  }

  async logTokens(tokensIn: number, tokensOut: number, cached: number) {
    if (!process.env.DEBUG_TOKENS_COUNTS_TO_CSV_FILE) return;
    await appendFile(
      "/tmp/geminiTokenDebug.csv",
      `${this.modelName},${tokensIn},${tokensOut},${cached}\n`
    );
  }

  private buildUsageItemData(
    usageRaw: Record<string, unknown> | null | undefined,
    request: {
      stream: boolean;
      toolChoice: ChatCompletionToolChoiceOption | "auto";
      toolCount: number;
      allowedFunctionNames?: string[];
      systemInstructionPresent: boolean;
      thinkingConfig?: ThinkingConfig;
      geminiRegions: string[];
      selectedGeminiRegion: string | null;
    },
    usage: {
      tokensIn: number;
      tokensOut: number;
      cachedInTokens: number;
      reasoningTokens: number;
    }
  ): UsageItemPayload {
    const transport = this.useVertex ? "vertex" : "google-genai";

    return {
      provider: "google",
      apiFamily: "generateContent",
      transport,
      modelName: this.modelName,
      request: {
        stream: request.stream,
        toolChoice: request.toolChoice,
        toolCount: request.toolCount,
        allowedFunctionNames: request.allowedFunctionNames ?? null,
        systemInstructionPresent: request.systemInstructionPresent,
        maxTokensOut: this.maxTokensOut ?? null,
        thinkingLevel: request.thinkingConfig?.thinkingLevel ?? null,
        thinkingBudget: request.thinkingConfig?.thinkingBudget ?? null,
        geminiRegions:
          this.useVertex && request.geminiRegions.length > 0
            ? request.geminiRegions
            : null,
        selectedGeminiRegion: this.useVertex
          ? request.selectedGeminiRegion
          : null,
      },
      usageRaw: usageRaw ?? undefined,
      usageNormalized: {
        tokensIn: usage.tokensIn,
        tokensOut: usage.tokensOut,
        cachedInTokens: usage.cachedInTokens,
        reasoningTokens: usage.reasoningTokens,
      },
      providerMetadata: {
        transport,
        project: this.useVertex
          ? this.vertexProject ?? null
          : null,
        location: this.useVertex
          ? request.selectedGeminiRegion ??
            this.defaultVertexLocation ??
            null
          : null,
        geminiRegions:
          this.useVertex && request.geminiRegions.length > 0
            ? request.geminiRegions
            : null,
        selectedGeminiRegion: this.useVertex
          ? request.selectedGeminiRegion
          : null,
        promptTokenCount:
          (usageRaw?.promptTokenCount as number | undefined) ?? null,
        candidatesTokenCount:
          (usageRaw?.candidatesTokenCount as number | undefined) ?? null,
        thoughtsTokenCount:
          (usageRaw?.thoughtsTokenCount as number | undefined) ?? null,
        toolUsePromptTokenCount:
          (usageRaw?.toolUsePromptTokenCount as number | undefined) ?? null,
        totalTokenCount:
          (usageRaw?.totalTokenCount as number | undefined) ?? null,
        cachedContentTokenCount:
          (usageRaw?.cachedContentTokenCount as number | undefined) ?? null,
      },
    };
  }

  private getErrorStatus(error: unknown): number | undefined {
    const candidate = error as
      | {
          response?: { status?: number | string };
          status?: number | string;
          statusCode?: number | string;
          code?: number | string;
        }
      | undefined;

    const status =
      candidate?.response?.status ??
      candidate?.status ??
      candidate?.statusCode ??
      candidate?.code;
    if (typeof status === "number" && Number.isFinite(status)) {
      return status;
    }

    if (typeof status === "string") {
      const parsed = Number.parseInt(status, 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  private isGeminiRegionFailoverEligible(error: unknown): boolean {
    this.logger.debug("Vertex Gemini error details: " + JSON.stringify(error, null, 2));
    const status = this.getErrorStatus(error);
    const message = this.getErrorMessage(error).toLowerCase();
    const causeCode =
      typeof error === "object" && error !== null && "cause" in error
        ? (error as { cause?: { code?: string } }).cause?.code
        : undefined;

    if (
      message.includes("blocked via prompt") ||
      message.includes("blocked via safety") ||
      message.includes("prompt may be malformed")
    ) {
      return false;
    }

    if (
      status !== undefined &&
      [400, 401, 403, 404, 409, 422].includes(status)
    ) {
      return false;
    }

    const isSocketError =
      causeCode === "UND_ERR_SOCKET" ||
      causeCode === "ECONNRESET" ||
      causeCode === "ECONNREFUSED" ||
      causeCode === "ETIMEDOUT" ||
      causeCode === "EPIPE" ||
      message.includes("socket hang up") ||
      message.includes("network error") ||
      message.includes("fetch failed");

    return (
      status === 408 ||
      status === 429 ||
      (status !== undefined && status >= 500 && status < 600) ||
      message.includes("429") ||
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      message.includes("resource exhausted") ||
      message.includes("quota exceeded") ||
      message.includes("temporarily unavailable") ||
      message.includes("service unavailable") ||
      message.includes("unavailable") ||
      message.includes("overloaded") ||
      message.includes("backend error") ||
      message.includes("internal server error") ||
      isSocketError
    );
  }

  private annotateRegionError(
    error: unknown,
    region: string | undefined,
    attempt: number,
    totalAttempts: number
  ): Error {
    const prefix = region
      ? `Gemini region ${region} attempt ${attempt}/${totalAttempts}`
      : `Gemini attempt ${attempt}/${totalAttempts}`;
    const message = `${prefix}: ${this.getErrorMessage(error)}`;

    const annotated =
      error instanceof Error ? new Error(message, { cause: error }) : new Error(message);
    if (error instanceof Error && error.stack) {
      annotated.stack = error.stack;
    }

    if (typeof error === "object" && error !== null) {
      Object.assign(annotated, error);
    }

    return annotated;
  }

  private async generateWithClient(
    ai: GoogleGenAI,
    params: GenerateContentParameters,
    streaming: boolean,
    streamingCallback: ((chunk: string) => void) | undefined,
    toolChoice: ChatCompletionToolChoiceOption | "auto",
    functionDeclarations: FunctionDeclaration[] | undefined,
    toolConfig: ToolConfig | undefined,
    systemInstruction: string,
    execution: GeminiExecutionContext,
    streamState: { emittedOutput: boolean }
  ): Promise<UsageItemResult> {
    if (streaming) {
      const stream = await ai.models.generateContentStream(params);
      let text = "";
      const toolCalls: FunctionCall[] = [];
      let last: GenerateContentResponse | undefined;

      for await (const chunk of stream) {
        this.assertGeminiNotBlocked(chunk);
        this.handleStreamChunk(chunk);
        last = chunk;
        if (chunk.text) {
          text += chunk.text;
          streamState.emittedOutput = true;
          streamingCallback?.(chunk.text);
        }
        if (chunk.functionCalls?.length) {
          toolCalls.push(...chunk.functionCalls);
          streamState.emittedOutput = true;
        }
      }

      if (last) {
        this.handleFinalResponse(last);
      }

      const usage = last?.usageMetadata ?? {};
      const tokensIn =
        (usage.promptTokenCount ?? 0) + (usage.toolUsePromptTokenCount ?? 0);
      const tokensOut = this.tokensOut(usage);
      const cached = usage.cachedContentTokenCount ?? 0;
      const reasoningTokens = usage.thoughtsTokenCount ?? 0;
      await this.logTokens(tokensIn, tokensOut, cached);

      return {
        content: text,
        tokensIn,
        tokensOut,
        cachedInTokens: cached,
        reasoningTokens,
        toolCalls: toolCalls.map((fc) => ({
          id: fc.id ?? "",
          name: fc.name ?? "unknown",
          arguments: (fc.args as Record<string, unknown>) ?? {},
        })),
        usageItemData: this.buildUsageItemData(
          (last?.usageMetadata as Record<string, unknown> | null | undefined) ??
            null,
          {
            stream: true,
            toolChoice,
            toolCount: functionDeclarations?.length ?? 0,
            allowedFunctionNames:
              toolConfig?.functionCallingConfig?.allowedFunctionNames,
            systemInstructionPresent: Boolean(systemInstruction),
            thinkingConfig: params.config?.thinkingConfig,
            geminiRegions: execution.requestedRegions,
            selectedGeminiRegion: execution.selectedRegion,
          },
          {
            tokensIn,
            tokensOut,
            cachedInTokens: cached,
            reasoningTokens,
          }
        ),
      };
    }

    const response = await ai.models.generateContent(params);
    this.assertGeminiNotBlocked(response);
    this.handleFinalResponse(response);

    const usage = response.usageMetadata ?? {};
    const tokensIn =
      (usage.promptTokenCount ?? 0) + (usage.toolUsePromptTokenCount ?? 0);
    const tokensOut = this.tokensOut(usage);
    const cached = usage.cachedContentTokenCount ?? 0;
    const reasoningTokens = usage.thoughtsTokenCount ?? 0;
    this.logger.debug("Gemini usage: " + JSON.stringify(usage, null, 2));
    await this.logTokens(tokensIn, tokensOut, cached);

    return {
      content: response.text || "",
      tokensIn,
      tokensOut,
      cachedInTokens: cached,
      reasoningTokens,
      toolCalls: (response.functionCalls ?? []).map((fc) => ({
        id: fc.id ?? "",
        name: fc.name ?? "unknown",
        arguments: (fc.args as Record<string, unknown>) ?? {},
      })),
      usageItemData: this.buildUsageItemData(
        (response.usageMetadata as Record<string, unknown> | null | undefined) ??
          null,
        {
          stream: false,
          toolChoice,
          toolCount: functionDeclarations?.length ?? 0,
          allowedFunctionNames:
            toolConfig?.functionCallingConfig?.allowedFunctionNames,
          systemInstructionPresent: Boolean(systemInstruction),
          thinkingConfig: params.config?.thinkingConfig,
          geminiRegions: execution.requestedRegions,
          selectedGeminiRegion: execution.selectedRegion,
        },
        {
          tokensIn,
          tokensOut,
          cachedInTokens: cached,
          reasoningTokens,
        }
      ),
    };
  }

  static safetySettings = [
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
    },
  ];

  assertGeminiNotBlocked(response: GenerateContentResponse) {
    if (!response.candidates?.length) {
      const pf = response.promptFeedback;
      if (pf?.blockReason) {
        // The prompt was blocked; include the reason in the error
        throw new Error(
          `Response was blocked via prompt: ${pf.blockReason} ` +
            (pf.safetyRatings
              ?.map((r) => `${r.category}=${r.probability}`)
              .join(", ") || "")
        );
      }
      throw new Error(
        "Gemini returned no candidates; the prompt may be malformed."
      );
    }

    // check for blocked candidate
    const candidate = response.candidates[0];
    if (candidate.finishReason === "SAFETY") {
      throw new Error(
        `Response was blocked via safety: ` +
          (candidate.safetyRatings
            ?.map((r) => `${r.category}=${r.probability}`)
            .join(", ") || "")
      );
    }
  }

  /* ---------- main generate() entry‑point ---------- */

  async generate(
    messages: PsModelMessage[],
    streaming = false,
    streamingCallback?: (chunk: string) => void,
    media?: PsPromptImage[],
    tools?: ChatCompletionTool[],
    toolChoice: ChatCompletionToolChoiceOption | "auto" = "auto",
    allowedTools?: string[],
    requestOptions?: PsModelRequestOptions
  ): Promise<PsBaseModelReturnParameters> {
    if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
      this.logger.debug(
        `Messages:\n${this.prettyPrintPromptMessages(
          messages.map((m) => ({
            role: m.role,
            content: m.message,
          }))
        )}`
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
      let allowedNames: string[] | undefined;

      if (toolChoice === "none") {
        mode = FunctionCallingConfigMode.NONE;
      } else if (toolChoice !== "auto") {
        mode = FunctionCallingConfigMode.ANY;
        allowedNames = allowedTools;
        if (typeof toolChoice !== "string" && toolChoice.type === "function") {
          allowedNames = [toolChoice.function.name];
        }
      }
      toolConfig = {
        functionCallingConfig: { mode, allowedFunctionNames: allowedNames },
      };
    }

    const thinkingConfig = this.buildThinkingConfig();
    const config: GenerateContentConfig = {
      systemInstruction: systemInstruction,
      tools: functionDeclarations ? [{ functionDeclarations }] : undefined,
      toolConfig,
      safetySettings: GoogleGeminiChat.safetySettings,
      maxOutputTokens: this.maxTokensOut,
    };

    if (thinkingConfig) {
      config.thinkingConfig = thinkingConfig;
    }

    const params: GenerateContentParameters = {
      model: this.modelName,
      contents: this.buildContents(messages, media),
      config,
    };
    const executionPlan = this.buildGeminiExecutionPlan(requestOptions);
    let lastError: Error | undefined;

    for (let attemptIndex = 0; attemptIndex < executionPlan.attemptRegions.length; attemptIndex++) {
      const selectedRegion = executionPlan.attemptRegions[attemptIndex] ?? null;
      const streamState = { emittedOutput: false };

      try {
        const ai = this.getAiForLocation(selectedRegion ?? undefined);
        return await this.generateWithClient(
          ai,
          params,
          streaming,
          streamingCallback,
          toolChoice,
          functionDeclarations,
          toolConfig,
          systemInstruction,
          {
            requestedRegions: executionPlan.requestedRegions,
            selectedRegion,
          },
          streamState
        );
      } catch (error) {
        const annotatedError = this.annotateRegionError(
          error,
          selectedRegion ?? undefined,
          attemptIndex + 1,
          executionPlan.attemptRegions.length
        );
        lastError = annotatedError;

        const hasRemainingRegions =
          attemptIndex < executionPlan.attemptRegions.length - 1;
        const canFailOver =
          this.useVertex &&
          executionPlan.attemptRegions.length > 1 &&
          hasRemainingRegions &&
          this.isGeminiRegionFailoverEligible(error) &&
          (!streaming || !streamState.emittedOutput);

        if (canFailOver) {
          const nextRegion = executionPlan.attemptRegions[attemptIndex + 1];
          this.logger.warn(
            `Gemini call failed in region ${
              selectedRegion ?? "default"
            }; retrying in ${nextRegion ?? "default"}: ${this.getErrorMessage(error)}`
          );
          continue;
        }

        throw annotatedError;
      }
    }

    throw lastError ?? new Error("Gemini call failed before attempting any request");
  }

  protected handleStreamChunk(_chunk: GenerateContentResponse) {
    // no-op; subclasses may override
  }

  protected handleFinalResponse(_response: GenerateContentResponse) {
    // no-op; subclasses may override
  }
}
