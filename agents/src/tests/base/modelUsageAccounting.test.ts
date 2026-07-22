import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getCacheWriteInputCostMultiplier,
  getPersistedWebSearchCallCount,
  getWebSearchCost,
  partitionModelInputUsage,
  resolveLongContextPriceRates,
  resolveUsageAccountingVersion,
} from "../../base/modelUsageAccounting.js";

describe("model usage accounting", () => {
  it("defaults unknown accounting versions to v1 and accepts explicit v2", () => {
    assert.equal(resolveUsageAccountingVersion(undefined), 1);
    assert.equal(resolveUsageAccountingVersion(1), 1);
    assert.equal(resolveUsageAccountingVersion("invalid"), 1);
    assert.equal(resolveUsageAccountingVersion(2), 2);
    assert.equal(resolveUsageAccountingVersion("2"), 2);
  });

  it("partitions ordinary, cache-read, and cache-write input without overlap", () => {
    assert.deepEqual(partitionModelInputUsage(100, 20, 30), {
      tokenInCount: 50,
      tokenInCachedContextCount: 20,
      tokenInCacheWriteCount: 30,
      longContextTokenInCount: 0,
      longContextTokenInCachedContextCount: 0,
      longContextTokenInCacheWriteCount: 0,
      longContextApplied: false,
      cacheComponentsExceedTotal: false,
    });
  });

  it("classifies every input bucket as long context from the original total", () => {
    assert.deepEqual(partitionModelInputUsage(100, 20, 30, 100), {
      tokenInCount: 0,
      tokenInCachedContextCount: 0,
      tokenInCacheWriteCount: 0,
      longContextTokenInCount: 50,
      longContextTokenInCachedContextCount: 20,
      longContextTokenInCacheWriteCount: 30,
      longContextApplied: true,
      cacheComponentsExceedTotal: false,
    });
  });

  it("does not create negative ordinary input for invalid provider totals", () => {
    const partition = partitionModelInputUsage(10, 8, 7);

    assert.equal(partition.tokenInCount, 0);
    assert.equal(partition.tokenInCachedContextCount, 8);
    assert.equal(partition.tokenInCacheWriteCount, 7);
    assert.equal(partition.cacheComponentsExceedTotal, true);
  });

  it("uses a configured cache-write multiplier and otherwise defaults to one", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 1,
      costInCachedContextTokensPerMillion: 0.1,
      costOutTokensPerMillion: 2,
      currency: "USD",
    };

    assert.equal(getCacheWriteInputCostMultiplier(prices), 1);
    assert.equal(
      getCacheWriteInputCostMultiplier({
        ...prices,
        cacheWriteInputCostMultiplier: 1.25,
      }),
      1.25
    );
    assert.equal(
      getCacheWriteInputCostMultiplier({
        ...prices,
        cacheWriteInputCostMultiplier: Number.NaN,
      }),
      1
    );
    assert.equal(
      getCacheWriteInputCostMultiplier({
        ...prices,
        cacheWriteInputCostMultiplier: -1,
      }),
      1
    );
  });

  it("falls back missing long-context rates while preserving explicit zeros", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 3,
      costInCachedContextTokensPerMillion: 0.3,
      costOutTokensPerMillion: 15,
      currency: "USD",
    };

    assert.deepEqual(resolveLongContextPriceRates(prices), {
      inputTokensPerMillion: 3,
      cachedInputTokensPerMillion: 0.3,
      outputTokensPerMillion: 15,
    });
    assert.deepEqual(
      resolveLongContextPriceRates({
        ...prices,
        longContextCostInTokensPerMillion: 0,
        longContextCostInCachedContextTokensPerMillion: 0,
        longContextCostOutTokensPerMillion: 0,
      }),
      {
        inputTokensPerMillion: 0,
        cachedInputTokensPerMillion: 0,
        outputTokensPerMillion: 0,
      }
    );
  });

  it("counts persisted web searches and excludes provider-declared non-use", () => {
    assert.equal(
      getPersistedWebSearchCallCount({
        providerMetadata: {
          builtInTools: {
            webSearchCallCount: 3,
            webSearchCalls: [{ status: "completed" }],
          },
        },
      }),
      3
    );
    assert.equal(
      getPersistedWebSearchCallCount({
        providerData: {
          providerMetadata: {
            builtInTools: {
              webSearchCallCount: 2,
            },
          },
        },
      }),
      2
    );
    assert.equal(
      getPersistedWebSearchCallCount({
        providerMetadata: {
          builtInTools: {
            webSearchCallCount: 0,
            webSearchCalls: [{ status: "completed" }],
          },
        },
      }),
      0
    );
    assert.equal(
      getPersistedWebSearchCallCount({
        providerMetadata: {
          builtInTools: {
            webSearchCalls: [
              { status: "completed" },
              { status: "failed" },
              { status: "not_used" },
              "invalid",
            ],
          },
        },
      }),
      2
    );
    assert.equal(
      getPersistedWebSearchCallCount({
        providerMetadata: { responseId: "response-1" },
        providerData: {
          providerMetadata: {
            builtInTools: {
              webSearchCalls: [{ status: "completed" }],
            },
          },
        },
      }),
      1
    );
    assert.equal(getPersistedWebSearchCallCount(undefined), 0);
  });

  it("calculates configured web-search charges safely", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 1,
      costInCachedContextTokensPerMillion: 0.1,
      costOutTokensPerMillion: 2,
      costPerThousandWebSearches: 10,
      currency: "USD",
    };

    assert.equal(getWebSearchCost(3, prices), 0.03);
    assert.equal(
      getWebSearchCost(3, { ...prices, costPerThousandWebSearches: 0 }),
      0
    );
    assert.equal(getWebSearchCost(-1, prices), 0);
    assert.equal(
      getWebSearchCost(1, {
        ...prices,
        costPerThousandWebSearches: Number.NaN,
      }),
      0
    );
  });
});
