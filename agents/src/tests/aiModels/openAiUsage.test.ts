import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getOpenAiCacheWriteInTokens } from "../../aiModels/openAiUsage.js";

describe("getOpenAiCacheWriteInTokens", () => {
  it("reads Responses API cache-write tokens", () => {
    assert.equal(
      getOpenAiCacheWriteInTokens({
        input_tokens_details: { cache_write_tokens: 12.9 },
      }),
      12
    );
  });

  it("reads Chat Completions cache-write tokens", () => {
    assert.equal(
      getOpenAiCacheWriteInTokens({
        prompt_tokens_details: { cache_write_tokens: 7 },
      }),
      7
    );
  });

  it("falls back to Chat details when Responses details omit the field", () => {
    assert.equal(
      getOpenAiCacheWriteInTokens({
        input_tokens_details: { cached_tokens: 3 },
        prompt_tokens_details: { cache_write_tokens: 4 },
      }),
      4
    );
  });

  it("normalizes missing, malformed, and negative counts to zero", () => {
    assert.equal(getOpenAiCacheWriteInTokens(undefined), 0);
    assert.equal(getOpenAiCacheWriteInTokens([]), 0);
    assert.equal(
      getOpenAiCacheWriteInTokens({
        input_tokens_details: { cache_write_tokens: "9" },
      }),
      0
    );
    assert.equal(
      getOpenAiCacheWriteInTokens({
        prompt_tokens_details: { cache_write_tokens: -1 },
      }),
      0
    );
  });
});
