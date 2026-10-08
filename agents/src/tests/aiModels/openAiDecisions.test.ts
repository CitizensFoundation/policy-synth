import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import OpenAI from "openai";
import type { DecisionCreateParams } from "openai/resources/decisions";
import {
  OpenAiDecisions,
  getDecisionCosts,
  getDecisionUsageCounts,
  getDefaultOpenAiDecisionsPrices,
} from "../../aiModels/openAiDecisions.js";

const request: PsDecisionRequest = {
  input: "A proposal to improve public transport.",
  safety_identifier: "test-user",
  questions: [
    { type: "predicate", name: "relevant", instructions: "Is this about transport?" },
    {
      type: "choice", name: "typed", instructions: "Choose the boolean.",
      choices: [{ value: true }, { value: "true" }, { value: false }],
    },
    {
      type: "score", name: "impact", instructions: "Rate its impact.",
      levels: [{ label: "low" }, { label: "high", description: "Large impact" }],
    },
    { type: "predicate", name: "unanswerable", instructions: "Unanswerable question" },
  ],
};

const decision: PsDecisionResult = {
  model: "gpt-6-luna",
  answers: [
    { type: "predicate", name: "relevant", probability: 0.95 },
    {
      type: "choice", name: "typed", choice: true, confidence: 0.9,
      probabilities: [
        { value: true, probability: 0.9 },
        { value: "true", probability: 0.05 },
        { value: false, probability: 0.05 },
      ],
    },
    {
      type: "score", name: "impact", score: 0.8, confidence: 0.9,
      probabilities: [
        { label: "low", value: 0, probability: 0.2 },
        { label: "high", value: 1, probability: 0.8 },
      ],
    },
    { type: "refusal", name: "unanswerable" },
  ],
  usage: {
    input_tokens: 100,
    input_tokens_details: { cached_tokens: 20, cache_write_tokens: 30 },
    output_tokens: 5,
    output_tokens_details: { reasoning_tokens: 3 },
    total_tokens: 105,
  },
};

const envKeys = [
  "OPENAI_API_KEY", "PS_AGENT_OVERRIDE_OPENAI_API_KEY",
  "OPENAI_ENFORCE_EU_REGION", "PS_OPENAI_DECISIONS_MODEL", "PS_MODEL_CALL_TIMEOUT_MS",
] as const;
const originalEnv = new Map(envKeys.map((key) => [key, process.env[key]]));
const originalFetch = globalThis.fetch;

beforeEach(() => {
  for (const key of envKeys) delete process.env[key];
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of originalEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json", "retry-after-ms": "1" },
  });
}

function useFetch(model: OpenAiDecisions, fetch: typeof globalThis.fetch): void {
  Reflect.set(model, "client", new OpenAI({ apiKey: "test-key", fetch }));
}

describe("OpenAiDecisions", () => {
  it("sends SDK-native mixed questions and preserves ordered answers and refusals", async () => {
    let calls = 0;
    const model = new OpenAiDecisions();
    useFetch(model, async (url, init) => {
      calls++;
      assert.equal(String(url), "https://api.openai.com/v1/decisions");
      assert.equal(init?.method, "POST");
      assert.deepEqual(JSON.parse(String(init?.body)), { ...request, model: "gpt-6-luna" });
      return jsonResponse(decision);
    });
    const result = await model.create(request);
    assert.deepEqual(result, decision);
    assert.equal(calls, 1);
    const choice = result.answers[1];
    assert.equal(choice.type, "choice");
    if (choice.type === "choice") {
      assert.equal(choice.choice, true);
      assert.equal(choice.probabilities[1].value, "true");
    }
  });

  it("initializes lazily and applies credential, EU, project, and model precedence", async () => {
    const lazy = new OpenAiDecisions();
    assert.equal(Reflect.get(lazy, "client"), undefined);
    await assert.rejects(lazy.create(request), /requires an OpenAI API key/);
    process.env.OPENAI_API_KEY = "env-key";
    process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY = "override-key";
    process.env.OPENAI_ENFORCE_EU_REGION = "true";
    process.env.PS_OPENAI_DECISIONS_MODEL = "env-model";
    const models: string[] = [];
    globalThis.fetch = async (url, init) => {
      assert.equal(String(url), "https://eu.api.openai.com/v1/decisions");
      const headers = new Headers(init?.headers);
      assert.equal(headers.get("authorization"), "Bearer override-key");
      assert.equal(headers.get("openai-project"), "project-test");
      models.push((JSON.parse(String(init?.body)) as DecisionCreateParams).model);
      return jsonResponse(decision);
    };
    const model = new OpenAiDecisions({
      apiKey: "config-key", modelName: "logical-model",
      apiModelName: "api-model", projectId: "project-test",
    });
    await model.create(request);
    await model.create({ ...request, model: "request-model" });
    assert.deepEqual(models, ["api-model", "request-model"]);
    assert.equal(new OpenAiDecisions().config.modelName, "env-model");
  });

  it("skips empty credentials while preserving nonempty credential precedence", async () => {
    const cases = [
      { override: "", configured: "", expected: "env-key" },
      { override: "", configured: "config-key", expected: "config-key" },
      { override: "override-key", configured: "config-key", expected: "override-key" },
    ];
    let calls = 0;
    for (const { override, configured, expected } of cases) {
      process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY = override;
      const model = new OpenAiDecisions({ apiKey: configured });
      // The environment key can be supplied after an empty stored key is loaded.
      process.env.OPENAI_API_KEY = "env-key";
      globalThis.fetch = async (_url, init) => {
        calls++;
        assert.equal(new Headers(init?.headers).get("authorization"), `Bearer ${expected}`);
        return jsonResponse(decision);
      };
      assert.deepEqual(await model.create(request), decision);
    }
    assert.equal(calls, cases.length);
    process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY = "";
    process.env.OPENAI_API_KEY = "";
    await assert.rejects(new OpenAiDecisions({ apiKey: "" }).create(request), /requires an OpenAI API key/);
    assert.equal(calls, cases.length);
  });

  it("accepts inline images and enforces the 128-image limit across messages", async () => {
    const image = { type: "input_image" as const, image_url: "data:image/png;base64,YQ==" };
    let calls = 0;
    const model = new OpenAiDecisions();
    useFetch(model, async (_url, init) => {
      calls++;
      const body = JSON.parse(String(init?.body)) as DecisionCreateParams;
      assert.equal(Array.isArray(body.input) && body.input.length, 2);
      return jsonResponse(decision);
    });
    const input: DecisionCreateParams["input"] = [
      { role: "user", content: [{ type: "input_text", text: "Inspect" }, ...Array.from({ length: 64 }, () => image)] },
      { role: "user", content: Array.from({ length: 64 }, () => image) },
    ];
    await model.create({ ...request, input });
    await assert.rejects(model.create({ ...request, input: [...input, { role: "user", content: [image] }] }), /at most 128/);
    assert.equal(calls, 1);
  });

  it("rejects unsupported input before creating a client or issuing requests", async () => {
    const invalidInputs: unknown[] = [
      [{ role: "system", content: "Instructions" }],
      [{ role: "assistant", content: "Answer" }],
      [{ type: "item_reference", id: "item" }],
      [{ role: "user", type: "function_call", content: "Unsupported item" }],
      [{ role: "user", content: [{ type: "input_audio", data: "YQ==" }] }],
      [{ role: "user", content: [{ type: "input_file", file_id: "file" }] }],
      [{ role: "user", content: [{ type: "input_image", image_url: "https://example.com/image.png" }] }],
      [{ role: "user", content: [{ type: "input_image", image_url: "file-id" }] }],
    ];
    const model = new OpenAiDecisions();
    for (const input of invalidInputs) {
      await assert.rejects(model.create({ ...request, input } as PsDecisionRequest), TypeError);
    }
    await assert.rejects(model.create({ ...request, questions: [] }), /at least one question/);
    assert.equal(Reflect.get(model, "client"), undefined);
  });

  it("uses SDK retries for transient errors and allows disabling retries", async () => {
    for (const status of [429, 500]) {
      let calls = 0;
      const model = new OpenAiDecisions();
      useFetch(model, async () => ++calls < 3
        ? jsonResponse({ error: { message: "Transient" } }, status)
        : jsonResponse(decision));
      assert.deepEqual(await model.create(request), decision);
      assert.equal(calls, 3);
    }
    let calls = 0;
    const model = new OpenAiDecisions();
    useFetch(model, async () => { calls++; return jsonResponse({ error: { message: "No retry" } }, 429); });
    await assert.rejects(model.create(request, { maxRetries: 0 }), OpenAI.RateLimitError);
    assert.equal(calls, 1);
    calls = 0;
    useFetch(model, async () => { calls++; return jsonResponse({ error: { message: "Bad key" } }, 401); });
    await assert.rejects(model.create(request), OpenAI.AuthenticationError);
    assert.equal(calls, 1);
  });

  it("honors timeout and AbortSignal without retrying user cancellation", async () => {
    let calls = 0;
    let started: (() => void) | undefined;
    const model = new OpenAiDecisions({ timeoutMs: 1_000 });
    useFetch(model, async (_url, init) => {
      calls++;
      started?.();
      return new Promise<Response>((_resolve, reject) => {
        const abort = () => reject(new DOMException("Aborted", "AbortError"));
        if (init?.signal?.aborted) abort();
        else init?.signal?.addEventListener("abort", abort, { once: true });
      });
    });
    await assert.rejects(model.create(request, { timeoutMs: 10, maxRetries: 0 }), OpenAI.APIConnectionTimeoutError);
    assert.equal(calls, 1);
    const controller = new AbortController();
    const hasStarted = new Promise<void>((resolve) => { started = resolve; });
    const pending = model.create(request, { signal: controller.signal });
    const rejection = assert.rejects(pending, OpenAI.APIUserAbortError);
    await hasStarted;
    controller.abort();
    await rejection;
    assert.equal(calls, 2);
  });

  it("preserves raw usage extensions and records normalized counts without evidence", () => {
    const withExtraUsage = { ...decision, usage: { ...decision.usage, compute_units: 7 } };
    const data = new OpenAiDecisions().buildUsageItemData(withExtraUsage, request);
    assert.equal(data.apiFamily, "decisions");
    assert.equal(data.accountingVersion, 2);
    assert.deepEqual(data.usageRaw, withExtraUsage.usage);
    assert.deepEqual(data.usageNormalized, {
      tokensIn: 100, cachedInTokens: 20, cacheWriteInTokens: 30, tokensOut: 5, reasoningTokens: 3,
    });
    assert.equal(data.providerMetadata?.refusalCount, 1);
    assert.equal(data.request?.questionCount, 4);
    assert.equal(JSON.stringify(data).includes(request.input as string), false);
  });
});

describe("Decisions usage pricing", () => {
  it("charges only ordinary input with zero default cached, cache-write, and output charges", () => {
    assert.deepEqual(getDecisionUsageCounts(decision), {
      tokensIn: 100, tokensOut: 5, cachedInTokens: 20, cacheWriteInTokens: 30, reasoningTokens: 3,
    });
    assert.deepEqual(getDecisionCosts(decision, getDefaultOpenAiDecisionsPrices()), {
      tokensInCost: 0.000005, tokensOutCost: 0,
    });
  });

  it("applies long-context prices only above 272K input tokens and uses regional margins", () => {
    const prices = getDefaultOpenAiDecisionsPrices();
    const withTokens = (input_tokens: number): PsDecisionResult => ({
      ...decision,
      usage: { ...decision.usage, input_tokens, input_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 } },
    });
    assert.equal(getDecisionCosts(withTokens(272_000), prices).tokensInCost, 0.0272);
    assert.equal(getDecisionCosts(withTokens(272_001), prices).tokensInCost, 0.0544002);
    assert.ok(Math.abs(getDecisionCosts(withTokens(272_001), prices, "eu").tokensInCost - 0.05984022) < 1e-12);
    assert.equal(prices.costInTokensPerMillion, 0.1);
  });

  it("supports custom input, cache-write, cache-read, output, and currency configuration", () => {
    const model = new OpenAiDecisions({ prices: {
      costInTokensPerMillion: 2, costInCachedContextTokensPerMillion: 1,
      cacheWriteInputCostMultiplier: 1.5, costOutTokensPerMillion: 4, currency: "EUR",
    } });
    assert.deepEqual(getDecisionCosts(decision, model.config.prices), {
      tokensInCost: 0.00021, tokensOutCost: 0.00002,
    });
    assert.equal(model.config.prices.currency, "EUR");
    assert.equal(getDefaultOpenAiDecisionsPrices().currency, "USD");
  });
});
