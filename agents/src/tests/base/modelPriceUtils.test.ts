import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolvePriceConfigurationForContext } from "../../base/modelPriceUtils.js";

describe("resolvePriceConfigurationForContext", () => {
  it("returns undefined when no price configuration is provided", () => {
    assert.equal(resolvePriceConfigurationForContext(undefined), undefined);
  });

  it("applies OpenAI priority pricing and long-context scaling", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 10,
      costInCachedContextTokensPerMillion: 5,
      costOutTokensPerMillion: 20,
      longContextCostInTokensPerMillion: 15,
      longContextCostInCachedContextTokensPerMillion: 7.5,
      longContextCostOutTokensPerMillion: 30,
      priorityTokensIn: 12,
      priorityTokensCachedIn: 6,
      priorityTokensOut: 24,
      flexPriorityTokensEnabledOnLongContext: true,
      currency: "USD",
    };

    const resolved = resolvePriceConfigurationForContext(prices, {
      provider: "openai",
      inferenceType: "fast",
    });

    assert.ok(resolved);
    assert.notEqual(resolved, prices);
    assert.equal(resolved.costInTokensPerMillion, 12);
    assert.equal(resolved.costInCachedContextTokensPerMillion, 6);
    assert.equal(resolved.costOutTokensPerMillion, 24);
    assert.equal(resolved.longContextCostInTokensPerMillion, 18);
    assert.equal(resolved.longContextCostInCachedContextTokensPerMillion, 9);
    assert.equal(resolved.longContextCostOutTokensPerMillion, 36);
    assert.equal(prices.costInTokensPerMillion, 10);
  });

  it("maps Anthropic priority requests to fast pricing", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 3,
      costInCachedContextTokensPerMillion: 2,
      costOutTokensPerMillion: 5,
      longContextCostInTokensPerMillion: 6,
      longContextCostInCachedContextTokensPerMillion: 4,
      longContextCostOutTokensPerMillion: 10,
      fastTokensIn: 9,
      fastTokensCachedIn: 6,
      fastTokensOut: 15,
      currency: "USD",
    };

    const resolved = resolvePriceConfigurationForContext(prices, {
      provider: "anthropic",
      inferenceType: "priority",
    });

    assert.ok(resolved);
    assert.equal(resolved.costInTokensPerMillion, 9);
    assert.equal(resolved.costInCachedContextTokensPerMillion, 6);
    assert.equal(resolved.costOutTokensPerMillion, 15);
    assert.equal(resolved.longContextCostInTokensPerMillion, 18);
    assert.equal(resolved.longContextCostInCachedContextTokensPerMillion, 12);
    assert.equal(resolved.longContextCostOutTokensPerMillion, 30);
  });

  it("applies EU regional processing margins to resolved rates", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 1,
      costInCachedContextTokensPerMillion: 0.5,
      costOutTokensPerMillion: 2,
      flexTokensIn: 2,
      flexTokensCachedIn: 1,
      flexTokensOut: 4,
      regionalProcessingMargin: 10,
      currency: "USD",
    };

    const resolved = resolvePriceConfigurationForContext(prices, {
      provider: "openai",
      inferenceType: "flex",
      regionalProcessing: "eu",
    });

    assert.ok(resolved);
    assert.equal(resolved.costInTokensPerMillion, 2.2);
    assert.equal(resolved.costInCachedContextTokensPerMillion, 1.1);
    assert.equal(resolved.costOutTokensPerMillion, 4.4);
    assert.equal(resolved.flexTokensIn, 2.2);
    assert.equal(resolved.flexTokensCachedIn, 1.1);
    assert.equal(resolved.flexTokensOut, 4.4);
  });
});
