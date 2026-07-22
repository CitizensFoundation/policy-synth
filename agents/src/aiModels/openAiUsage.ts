const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readTokenCount = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;

export function getOpenAiCacheWriteInTokens(usage: unknown): number {
  if (!isRecord(usage)) {
    return 0;
  }

  const inputDetails = usage.input_tokens_details;
  const promptDetails = usage.prompt_tokens_details;
  const inputCacheWriteTokens = isRecord(inputDetails)
    ? inputDetails.cache_write_tokens
    : undefined;
  const promptCacheWriteTokens = isRecord(promptDetails)
    ? promptDetails.cache_write_tokens
    : undefined;

  return readTokenCount(inputCacheWriteTokens ?? promptCacheWriteTokens);
}
