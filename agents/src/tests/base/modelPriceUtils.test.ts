import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolvePriceConfigurationForContext } from "../../base/modelPriceUtils.js";

describe("resolvePriceConfigurationForContext", () => {
  it("returns undefined when no price configuration is provided", () => {
    assert.equal(resolvePriceConfigurationForContext(undefined), undefined);
  });

  it("returns a cloned base configuration when no inference context is provided", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 1,
      costInCachedContextTokensPerMillion: 0.25,
      costOutTokensPerMillion: 2,
      regionalProcessingMargin: 50,
      currency: "USD",
    };

    const resolved = resolvePriceConfigurationForContext(prices);

    assert.deepEqual(resolved, prices);
    assert.notEqual(resolved, prices);
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

  it("uses Anthropic fast pricing directly and keeps explicit zero-base long-context rates", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 0,
      costInCachedContextTokensPerMillion: 0,
      costOutTokensPerMillion: 0,
      longContextCostInTokensPerMillion: 11,
      longContextCostInCachedContextTokensPerMillion: 7,
      longContextCostOutTokensPerMillion: 13,
      fastTokensIn: 3,
      fastTokensCachedIn: 2,
      fastTokensOut: 4,
      currency: "USD",
    };

    const resolved = resolvePriceConfigurationForContext(prices, {
      provider: "anthropic",
      inferenceType: "fast",
    });

    assert.ok(resolved);
    assert.equal(resolved.costInTokensPerMillion, 3);
    assert.equal(resolved.costInCachedContextTokensPerMillion, 2);
    assert.equal(resolved.costOutTokensPerMillion, 4);
    assert.equal(resolved.longContextCostInTokensPerMillion, 11);
    assert.equal(resolved.longContextCostInCachedContextTokensPerMillion, 7);
    assert.equal(resolved.longContextCostOutTokensPerMillion, 13);
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

  it("uses OpenAI responses flex pricing with fallbacks and direct long-context rates", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 10,
      costInCachedContextTokensPerMillion: 0,
      costOutTokensPerMillion: 20,
      longContextCostOutTokensPerMillion: 60,
      flexTokensIn: 8,
      flexPriorityTokensEnabledOnLongContext: true,
      currency: "USD",
    };

    const resolved = resolvePriceConfigurationForContext(prices, {
      provider: "openAiResponses",
      inferenceType: "flex",
    });

    assert.ok(resolved);
    assert.equal(resolved.costInTokensPerMillion, 8);
    assert.equal(resolved.costInCachedContextTokensPerMillion, 0);
    assert.equal(resolved.costOutTokensPerMillion, 20);
    assert.equal(resolved.longContextCostInTokensPerMillion, 8);
    assert.equal(resolved.longContextCostInCachedContextTokensPerMillion, 0);
    assert.equal(resolved.longContextCostOutTokensPerMillion, 60);
  });

  it("ignores unsupported provider inference types and invalid regional margins", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 1,
      costInCachedContextTokensPerMillion: 0.5,
      costOutTokensPerMillion: 2,
      regionalProcessingMargin: Number.NaN,
      currency: "USD",
    };

    const resolved = resolvePriceConfigurationForContext(prices, {
      provider: "openai",
      inferenceType: "turbo" as PsInferenceType,
      regionalProcessing: "eu",
    });

    assert.deepEqual(resolved, prices);
    assert.notEqual(resolved, prices);
  });

  it("ignores regional margins outside EU processing", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 1,
      costInCachedContextTokensPerMillion: 0.5,
      costOutTokensPerMillion: 2,
      priorityTokensIn: 3,
      priorityTokensCachedIn: 1.5,
      priorityTokensOut: 6,
      regionalProcessingMargin: 25,
      currency: "USD",
    };

    const resolved = resolvePriceConfigurationForContext(prices, {
      provider: "openai",
      inferenceType: "priority",
      regionalProcessing: "us" as PsOpenAiRegionalProcessing,
    });

    assert.ok(resolved);
    assert.equal(resolved.costInTokensPerMillion, 3);
    assert.equal(resolved.costInCachedContextTokensPerMillion, 1.5);
    assert.equal(resolved.costOutTokensPerMillion, 6);
    assert.equal(resolved.priorityTokensIn, 3);
    assert.equal(resolved.priorityTokensCachedIn, 1.5);
    assert.equal(resolved.priorityTokensOut, 6);
  });

  it("ignores non-numeric regional margins", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 1,
      costInCachedContextTokensPerMillion: 0.5,
      costOutTokensPerMillion: 2,
      flexTokensIn: 2,
      flexTokensCachedIn: 1,
      flexTokensOut: 4,
      regionalProcessingMargin: "10" as unknown as number,
      currency: "USD",
    };

    const resolved = resolvePriceConfigurationForContext(prices, {
      provider: "openai",
      inferenceType: "flex",
      regionalProcessing: "eu",
    });

    assert.ok(resolved);
    assert.equal(resolved.costInTokensPerMillion, 2);
    assert.equal(resolved.costInCachedContextTokensPerMillion, 1);
    assert.equal(resolved.costOutTokensPerMillion, 4);
    assert.equal(resolved.flexTokensIn, 2);
    assert.equal(resolved.flexTokensCachedIn, 1);
    assert.equal(resolved.flexTokensOut, 4);
  });

  it("passes through non-OpenAI and non-Anthropic fast pricing", () => {
    const prices: PsBaseModelPriceConfiguration = {
      costInTokensPerMillion: 1,
      costInCachedContextTokensPerMillion: 0.5,
      costOutTokensPerMillion: 2,
      fastTokensIn: 3,
      fastTokensCachedIn: 1.5,
      fastTokensOut: 6,
      currency: "USD",
    };

    const resolved = resolvePriceConfigurationForContext(prices, {
      provider: "custom",
      inferenceType: "fast",
    });

    assert.ok(resolved);
    assert.equal(resolved.costInTokensPerMillion, 3);
    assert.equal(resolved.costInCachedContextTokensPerMillion, 1.5);
    assert.equal(resolved.costOutTokensPerMillion, 6);
    assert.equal(resolved.longContextCostInTokensPerMillion, 3);
    assert.equal(resolved.longContextCostInCachedContextTokensPerMillion, 1.5);
    assert.equal(resolved.longContextCostOutTokensPerMillion, 6);
  });
});
