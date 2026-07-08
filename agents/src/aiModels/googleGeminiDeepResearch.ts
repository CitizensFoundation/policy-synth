import type { GoogleGenAI } from "@google/genai";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

import { GoogleGeminiChat } from "./googleGeminiChat.js";
import {
  buildPromptCacheUsageData,
  normalizePromptCacheOptions,
} from "./promptCacheOptions.js";

const GEMINI_DEEP_RESEARCH_POLL_INTERVAL_MS = 10_000;
const GEMINI_DEEP_RESEARCH_CANCEL_TIMEOUT_MS = 10_000;
const GEMINI_DEEP_RESEARCH_CLEANUP_RESERVE_MS = 15_000;
const GEMINI_DEEP_RESEARCH_MAX_RETRIEVE_ERRORS = 3;
const GEMINI_DEEP_RESEARCH_TIMEOUT_ERROR =
  "GeminiDeepResearchTimeoutError";
const GEMINI_DEEP_RESEARCH_TERMINAL_STATUSES = new Set([
  "completed",
  "failed",
  "cancelled",
  "incomplete",
  "budget_exceeded",
]);

type GeminiInteractionStatus =
  | "in_progress"
  | "requires_action"
  | "completed"
  | "failed"
  | "cancelled"
  | "incomplete"
  | "budget_exceeded"
  | (string & {});

type GeminiInteractionUsage = Record<string, unknown> & {
  total_input_tokens?: number;
  total_cached_tokens?: number;
  total_output_tokens?: number;
  total_tool_use_tokens?: number;
  total_thought_tokens?: number;
  total_tokens?: number;
};

type GeminiInteractionStep = {
  type?: string;
  content?: unknown;
};

type GeminiInteraction = {
  id: string;
  status: GeminiInteractionStatus;
  output_text?: string;
  previous_interaction_id?: string;
  usage?: GeminiInteractionUsage;
  steps?: GeminiInteractionStep[];
};

type GeminiDeepResearchCreateParams = {
  agent: string;
  agent_config: PsGeminiDeepResearchConfig;
  input: string;
  background: true;
  store: true;
  system_instruction?: string;
  previous_interaction_id?: string;
};

type GeminiRequestOptions = {
  timeout?: number;
  maxRetries?: number;
};

type GeminiInteractionsClient = {
  create(
    params: GeminiDeepResearchCreateParams,
    options?: GeminiRequestOptions
  ): Promise<GeminiInteraction>;
  get(
    id: string,
    params?: null,
    options?: GeminiRequestOptions
  ): Promise<GeminiInteraction>;
  cancel(
    id: string,
    params?: null,
    options?: GeminiRequestOptions
  ): Promise<GeminiInteraction>;
};

type GeminiInteractionRequestContext = {
  input: string;
  systemInstruction: string;
  previousInteractionId?: string;
};

type GeminiInteractionUsageCounts = {
  tokensIn: number;
  tokensOut: number;
  cachedInTokens: number;
  reasoningTokens: number;
};

type GeminiDeepResearchTimeoutBudget = {
  timeoutMs?: number;
  pollingDeadlineMs?: number;
  cancelTimeoutMs: number;
};

type GeminiDeepResearchContinuationState = {
  previousInteractionId: string;
  lastSubmittedMessageCount: number;
  lastSubmittedMessageSignature: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export class GeminiDeepResearchRequiresActionError extends Error {
  readonly isPsNonRetryableModelError = true;
  readonly interactionId: string;
  readonly actionText: string;

  constructor(interactionId: string, actionText: string) {
    super(`Gemini Deep Research requires action: ${actionText}`);
    this.name = "GeminiDeepResearchRequiresActionError";
    this.interactionId = interactionId;
    this.actionText = actionText;
  }
}

export class GeminiDeepResearchTimeoutError extends Error {
  readonly isPsNonRetryableModelError = true;

  constructor(timeoutMs: number) {
    super(`Gemini Deep Research interaction timed out after ${timeoutMs}ms`);
    this.name = GEMINI_DEEP_RESEARCH_TIMEOUT_ERROR;
  }
}

/**
 * Gemini Deep Research runs through the Interactions API and can take up to
 * 60 minutes. PolicySynth defaults model calls to shorter timeouts, so callers
 * should raise timeoutMs for real research tasks. Collaborative planning and
 * execution share that one timeout budget. Pricing is per task, roughly $1-3
 * for preview and $3-7 for max preview at the time this wrapper was added.
 */
export class GoogleGeminiDeepResearch extends GoogleGeminiChat {
  protected pollDelayMs = GEMINI_DEEP_RESEARCH_POLL_INTERVAL_MS;
  private continuationStates = new Map<
    string,
    GeminiDeepResearchContinuationState
  >();

  constructor(config: PsAiModelConfig) {
    super(config);

    if (this.useVertex) {
      throw new Error(
        "Gemini Deep Research requires the Gemini Developer API; disable USE_GOOGLE_VERTEX_AI for this model"
      );
    }

    const agentId = String(this.getApiModelName());
    if (!agentId.toLowerCase().startsWith("deep-research")) {
      throw new Error(
        `Gemini Deep Research model must start with deep-research: ${agentId}`
      );
    }
  }

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
    if (streaming) {
      this.logger.warn(
        "Gemini Deep Research does not support streaming in this wrapper; final report will be emitted once."
      );
    }
    this.warnUnsupportedInputs(messages, media, tools, toolChoice, allowedTools);

    const agentId = String(this.getApiModelName());
    const agentConfig =
      requestOptions?.geminiDeepResearchConfig ?? this.defaultAgentConfig();
    const continuationStateKey =
      this.getContinuationStateKey(requestOptions);
    const context = this.buildInteractionRequestContext(
      messages,
      continuationStateKey
    );
    const initialParams = this.buildCreateParams(
      agentId,
      agentConfig,
      context
    );
    const timeoutBudget = this.createTimeoutBudget(requestOptions);

    let finalInteraction = await this.createAndPollInteraction(
      initialParams,
      timeoutBudget
    );
    let planningInteraction: GeminiInteraction | undefined;

    if (finalInteraction.status === "requires_action") {
      if (!agentConfig.collaborative_planning) {
        throw new GeminiDeepResearchRequiresActionError(
          finalInteraction.id,
          this.extractReportText(finalInteraction)
        );
      }

      const planText = this.extractReportText(finalInteraction);
      this.logger.info(`Gemini Deep Research auto-approving plan: ${planText}`);
      planningInteraction = finalInteraction;
      finalInteraction = await this.createAndPollInteraction(
        this.buildCreateParams(
          agentId,
          { ...agentConfig, collaborative_planning: false },
          {
            input: "Approved. Proceed with the research plan.",
            systemInstruction: context.systemInstruction,
            previousInteractionId: finalInteraction.id,
          }
        ),
        timeoutBudget
      );
    }

    if (finalInteraction.status !== "completed") {
      throw new Error(
        `Gemini Deep Research interaction ${finalInteraction.id} finished with status ${finalInteraction.status}: ${this.extractReportText(
          finalInteraction
        )}`
      );
    }

    const content = this.extractReportText(finalInteraction);
    streamingCallback?.(content);
    if (continuationStateKey) {
      this.continuationStates.set(continuationStateKey, {
        previousInteractionId: finalInteraction.id,
        lastSubmittedMessageCount: messages.length,
        lastSubmittedMessageSignature: this.buildMessageSignature(messages),
      });
    }

    const usageCounts = this.normalizeUsage(
      finalInteraction.usage,
      planningInteraction?.usage
    );
    return {
      content,
      tokensIn: usageCounts.tokensIn,
      tokensOut: usageCounts.tokensOut,
      cachedInTokens: usageCounts.cachedInTokens,
      reasoningTokens: usageCounts.reasoningTokens,
      toolCalls: [],
      usageItemData: this.buildDeepResearchUsageItemData(
        finalInteraction,
        initialParams,
        usageCounts,
        requestOptions,
        planningInteraction
      ),
    };
  }

  private defaultAgentConfig(): PsGeminiDeepResearchConfig {
    return { type: "deep-research" };
  }

  private getContinuationStateKey(
    requestOptions?: PsModelRequestOptions
  ): string | undefined {
    const key = requestOptions?.geminiDeepResearchStateKey?.trim();
    return key || undefined;
  }

  private createTimeoutBudget(
    requestOptions?: PsModelRequestOptions
  ): GeminiDeepResearchTimeoutBudget {
    const timeoutMs =
      typeof requestOptions?.timeoutMs === "number" &&
      Number.isFinite(requestOptions.timeoutMs) &&
      requestOptions.timeoutMs > 0
        ? requestOptions.timeoutMs
        : undefined;
    const overallDeadlineMs =
      typeof timeoutMs === "number" ? Date.now() + timeoutMs : undefined;
    const cleanupReserveMs = this.getCleanupReserveMs(timeoutMs);
    const pollingDeadlineMs =
      typeof overallDeadlineMs === "number"
        ? overallDeadlineMs - cleanupReserveMs
        : undefined;

    return {
      timeoutMs,
      pollingDeadlineMs,
      cancelTimeoutMs: this.getCancelTimeoutMs(cleanupReserveMs),
    };
  }

  private getInteractionsClient(): GeminiInteractionsClient {
    return (this.ai as GoogleGenAI)
      .interactions as unknown as GeminiInteractionsClient;
  }

  private buildCreateParams(
    agentId: string,
    agentConfig: PsGeminiDeepResearchConfig,
    context: GeminiInteractionRequestContext
  ): GeminiDeepResearchCreateParams {
    const params: GeminiDeepResearchCreateParams = {
      agent: agentId,
      agent_config: agentConfig,
      input: context.input,
      background: true,
      store: true,
    };

    if (context.systemInstruction) {
      params.system_instruction = context.systemInstruction;
    }
    if (context.previousInteractionId) {
      params.previous_interaction_id = context.previousInteractionId;
    }

    return params;
  }

  private buildInteractionRequestContext(
    messages: PsModelMessage[],
    continuationStateKey?: string
  ): GeminiInteractionRequestContext {
    const systemInstruction = messages
      .filter((message) => message.role === "system" || message.role === "developer")
      .map((message) => message.message)
      .join("\n\n");

    const continuationState = continuationStateKey
      ? this.continuationStates.get(continuationStateKey)
      : undefined;
    let previousInteractionId = continuationState?.previousInteractionId;
    let input = "";

    if (previousInteractionId && continuationStateKey && continuationState) {
      if (messages.length > continuationState.lastSubmittedMessageCount) {
        input = this.flattenMessages(
          messages.slice(continuationState.lastSubmittedMessageCount),
          new Set(["user"])
        );
        if (!input) {
          this.logger.debug(
            "Gemini Deep Research found no new user-message delta; resetting continuation state."
          );
          this.resetInteractionState(continuationStateKey);
          previousInteractionId = undefined;
        }
      } else if (
        this.buildMessageSignature(messages) ===
        continuationState.lastSubmittedMessageSignature
      ) {
        this.logger.debug(
          "Gemini Deep Research repeated previous message set; resetting continuation state."
        );
        this.resetInteractionState(continuationStateKey);
        previousInteractionId = undefined;
      } else {
        input = this.flattenMessages(messages, new Set(["user"]));
        if (!input) {
          this.logger.debug(
            "Gemini Deep Research found no user input in single-turn continuation; resetting continuation state."
          );
          this.resetInteractionState(continuationStateKey);
          previousInteractionId = undefined;
        }
      }
    }

    if (!previousInteractionId) {
      input = this.flattenMessages(messages, new Set(["user", "assistant"]));
    }

    if (!input) {
      throw new Error("Gemini Deep Research requires at least one text input message.");
    }

    return {
      input,
      systemInstruction,
      previousInteractionId,
    };
  }

  private resetInteractionState(continuationStateKey: string): void {
    this.continuationStates.delete(continuationStateKey);
  }

  private buildMessageSignature(messages: PsModelMessage[]): string {
    return JSON.stringify(
      messages.map((message) => ({
        role: message.role,
        message: message.message,
        phase: message.phase ?? null,
        hasToolCall: Boolean(message.toolCall),
        toolCallId: message.toolCallId ?? null,
      }))
    );
  }

  private flattenMessages(
    messages: PsModelMessage[],
    allowedRoles: Set<string>
  ): string {
    const entries: Array<{ role: string; text: string }> = [];

    for (const message of messages) {
      if (!allowedRoles.has(message.role)) {
        continue;
      }
      if (message.role === "assistant" && message.toolCall) {
        this.logger.warn(
          "Skipping assistant tool-call message for Gemini Deep Research; function tools are not supported."
        );
        continue;
      }

      const text = message.message.trim();
      if (text) {
        entries.push({ role: message.role, text });
      }
    }

    if (entries.length === 1) {
      return entries[0].text;
    }

    return entries
      .map((entry) => `${entry.role}: ${entry.text}`)
      .join("\n\n");
  }

  private warnUnsupportedInputs(
    messages: PsModelMessage[],
    media?: PsPromptImage[],
    tools?: ChatCompletionTool[],
    toolChoice?: ChatCompletionToolChoiceOption | "auto",
    allowedTools?: string[]
  ): void {
    if (media?.length) {
      this.logger.warn(
        "Ignoring media for Gemini Deep Research; Interactions Deep Research supports text input only in this wrapper."
      );
    }
    if (tools?.length || (toolChoice && toolChoice !== "auto") || allowedTools?.length) {
      this.logger.warn(
        "Ignoring tools/toolChoice for Gemini Deep Research; custom function tools are not supported."
      );
    }
    if (messages.some((message) => message.role === "tool")) {
      this.logger.warn(
        "Skipping tool result messages for Gemini Deep Research; custom function tools are not supported."
      );
    }
  }

  private async createAndPollInteraction(
    params: GeminiDeepResearchCreateParams,
    timeoutBudget: GeminiDeepResearchTimeoutBudget
  ): Promise<GeminiInteraction> {
    const interactions = this.getInteractionsClient();
    let interactionId: string | undefined;
    let cancelRequested = false;
    let consecutiveRetrieveErrors = 0;

    const cancelKnownInteraction = async () => {
      if (!interactionId || cancelRequested) return;
      cancelRequested = true;
      await interactions.cancel(interactionId, null, {
        timeout: timeoutBudget.cancelTimeoutMs,
        maxRetries: 0,
      });
    };

    try {
      this.assertTimeoutBudget(
        timeoutBudget.timeoutMs,
        timeoutBudget.pollingDeadlineMs
      );
      let interaction = await interactions.create(params, {
        timeout: this.getRequestTimeoutMs(timeoutBudget.pollingDeadlineMs),
        maxRetries: 0,
      });
      interactionId = interaction.id;
      this.logger.debug(
        `Gemini Deep Research interaction ${interaction.id} status: ${interaction.status}`
      );

      while (!this.isTerminalInteraction(interaction)) {
        this.assertTimeoutBudget(
          timeoutBudget.timeoutMs,
          timeoutBudget.pollingDeadlineMs
        );
        const remainingMs = this.getRemainingTimeoutMs(
          timeoutBudget.pollingDeadlineMs
        );
        const delayMs =
          typeof remainingMs === "number"
            ? Math.min(this.pollDelayMs, remainingMs)
            : this.pollDelayMs;
        await this.sleep(delayMs);
        this.assertTimeoutBudget(
          timeoutBudget.timeoutMs,
          timeoutBudget.pollingDeadlineMs
        );

        try {
          interaction = await interactions.get(interaction.id, null, {
            timeout: this.getRequestTimeoutMs(timeoutBudget.pollingDeadlineMs),
            maxRetries: 0,
          });
          consecutiveRetrieveErrors = 0;
        } catch (error) {
          consecutiveRetrieveErrors += 1;
          if (
            consecutiveRetrieveErrors <
            GEMINI_DEEP_RESEARCH_MAX_RETRIEVE_ERRORS
          ) {
            this.logger.warn(
              `Gemini Deep Research retrieve failed for ${interaction.id}; continuing poll attempt ${consecutiveRetrieveErrors}/${GEMINI_DEEP_RESEARCH_MAX_RETRIEVE_ERRORS}: ${this.getUnknownErrorMessage(
                error
              )}`
            );
            continue;
          }

          await cancelKnownInteraction();
          throw error;
        }

        this.logger.debug(
          `Gemini Deep Research interaction ${interaction.id} status: ${interaction.status}`
        );
      }

      return interaction;
    } catch (error) {
      if (this.isTimeoutError(error)) {
        await cancelKnownInteraction();
      }
      throw error;
    }
  }

  private isTerminalInteraction(interaction: GeminiInteraction): boolean {
    return (
      GEMINI_DEEP_RESEARCH_TERMINAL_STATUSES.has(interaction.status) ||
      interaction.status === "requires_action"
    );
  }

  private getCleanupReserveMs(timeoutMs?: number): number {
    if (typeof timeoutMs !== "number") {
      return GEMINI_DEEP_RESEARCH_CLEANUP_RESERVE_MS;
    }

    return Math.max(
      1,
      Math.min(
        GEMINI_DEEP_RESEARCH_CLEANUP_RESERVE_MS,
        Math.floor(timeoutMs * 0.1)
      )
    );
  }

  private getCancelTimeoutMs(cleanupReserveMs: number): number {
    return Math.max(
      1,
      Math.min(GEMINI_DEEP_RESEARCH_CANCEL_TIMEOUT_MS, cleanupReserveMs)
    );
  }

  private getRequestTimeoutMs(deadlineMs?: number): number | undefined {
    const remainingMs = this.getRemainingTimeoutMs(deadlineMs);
    return typeof remainingMs === "number" ? Math.max(1, remainingMs) : undefined;
  }

  private getRemainingTimeoutMs(deadlineMs?: number): number | undefined {
    return typeof deadlineMs === "number"
      ? Math.max(0, deadlineMs - Date.now())
      : undefined;
  }

  private assertTimeoutBudget(
    timeoutMs: number | undefined,
    deadlineMs: number | undefined
  ): void {
    if (typeof timeoutMs !== "number" || typeof deadlineMs !== "number") {
      return;
    }

    const remainingMs = this.getRemainingTimeoutMs(deadlineMs);
    if (typeof remainingMs === "number" && remainingMs <= 0) {
      throw new GeminiDeepResearchTimeoutError(timeoutMs);
    }
  }

  private isTimeoutError(error: unknown): boolean {
    return error instanceof Error && error.name === GEMINI_DEEP_RESEARCH_TIMEOUT_ERROR;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
  }

  private extractReportText(interaction: GeminiInteraction): string {
    if (typeof interaction.output_text === "string" && interaction.output_text) {
      return interaction.output_text;
    }

    for (const step of [...(interaction.steps ?? [])].reverse()) {
      if (step.type !== "model_output") continue;
      const text = this.collectText(step.content).join("");
      if (text) return text;
    }

    return "";
  }

  private collectText(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.collectText(item));
    }
    if (!isRecord(value)) {
      return [];
    }

    const ownText = typeof value.text === "string" ? [value.text] : [];
    return [
      ...ownText,
      ...Object.entries(value).flatMap(([key, nested]) =>
        key === "text" ? [] : this.collectText(nested)
      ),
    ];
  }

  private normalizeUsage(
    ...usages: Array<GeminiInteractionUsage | undefined>
  ): GeminiInteractionUsageCounts {
    const counts: GeminiInteractionUsageCounts = {
      tokensIn: 0,
      tokensOut: 0,
      cachedInTokens: 0,
      reasoningTokens: 0,
    };

    for (const usage of usages) {
      counts.tokensIn +=
        (usage?.total_input_tokens ?? 0) + (usage?.total_tool_use_tokens ?? 0);
      counts.tokensOut += usage?.total_output_tokens ?? 0;
      counts.cachedInTokens += usage?.total_cached_tokens ?? 0;
      counts.reasoningTokens += usage?.total_thought_tokens ?? 0;
    }

    return counts;
  }

  private buildUsageRaw(
    interaction: GeminiInteraction,
    planningInteraction?: GeminiInteraction
  ): Record<string, unknown> | undefined {
    const executionUsage = interaction.usage
      ? { ...interaction.usage }
      : undefined;
    if (!planningInteraction) {
      return executionUsage;
    }

    return {
      planning: planningInteraction.usage
        ? { ...planningInteraction.usage }
        : null,
      execution: executionUsage ?? null,
    };
  }

  private buildDeepResearchUsageItemData(
    interaction: GeminiInteraction,
    request: GeminiDeepResearchCreateParams,
    usage: GeminiInteractionUsageCounts,
    requestOptions?: PsModelRequestOptions,
    planningInteraction?: GeminiInteraction
  ): PsModelUsageItemProviderData {
    const promptCache = normalizePromptCacheOptions(requestOptions);
    return {
      provider: "google",
      apiFamily: "interactions",
      transport: "google-genai",
      modelName: this.modelName,
      request: {
        agentId: request.agent,
        background: request.background,
        store: request.store,
        agentConfig: request.agent_config,
        previousInteractionId: request.previous_interaction_id ?? null,
        continuationStateKey:
          requestOptions?.geminiDeepResearchStateKey ?? null,
        systemInstructionPresent: Boolean(request.system_instruction),
        timeoutMs: requestOptions?.timeoutMs ?? null,
        promptCache: promptCache
          ? buildPromptCacheUsageData({
              provider: "google",
              promptCache,
              appliedMode:
                promptCache.enabled === false ? "disabled" : "unsupported",
              unsupportedReason:
                promptCache.enabled === false
                  ? undefined
                  : "Gemini Deep Research does not expose explicit prompt cache controls through this wrapper; provider-side implicit caching may still apply.",
            })
          : null,
      },
      usageRaw: this.buildUsageRaw(interaction, planningInteraction),
      usageNormalized: usage,
      providerMetadata: {
        interactionId: interaction.id,
        status: interaction.status,
        previousInteractionId: interaction.previous_interaction_id ?? null,
        planningInteractionId: planningInteraction?.id ?? null,
        planningStatus: planningInteraction?.status ?? null,
      },
    };
  }

  private getUnknownErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
}

export default GoogleGeminiDeepResearch;
