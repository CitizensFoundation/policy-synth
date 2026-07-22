export interface PsModelInputUsagePartition {
  tokenInCount: number;
  tokenInCachedContextCount: number;
  tokenInCacheWriteCount: number;
  longContextTokenInCount: number;
  longContextTokenInCachedContextCount: number;
  longContextTokenInCacheWriteCount: number;
  longContextApplied: boolean;
  cacheComponentsExceedTotal: boolean;
}

export function resolveUsageAccountingVersion(
  value: unknown
): PsUsageAccountingVersion {
  return value === 2 || value === "2" ? 2 : 1;
}

const normalizeTokenCount = (value: number | undefined): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;

export function partitionModelInputUsage(
  tokensIn: number,
  cachedInTokens: number | undefined,
  cacheWriteInTokens: number | undefined,
  longContextTokenThreshold?: number
): PsModelInputUsagePartition {
  const totalInputTokens = normalizeTokenCount(tokensIn);
  const cachedInputTokens = normalizeTokenCount(cachedInTokens);
  const cacheWriteInputTokens = normalizeTokenCount(cacheWriteInTokens);
  const cacheComponentsExceedTotal =
    cachedInputTokens + cacheWriteInputTokens > totalInputTokens;
  const ordinaryInputTokens = Math.max(
    totalInputTokens - cachedInputTokens - cacheWriteInputTokens,
    0
  );
  const longContextApplied = Boolean(
    longContextTokenThreshold &&
      totalInputTokens >= longContextTokenThreshold
  );

  if (longContextApplied) {
    return {
      tokenInCount: 0,
      tokenInCachedContextCount: 0,
      tokenInCacheWriteCount: 0,
      longContextTokenInCount: ordinaryInputTokens,
      longContextTokenInCachedContextCount: cachedInputTokens,
      longContextTokenInCacheWriteCount: cacheWriteInputTokens,
      longContextApplied,
      cacheComponentsExceedTotal,
    };
  }

  return {
    tokenInCount: ordinaryInputTokens,
    tokenInCachedContextCount: cachedInputTokens,
    tokenInCacheWriteCount: cacheWriteInputTokens,
    longContextTokenInCount: 0,
    longContextTokenInCachedContextCount: 0,
    longContextTokenInCacheWriteCount: 0,
    longContextApplied,
    cacheComponentsExceedTotal,
  };
}

export function getCacheWriteInputCostMultiplier(
  prices: PsBaseModelPriceConfiguration
): number {
  const multiplier = prices.cacheWriteInputCostMultiplier;
  return typeof multiplier === "number" &&
    Number.isFinite(multiplier) &&
    multiplier >= 0
    ? multiplier
    : 1;
}

export interface PsLongContextPriceRates {
  inputTokensPerMillion: number;
  cachedInputTokensPerMillion: number;
  outputTokensPerMillion: number;
}

export function resolveLongContextPriceRates(
  prices: PsBaseModelPriceConfiguration
): PsLongContextPriceRates {
  return {
    inputTokensPerMillion:
      prices.longContextCostInTokensPerMillion ??
      prices.costInTokensPerMillion ??
      0,
    cachedInputTokensPerMillion:
      prices.longContextCostInCachedContextTokensPerMillion ??
      prices.costInCachedContextTokensPerMillion ??
      0,
    outputTokensPerMillion:
      prices.longContextCostOutTokensPerMillion ??
      prices.costOutTokensPerMillion ??
      0,
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizePersistedCallCount = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : undefined;

export function getPersistedWebSearchCallCount(data: unknown): number {
  if (!isRecord(data)) {
    return 0;
  }

  const providerData = isRecord(data.providerData)
    ? data.providerData
    : undefined;
  const providerMetadata = isRecord(data.providerMetadata)
    ? data.providerMetadata
    : undefined;
  const providerDataMetadata = isRecord(providerData?.providerMetadata)
    ? providerData.providerMetadata
    : undefined;
  const builtInTools = isRecord(providerMetadata?.builtInTools)
    ? providerMetadata.builtInTools
    : undefined;
  const providerDataBuiltInTools = isRecord(providerDataMetadata?.builtInTools)
    ? providerDataMetadata.builtInTools
    : undefined;
  const providerReportedCallCount =
    normalizePersistedCallCount(builtInTools?.webSearchCallCount) ??
    normalizePersistedCallCount(
      providerDataBuiltInTools?.webSearchCallCount
    );

  if (providerReportedCallCount !== undefined) {
    return providerReportedCallCount;
  }

  const webSearchCalls =
    builtInTools?.webSearchCalls ?? providerDataBuiltInTools?.webSearchCalls;

  if (!Array.isArray(webSearchCalls)) {
    return 0;
  }

  return webSearchCalls.reduce((count, call) => {
    if (!isRecord(call) || call.status === "not_used") {
      return count;
    }
    return count + 1;
  }, 0);
}

export function getWebSearchCost(
  webSearchCallCount: number,
  prices: PsBaseModelPriceConfiguration
): number {
  const normalizedCallCount =
    Number.isFinite(webSearchCallCount) && webSearchCallCount > 0
      ? Math.floor(webSearchCallCount)
      : 0;
  const costPerThousand = prices.costPerThousandWebSearches;

  return (
    (normalizedCallCount *
      (typeof costPerThousand === "number" &&
      Number.isFinite(costPerThousand) &&
      costPerThousand >= 0
        ? costPerThousand
        : 0)) /
    1000
  );
}
