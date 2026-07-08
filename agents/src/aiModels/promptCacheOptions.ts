export type PromptCacheProvider = "openai" | "anthropic" | "google";

export type PromptCacheAppliedMode =
  | "openai-prompt-cache"
  | "claude-cache-control"
  | "gemini-cached-content"
  | "implicit"
  | "disabled"
  | "unsupported";

export type PromptCacheUsageData = {
  requested: boolean;
  enabled: boolean;
  provider: PromptCacheProvider;
  keyPresent: boolean;
  retention: PsPromptCacheRetention | null;
  geminiCachedContentNamePresent: boolean;
  appliedMode: PromptCacheAppliedMode;
  unsupportedReason: string | null;
};

type PromptCacheInput = {
  promptCache?: PsPromptCacheOptions;
  promptCacheKey?: string;
  promptCacheRetention?: PsOpenAiResponsesPromptCacheRetention;
};

const trimOptional = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const normalizePromptCacheOptions = (
  options?: PromptCacheInput
): PsPromptCacheOptions | undefined => {
  const explicitCache = options?.promptCache;
  const legacyKey = trimOptional(options?.promptCacheKey);
  const legacyRetention = options?.promptCacheRetention;

  if (!explicitCache && !legacyKey && !legacyRetention) {
    return undefined;
  }

  const normalized: PsPromptCacheOptions = explicitCache
    ? { ...explicitCache }
    : {};
  const explicitKey = trimOptional(explicitCache?.key);
  const explicitGeminiCachedContentName = trimOptional(
    explicitCache?.geminiCachedContentName
  );

  if (explicitKey) {
    normalized.key = explicitKey;
  } else if (legacyKey) {
    normalized.key = legacyKey;
  } else {
    delete normalized.key;
  }

  if (explicitGeminiCachedContentName) {
    normalized.geminiCachedContentName = explicitGeminiCachedContentName;
  } else {
    delete normalized.geminiCachedContentName;
  }

  if (explicitCache?.retention === undefined && legacyRetention) {
    normalized.retention = legacyRetention;
  }

  return normalized;
};

export const isOpenAiPromptCacheRetention = (
  retention?: PsPromptCacheRetention
): retention is PsOpenAiResponsesPromptCacheRetention =>
  retention === "in_memory" || retention === "24h";

export const buildPromptCacheUsageData = ({
  provider,
  promptCache,
  appliedMode,
  unsupportedReason,
}: {
  provider: PromptCacheProvider;
  promptCache?: PsPromptCacheOptions;
  appliedMode: PromptCacheAppliedMode;
  unsupportedReason?: string;
}): PromptCacheUsageData => ({
  requested: promptCache !== undefined,
  enabled: promptCache?.enabled !== false,
  provider,
  keyPresent: Boolean(promptCache?.key),
  retention: promptCache?.retention ?? null,
  geminiCachedContentNamePresent: Boolean(promptCache?.geminiCachedContentName),
  appliedMode,
  unsupportedReason: unsupportedReason ?? null,
});
