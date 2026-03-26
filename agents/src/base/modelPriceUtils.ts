type PsModelPriceResolutionContext = {
  provider?: string;
  regionalProcessing?: PsOpenAiRegionalProcessing;
  inferenceType?: PsInferenceType;
};

const OPENAI_INFERENCE_RATE_KEYS: Record<
  PsOpenAiInferenceType,
  {
    input: "flexTokensIn" | "priorityTokensIn";
    cachedInput: "flexTokensCachedIn" | "priorityTokensCachedIn";
    output: "flexTokensOut" | "priorityTokensOut";
  }
> = {
  flex: {
    input: "flexTokensIn",
    cachedInput: "flexTokensCachedIn",
    output: "flexTokensOut",
  },
  priority: {
    input: "priorityTokensIn",
    cachedInput: "priorityTokensCachedIn",
    output: "priorityTokensOut",
  },
};

const ANTHROPIC_INFERENCE_RATE_KEYS: Record<
  PsAnthropicInferenceType,
  {
    input: "fastTokensIn";
    cachedInput: "fastTokensCachedIn";
    output: "fastTokensOut";
  }
> = {
  fast: {
    input: "fastTokensIn",
    cachedInput: "fastTokensCachedIn",
    output: "fastTokensOut",
  },
};

const normalizeInferenceTypeForProvider = (
  provider: string | undefined,
  inferenceType: PsInferenceType | undefined
): PsInferenceType | undefined => {
  if (!inferenceType) {
    return undefined;
  }

  const normalizedProvider = provider?.toLowerCase();

  if (
    normalizedProvider === "openai" ||
    normalizedProvider === "openairesponses"
  ) {
    if (inferenceType === "fast") {
      return "priority";
    }

    return inferenceType === "flex" || inferenceType === "priority"
      ? inferenceType
      : undefined;
  }

  if (normalizedProvider === "anthropic") {
    return inferenceType === "priority" ? "fast" : inferenceType;
  }

  return inferenceType;
};

const multiplyRate = (value: number | undefined, multiplier: number) =>
  value === undefined ? undefined : value * multiplier;

const deriveLongContextRate = (
  selectedBaseRate: number,
  standardBaseRate: number,
  standardLongRate?: number
) => {
  if (standardLongRate === undefined) {
    return selectedBaseRate;
  }

  if (!standardBaseRate) {
    return standardLongRate;
  }

  return selectedBaseRate * (standardLongRate / standardBaseRate);
};

export function resolvePriceConfigurationForContext(
  prices: PsBaseModelPriceConfiguration | undefined,
  context?: PsModelPriceResolutionContext
): PsBaseModelPriceConfiguration | undefined {
  if (!prices) {
    return undefined;
  }

  const resolved: PsBaseModelPriceConfiguration = { ...prices };
  const inferenceType = normalizeInferenceTypeForProvider(
    context?.provider,
    context?.inferenceType
  );

  if (inferenceType === "flex" || inferenceType === "priority") {
    const rateKeys = OPENAI_INFERENCE_RATE_KEYS[inferenceType];
    const selectedInputRate =
      prices[rateKeys.input] ?? prices.costInTokensPerMillion;
    const selectedCachedInputRate =
      prices[rateKeys.cachedInput] ??
      prices.costInCachedContextTokensPerMillion;
    const selectedOutputRate =
      prices[rateKeys.output] ?? prices.costOutTokensPerMillion;

    resolved.costInTokensPerMillion = selectedInputRate;
    resolved.costInCachedContextTokensPerMillion = selectedCachedInputRate;
    resolved.costOutTokensPerMillion = selectedOutputRate;

    if (prices.flexPriorityTokensEnabledOnLongContext) {
      resolved.longContextCostInTokensPerMillion = deriveLongContextRate(
        selectedInputRate,
        prices.costInTokensPerMillion,
        prices.longContextCostInTokensPerMillion
      );
      resolved.longContextCostInCachedContextTokensPerMillion =
        deriveLongContextRate(
          selectedCachedInputRate,
          prices.costInCachedContextTokensPerMillion,
          prices.longContextCostInCachedContextTokensPerMillion
        );
      resolved.longContextCostOutTokensPerMillion = deriveLongContextRate(
        selectedOutputRate,
        prices.costOutTokensPerMillion,
        prices.longContextCostOutTokensPerMillion
      );
    }
  }

  if (inferenceType === "fast") {
    const rateKeys = ANTHROPIC_INFERENCE_RATE_KEYS[inferenceType];
    const selectedInputRate =
      prices[rateKeys.input] ?? resolved.costInTokensPerMillion;
    const selectedCachedInputRate =
      prices[rateKeys.cachedInput] ??
      resolved.costInCachedContextTokensPerMillion;
    const selectedOutputRate =
      prices[rateKeys.output] ?? resolved.costOutTokensPerMillion;

    resolved.costInTokensPerMillion = selectedInputRate;
    resolved.costInCachedContextTokensPerMillion = selectedCachedInputRate;
    resolved.costOutTokensPerMillion = selectedOutputRate;
    resolved.longContextCostInTokensPerMillion = deriveLongContextRate(
      selectedInputRate,
      prices.costInTokensPerMillion,
      prices.longContextCostInTokensPerMillion
    );
    resolved.longContextCostInCachedContextTokensPerMillion =
      deriveLongContextRate(
        selectedCachedInputRate,
        prices.costInCachedContextTokensPerMillion,
        prices.longContextCostInCachedContextTokensPerMillion
      );
    resolved.longContextCostOutTokensPerMillion = deriveLongContextRate(
      selectedOutputRate,
      prices.costOutTokensPerMillion,
      prices.longContextCostOutTokensPerMillion
    );
  }

  if (
    context?.regionalProcessing === "eu" &&
    typeof prices.regionalProcessingMargin === "number" &&
    Number.isFinite(prices.regionalProcessingMargin)
  ) {
    const multiplier = 1 + prices.regionalProcessingMargin / 100;

    resolved.costInTokensPerMillion *= multiplier;
    resolved.costInCachedContextTokensPerMillion *= multiplier;
    resolved.costOutTokensPerMillion *= multiplier;
    resolved.longContextCostInTokensPerMillion = multiplyRate(
      resolved.longContextCostInTokensPerMillion,
      multiplier
    );
    resolved.longContextCostInCachedContextTokensPerMillion = multiplyRate(
      resolved.longContextCostInCachedContextTokensPerMillion,
      multiplier
    );
    resolved.longContextCostOutTokensPerMillion = multiplyRate(
      resolved.longContextCostOutTokensPerMillion,
      multiplier
    );
    resolved.flexTokensIn = multiplyRate(resolved.flexTokensIn, multiplier);
    resolved.flexTokensCachedIn = multiplyRate(
      resolved.flexTokensCachedIn,
      multiplier
    );
    resolved.flexTokensOut = multiplyRate(resolved.flexTokensOut, multiplier);
    resolved.priorityTokensIn = multiplyRate(
      resolved.priorityTokensIn,
      multiplier
    );
    resolved.priorityTokensCachedIn = multiplyRate(
      resolved.priorityTokensCachedIn,
      multiplier
    );
    resolved.priorityTokensOut = multiplyRate(
      resolved.priorityTokensOut,
      multiplier
    );
    resolved.fastTokensIn = multiplyRate(resolved.fastTokensIn, multiplier);
    resolved.fastTokensCachedIn = multiplyRate(
      resolved.fastTokensCachedIn,
      multiplier
    );
    resolved.fastTokensOut = multiplyRate(resolved.fastTokensOut, multiplier);
  }

  return resolved;
}
