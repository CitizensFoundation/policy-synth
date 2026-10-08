import OpenAI from "openai";
import { PolicySynthAgentBase } from "../base/agentBase.js";
import {
  getCacheWriteInputCostMultiplier,
  partitionModelInputUsage,
  resolveLongContextPriceRates,
} from "../base/modelUsageAccounting.js";
import { getOpenAiCacheWriteInTokens } from "./openAiUsage.js";
import { resolvePriceConfigurationForContext } from "../base/modelPriceUtils.js";

export const DEFAULT_OPENAI_DECISIONS_MODEL = "gpt-6-luna";

/** Prices for /v1/decisions, separate from this model's chat prices. */
export function getDefaultOpenAiDecisionsPrices(): PsBaseModelPriceConfiguration {
  return {
    costInTokensPerMillion: 0.1,
    costInCachedContextTokensPerMillion: 0,
    costOutTokensPerMillion: 0,
    cacheWriteInputCostMultiplier: 0,
    longContextTokenThreshold: 272_001,
    longContextCostInTokensPerMillion: 0.2,
    longContextCostInCachedContextTokensPerMillion: 0,
    longContextCostOutTokensPerMillion: 0,
    regionalProcessingMargin: 10,
    currency: "USD",
  };
}

const tokenCount = (value: number | undefined): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;

export function getDecisionUsageCounts(decision: PsDecisionResult) {
  return {
    tokensIn: tokenCount(decision.usage.input_tokens),
    tokensOut: tokenCount(decision.usage.output_tokens),
    cachedInTokens: tokenCount(decision.usage.input_tokens_details?.cached_tokens),
    cacheWriteInTokens: getOpenAiCacheWriteInTokens(decision.usage),
    reasoningTokens: tokenCount(
      decision.usage.output_tokens_details?.reasoning_tokens
    ),
  };
}

export function getDecisionCosts(
  decision: PsDecisionResult,
  prices: PsBaseModelPriceConfiguration,
  regionalProcessing?: PsOpenAiRegionalProcessing
) {
  const effectivePrices = resolvePriceConfigurationForContext(prices, {
    provider: "openai",
    regionalProcessing,
  })!;
  const usage = getDecisionUsageCounts(decision);
  const input = partitionModelInputUsage(
    usage.tokensIn,
    usage.cachedInTokens,
    usage.cacheWriteInTokens,
    effectivePrices.longContextTokenThreshold
  );
  const longRates = resolveLongContextPriceRates(effectivePrices);
  const inputRate = input.longContextApplied
    ? longRates.inputTokensPerMillion
    : effectivePrices.costInTokensPerMillion;
  const cachedRate = input.longContextApplied
    ? longRates.cachedInputTokensPerMillion
    : effectivePrices.costInCachedContextTokensPerMillion;
  const outputRate = input.longContextApplied
    ? longRates.outputTokensPerMillion
    : effectivePrices.costOutTokensPerMillion;
  return {
    tokensInCost: (
      (input.tokenInCount + input.longContextTokenInCount) * inputRate +
      usage.cachedInTokens * cachedRate +
      usage.cacheWriteInTokens * inputRate *
        getCacheWriteInputCostMultiplier(effectivePrices)
    ) / 1_000_000,
    tokensOutCost: usage.tokensOut * outputRate / 1_000_000,
  };
}

type ResolvedDecisionsConfig = Omit<
  PsOpenAiDecisionsConfig,
  "modelName" | "timeoutMs" | "prices"
> & {
  modelName: string;
  timeoutMs: number;
  prices: PsBaseModelPriceConfiguration;
};

export class OpenAiDecisions extends PolicySynthAgentBase {
  readonly config: ResolvedDecisionsConfig;
  private client?: OpenAI;

  constructor(config: PsOpenAiDecisionsConfig = {}) {
    super();
    const envTimeout = Number.parseInt(
      process.env.PS_MODEL_CALL_TIMEOUT_MS ?? "",
      10
    );
    this.config = {
      ...config,
      modelName: config.modelName ?? process.env.PS_OPENAI_DECISIONS_MODEL ??
        DEFAULT_OPENAI_DECISIONS_MODEL,
      timeoutMs: config.timeoutMs ?? (envTimeout > 0 ? envTimeout : 600_000),
      regionalProcessing: process.env.OPENAI_ENFORCE_EU_REGION === "true"
        ? "eu"
        : config.regionalProcessing,
      prices: { ...getDefaultOpenAiDecisionsPrices(), ...config.prices },
    };
  }

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY ||
        this.config.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI Decisions requires an OpenAI API key");
      this.client = new OpenAI({
        apiKey,
        project: this.config.projectId,
        baseURL: this.config.regionalProcessing === "eu"
          ? "https://eu.api.openai.com/v1"
          : "https://api.openai.com/v1",
      });
    }
    return this.client;
  }

  private validateInput(request: PsDecisionRequest): void {
    if (!Array.isArray(request.questions) || request.questions.length === 0) {
      throw new TypeError("OpenAI Decisions requires at least one question");
    }
    if (typeof request.input === "string") return;
    if (!Array.isArray(request.input)) {
      throw new TypeError("Decisions input must be text or user messages");
    }
    let imageCount = 0;
    for (const message of request.input) {
      if (message.role !== "user") {
        throw new TypeError("Decisions only accepts user messages");
      }
      if (message.type !== undefined && message.type !== "message") {
        throw new TypeError("Decisions only accepts message input items");
      }
      if (typeof message.content === "string") continue;
      if (!Array.isArray(message.content)) {
        throw new TypeError("Decisions messages require text or input parts");
      }
      for (const part of message.content) {
        if (part.type === "input_text") continue;
        if (part.type !== "input_image") {
          throw new TypeError("Decisions only accepts text and inline images");
        }
        if (!/^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/]+={0,2}$/i.test(part.image_url)) {
          throw new TypeError("Decisions images require base64 image data URLs");
        }
        if (++imageCount > 128) {
          throw new TypeError("Decisions accepts at most 128 images per request");
        }
      }
    }
  }

  async create(
    request: PsDecisionRequest,
    options: PsDecisionCallOptions = {}
  ): Promise<PsDecisionResult> {
    this.validateInput(request);
    const modelName = request.model ?? this.config.modelName;
    const model = modelName === this.config.modelName
      ? this.config.apiModelName ?? modelName
      : modelName;
    return this.getClient().decisions.create({
      input: request.input,
      questions: request.questions,
      model,
      ...(request.safety_identifier !== undefined
        ? { safety_identifier: request.safety_identifier }
        : {}),
    }, {
      timeout: options.timeoutMs ?? this.config.timeoutMs,
      maxRetries: options.maxRetries ?? 2,
      signal: options.signal,
    });
  }

  buildUsageItemData(
    decision: PsDecisionResult,
    request: PsDecisionRequest
  ): PsModelUsageItemProviderData {
    return {
      apiFamily: "decisions",
      provider: "openai",
      transport: "openai",
      accountingVersion: 2,
      request: {
        apiModelName: decision.model,
        questionCount: request.questions.length,
        questionTypes: request.questions.map((question) => question.type),
        regionalProcessing: this.config.regionalProcessing ?? null,
      },
      usageRaw: { ...decision.usage },
      usageNormalized: getDecisionUsageCounts(decision),
      providerMetadata: {
        apiModelName: decision.model,
        refusalCount: decision.answers.filter(
          (answer) => answer.type === "refusal"
        ).length,
      },
    };
  }
}
