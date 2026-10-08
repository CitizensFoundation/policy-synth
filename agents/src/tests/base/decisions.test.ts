import assert from "node:assert/strict";
import { after, afterEach, beforeEach, describe, it } from "node:test";
import type { DecisionCreateParams } from "openai/resources/decisions";
import { PsAiModelProvider, PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";
import { OpenAiDecisions, getDefaultOpenAiDecisionsPrices } from "../../aiModels/openAiDecisions.js";
import { PsAiModelManager, PsModelUsagePersistenceError } from "../../base/agentModelManager.js";
import { PolicySynthSimpleAgentBase, simpleAgentRedis } from "../../base/simpleAgent.js";

const envKeys = [
  "AI_MODEL_API_KEY", "AI_MODEL_NAME", "AI_MODEL_PROVIDER", "AI_MODEL_TYPE", "AI_MODEL_SIZE",
  "PS_AI_MODEL_TYPE", "PS_AI_MODEL_PROVIDER", "PS_AI_MODEL_NAME",
  "PS_OPENAI_DECISIONS_MODEL", "OPENAI_API_KEY", "PS_AGENT_OVERRIDE_OPENAI_API_KEY",
  "OPENAI_ENFORCE_EU_REGION", "DISABLE_DB_INIT", "DISABLE_DB_USAGE_TRACKING",
  "PS_MODEL_IN_COST_USD", "PS_MODEL_OUT_COST_USD",
] as const;
const originalEnv = new Map(envKeys.map((key) => [key, process.env[key]]));
const originalFetch = globalThis.fetch;
const originalCreate = OpenAiDecisions.prototype.create;

process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DISABLE_DB_INIT = "true";
const { PolicySynthAgent } = await import("../../base/agent.js");
const { default: sharedRedisClient } = await import("../../base/redisClient.js");

beforeEach(() => {
  for (const key of envKeys) delete process.env[key];
  process.env.DISABLE_DB_INIT = "true";
});
afterEach(() => {
  OpenAiDecisions.prototype.create = originalCreate;
  globalThis.fetch = originalFetch;
  for (const [key, value] of originalEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
after(() => {
  simpleAgentRedis.disconnect();
  sharedRedisClient.disconnect();
});

const request: PsDecisionRequest = {
  input: "Transport proposal",
  questions: [{ type: "predicate", name: "relevant", instructions: "Is it relevant?" }],
};
const decision: PsDecisionResult = {
  model: "gpt-6-luna",
  answers: [{ type: "refusal", name: "relevant" }],
  usage: {
    input_tokens: 100,
    input_tokens_details: { cached_tokens: 20, cache_write_tokens: 30 },
    output_tokens: 5,
    output_tokens_details: { reasoning_tokens: 3 },
    total_tokens: 105,
  },
};

function aiModel(id = 21, overrides: Partial<PsAiModelConfiguration> = {}): PsAiModelAttributes {
  return {
    id, uuid: `model-${id}`, name: "Decisions", organization_id: 1, user_id: 7,
    created_at: new Date(), updated_at: new Date(),
    configuration: {
      type: PsAiModelType.Decision, modelSize: PsAiModelSize.Small,
      model: "gpt-6-luna", provider: PsAiModelProvider.OpenAI, active: true,
      accountingVersion: 2, prices: getDefaultOpenAiDecisionsPrices(),
      maxTokensOut: 0, defaultTemperature: 0, ...overrides,
    },
  };
}

function manager(models: PsAiModelAttributes[] = [], apiKey = "group-openai-key") {
  return new PsAiModelManager(
    models, models.map((model) => ({ aiModelId: model.id, apiKey })),
    256, 0.4, "medium", 0, 42, 7
  );
}

function recordUsage(modelManager: PsAiModelManager): PsModelUsageItemSaveContext[] {
  const saved: PsModelUsageItemSaveContext[] = [];
  Reflect.set(modelManager, "saveModelUsage", async (usage: PsModelUsageItemSaveContext) => { saved.push(usage); });
  return saved;
}

describe("database agent Decisions integration", () => {
  it("keeps Decisions separate from chat and saves raw and normalized usage once after SDK retries", async () => {
    const chatModel = aiModel(22, { type: PsAiModelType.Text, prices: {
      ...getDefaultOpenAiDecisionsPrices(), costInTokensPerMillion: 100,
    } });
    const modelManager = manager([aiModel(), chatModel]);
    assert.equal(modelManager.models.size, 1);
    assert.equal(modelManager.modelsByType.has(PsAiModelType.Decision), false);
    const saved = recordUsage(modelManager);
    delete process.env.DISABLE_DB_INIT;
    let calls = 0;
    globalThis.fetch = async (url, init) => {
      assert.equal(String(url), "https://api.openai.com/v1/decisions");
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer group-openai-key");
      calls++;
      return new Response(JSON.stringify(calls === 1 ? { error: { message: "Try again" } } : decision), {
        status: calls === 1 ? 429 : 200,
        headers: { "content-type": "application/json", "retry-after-ms": "1" },
      });
    };
    assert.deepEqual(await modelManager.callDecisions(request), decision);
    assert.equal(calls, 2);
    assert.equal(saved.length, 1);
    const usage = saved[0];
    assert.equal(usage.modelId, 21);
    assert.equal(usage.modelType, PsAiModelType.Decision);
    assert.equal(usage.accountingVersion, 2);
    assert.equal(usage.streaming, false);
    assert.equal(usage.prices.costInTokensPerMillion, 0.1);
    assert.equal(usage.tokensIn, 100);
    assert.equal(usage.cachedInTokens, 20);
    assert.equal(usage.cacheWriteInTokens, 30);
    assert.equal(usage.reasoningTokens, 3);
    assert.equal(usage.usageItemData?.apiFamily, "decisions");
    assert.deepEqual(usage.usageItemData?.usageRaw, decision.usage);
  });

  it("resolves a registered logical model alias and applies dedicated settings without mutating chat", async () => {
    const modelManager = manager([aiModel(21, {
      model: "decisions-local", apiModel: "gpt-6-luna", regionalProcessing: "eu",
    })]);
    const saved = recordUsage(modelManager);
    modelManager.configureDecisions({ modelName: "decisions-local", timeoutMs: 123, prices: { currency: "EUR" } });
    let config: PsOpenAiDecisionsConfig | undefined;
    let options: PsDecisionCallOptions | undefined;
    OpenAiDecisions.prototype.create = async function (_request, callOptions) {
      config = this.config;
      options = callOptions;
      return decision;
    };
    delete process.env.DISABLE_DB_INIT;
    const controller = new AbortController();
    await modelManager.callDecisions(request, { timeoutMs: 456, maxRetries: 0, signal: controller.signal });
    assert.equal(config?.modelName, "decisions-local");
    assert.equal(config?.apiModelName, "gpt-6-luna");
    assert.equal(config?.timeoutMs, 123);
    assert.equal(config?.regionalProcessing, "eu");
    assert.equal(options?.timeoutMs, 456);
    assert.equal(options?.maxRetries, 0);
    assert.equal(options?.signal, controller.signal);
    assert.equal(saved[0].prices.currency, "EUR");
    assert.equal(saved[0].modelName, "decisions-local");
    assert.equal(saved[0].regionalProcessing, "eu");
    assert.equal(modelManager.models.size, 0);
    await modelManager.callDecisions({ ...request, model: "gpt-6-luna" });
    assert.equal(saved[1].modelId, 21);
  });

  it("falls back from empty stored and configured keys to the next nonempty credential", async () => {
    for (const storedKey of ["", "group-openai-key"]) {
      const modelManager = manager([aiModel()], storedKey);
      modelManager.configureDecisions({ apiKey: "" });
      const saved = recordUsage(modelManager);
      // Seeded models can have empty access keys before the environment key is set.
      process.env.OPENAI_API_KEY = "env-openai-key";
      delete process.env.DISABLE_DB_INIT;
      let calls = 0;
      globalThis.fetch = async (_url, init) => {
        calls++;
        assert.equal(
          new Headers(init?.headers).get("authorization"),
          `Bearer ${storedKey || "env-openai-key"}`
        );
        return new Response(JSON.stringify(decision), {
          headers: { "content-type": "application/json" },
        });
      };
      assert.deepEqual(await modelManager.callDecisions(request), decision);
      assert.equal(calls, 1);
      assert.equal(saved.length, 1);
      assert.equal(saved[0].modelId, 21);
    }
  });

  it("routes implicit and explicit default API aliases to the same configured deployment", async () => {
    const modelManager = manager([
      aiModel(21, { model: "decisions-local", apiModel: "gpt-6-luna" }),
      aiModel(22, { model: "other-local", apiModel: "other-api-model" }),
    ]);
    modelManager.configureDecisions({
      modelName: "gpt-6-luna", apiModelName: "custom-deployment",
    });
    const saved = recordUsage(modelManager);
    delete process.env.DISABLE_DB_INIT;
    const sentModels: string[] = [];
    globalThis.fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as DecisionCreateParams;
      sentModels.push(body.model);
      return new Response(JSON.stringify({ ...decision, model: body.model }), {
        headers: { "content-type": "application/json" },
      });
    };
    const explicitRequest = { ...request, model: "gpt-6-luna" };
    assert.equal((await modelManager.callDecisions(request)).model, "custom-deployment");
    assert.equal((await modelManager.callDecisions(explicitRequest)).model, "custom-deployment");
    await modelManager.callDecisions({ ...request, model: "other-api-model" });
    assert.deepEqual(sentModels, ["custom-deployment", "custom-deployment", "other-api-model"]);
    assert.deepEqual(saved.map((usage) => usage.modelId), [21, 21, 22]);
    assert.deepEqual(saved.map((usage) => usage.modelName), ["decisions-local", "decisions-local", "other-local"]);
    assert.equal(saved[1].usageItemData?.request?.apiModelName, "custom-deployment");
    assert.equal(explicitRequest.model, "gpt-6-luna");
  });

  it("checks persisted Decisions identity before any paid call", async () => {
    let calls = 0;
    OpenAiDecisions.prototype.create = async () => { calls++; return decision; };
    const unregistered = manager();
    const invalidId = manager([aiModel(-1)]);
    delete process.env.DISABLE_DB_INIT;
    await assert.rejects(unregistered.callDecisions(request), PsModelUsagePersistenceError);
    await assert.rejects(invalidId.callDecisions(request), PsModelUsagePersistenceError);
    assert.equal(calls, 0);
  });

  it("preserves default Decisions prices for both logical and API aliases", async () => {
    for (const defaultName of ["decisions-local", "gpt-6-luna"]) {
      const modelManager = manager([
        aiModel(21, { model: "decisions-local", apiModel: "gpt-6-luna" }),
        aiModel(22, {
          model: "other-local", apiModel: "other-api-model",
          prices: { ...getDefaultOpenAiDecisionsPrices(), costInTokensPerMillion: 7 },
        }),
      ]);
      modelManager.configureDecisions({
        modelName: defaultName,
        apiModelName: "custom-deployment",
        prices: { costInTokensPerMillion: 2 },
      });
      const saved = recordUsage(modelManager);
      const sentModels: string[] = [];
      globalThis.fetch = async (_url, init) => {
        const body = JSON.parse(String(init?.body)) as DecisionCreateParams;
        sentModels.push(body.model);
        return new Response(JSON.stringify({ ...decision, model: body.model }), {
          headers: { "content-type": "application/json" },
        });
      };
      for (const model of [undefined, "decisions-local", "gpt-6-luna", "other-api-model"]) {
        await modelManager.callDecisions({ ...request, model });
      }
      assert.deepEqual(saved.map((usage) => usage.prices.costInTokensPerMillion), [2, 2, 2, 7]);
      assert.deepEqual(saved.map((usage) => usage.modelId), [21, 21, 21, 22]);
      assert.deepEqual(sentModels, [
        "custom-deployment", "custom-deployment", "custom-deployment", "other-api-model",
      ]);
    }
  });

  it("returns attached Decisions prices without initializing an environment or chat model", async () => {
    const attached = aiModel(21, {
      model: "decisions-local", apiModel: "gpt-6-luna",
      prices: { ...getDefaultOpenAiDecisionsPrices(), costInTokensPerMillion: 2 },
    });
    const modelManager = manager([attached]);
    assert.deepEqual(await modelManager.getModelPriceConfiguration(
      PsAiModelType.Decision, PsAiModelSize.Small, {}
    ), attached.configuration.prices);
    assert.equal(modelManager.models.size, 0);
    assert.equal(modelManager.modelsByType.size, 0);
  });

  it("resolves Decisions prices by default identity and size fallback while honoring overrides", async () => {
    const modelManager = manager([
      aiModel(21, {
        model: "decisions-medium", apiModel: "api-medium", modelSize: PsAiModelSize.Medium,
        prices: { ...getDefaultOpenAiDecisionsPrices(), costInTokensPerMillion: 4 },
      }),
      aiModel(22, {
        model: "decisions-large", apiModel: "api-large", modelSize: PsAiModelSize.Large,
        prices: { ...getDefaultOpenAiDecisionsPrices(), costInTokensPerMillion: 9 },
      }),
    ]);
    const getPrices = (options: PsCallModelOptions = {}) => modelManager.getModelPriceConfiguration(
      PsAiModelType.Decision, PsAiModelSize.Small, options
    );
    assert.equal((await getPrices())?.costInTokensPerMillion, 4);
    process.env.PS_OPENAI_DECISIONS_MODEL = "api-large";
    assert.equal((await getPrices())?.costInTokensPerMillion, 9);
    modelManager.configureDecisions({
      modelName: "decisions-medium", prices: { costInTokensPerMillion: 2 },
    });
    assert.equal((await getPrices())?.costInTokensPerMillion, 2);
    assert.equal((await getPrices({
      modelProvider: PsAiModelProvider.OpenAI, modelName: "api-medium",
    }))?.costInTokensPerMillion, 2);
    assert.equal((await getPrices({
      fallbackModelProvider: PsAiModelProvider.OpenAI, fallbackModelName: "api-large",
    }))?.costInTokensPerMillion, 9);
    const overridden = await getPrices({ priceOverride: { costInTokensPerMillion: 3 } });
    assert.equal(overridden?.costInTokensPerMillion, 3);
    overridden!.costInTokensPerMillion = 100;
    assert.equal((await getPrices())?.costInTokensPerMillion, 2);
    assert.equal(modelManager.models.size, 0);
    assert.equal(modelManager.modelsByType.size, 0);
  });

  it("uses dedicated Decisions prices when only chat models are attached", async () => {
    const modelManager = manager([aiModel(21, {
      type: PsAiModelType.Text,
      prices: { ...getDefaultOpenAiDecisionsPrices(), costInTokensPerMillion: 100 },
    })]);
    modelManager.configureDecisions({ prices: { costInTokensPerMillion: 2 } });
    const chatModels = [...modelManager.models.values()];
    const prices = await modelManager.getModelPriceConfiguration(
      PsAiModelType.Decision, PsAiModelSize.Small, {}
    );
    assert.equal(prices?.costInTokensPerMillion, 2);
    assert.deepEqual([...modelManager.models.values()], chatModels);
    assert.equal(modelManager.modelsByType.has(PsAiModelType.Decision), false);
  });

  it("does not repeat a successful request when usage persistence fails", async () => {
    const modelManager = manager([aiModel()]);
    let calls = 0;
    OpenAiDecisions.prototype.create = async () => { calls++; return decision; };
    const error = new PsModelUsagePersistenceError("Storage failed");
    Reflect.set(modelManager, "saveModelUsage", async () => { throw error; });
    await assert.rejects(modelManager.callDecisions(request), (caught: unknown) => caught === error);
    assert.equal(calls, 1);
  });

  it("supports a Decisions-only environment without initializing a chat client", async () => {
    process.env.PS_AI_MODEL_TYPE = "decision";
    process.env.PS_AI_MODEL_PROVIDER = "openai";
    process.env.PS_AI_MODEL_NAME = "gpt-6-luna";
    const modelManager = manager();
    assert.equal(modelManager.models.size, 0);
    recordUsage(modelManager);
    OpenAiDecisions.prototype.create = async () => decision;
    assert.equal(await modelManager.callDecisions(request), decision);
  });

  it("exposes the typed methods through PolicySynthAgent", async () => {
    const modelManager = manager();
    recordUsage(modelManager);
    OpenAiDecisions.prototype.create = async function () {
      assert.equal(this.config.modelName, "configured-model");
      return decision;
    };
    const agent = Object.create(PolicySynthAgent.prototype) as InstanceType<typeof PolicySynthAgent>;
    agent.modelManager = modelManager;
    agent.configureDecisions({ modelName: "configured-model" });
    assert.equal(await agent.callDecisions(request), decision);
    agent.modelManager = undefined;
    assert.throws(() => agent.configureDecisions({}), /not initialized/);
    await assert.rejects(agent.callDecisions(request), /not initialized/);
  });
});

describe("simple agent Decisions integration", () => {
  it("uses the OpenAI simple-agent key when configuration and environment keys are empty", async () => {
    process.env.AI_MODEL_PROVIDER = "openai";
    process.env.AI_MODEL_API_KEY = "simple-openai-key";
    process.env.OPENAI_API_KEY = "";
    const agent = new PolicySynthSimpleAgentBase();
    agent.configureDecisions({ apiKey: "" });
    let calls = 0;
    globalThis.fetch = async (_url, init) => {
      calls++;
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer simple-openai-key");
      return new Response(JSON.stringify(decision), {
        headers: { "content-type": "application/json" },
      });
    };
    assert.deepEqual(await agent.callDecisions(request), decision);
    assert.equal(calls, 1);
  });

  it("uses Decisions prices and accumulates usage into the default or selected memory stage once", async () => {
    process.env.PS_MODEL_IN_COST_USD = "99";
    process.env.PS_MODEL_OUT_COST_USD = "99";
    const memory: PsSimpleAgentMemoryData = { agentId: 1, groupId: 2 };
    const agent = new PolicySynthSimpleAgentBase(memory);
    let saves = 0;
    agent.saveMemory = async () => { saves++; };
    OpenAiDecisions.prototype.create = async () => decision;
    assert.equal(await agent.callDecisions(request), decision);
    await agent.callDecisions(request, { stage: "classification" });
    assert.equal(saves, 2);
    assert.deepEqual(memory.stages?.decisions, {
      tokensIn: 100, tokensOut: 5, tokensInCost: 0.000005, tokensOutCost: 0,
    });
    assert.deepEqual(memory.stages?.classification, memory.stages?.decisions);
    assert.equal(memory.totalCost, 0.00001);
    assert.equal(agent.models.size, 0);
  });

  it("resolves request, config, and env models and uses only OpenAI-compatible credentials", async () => {
    process.env.AI_MODEL_PROVIDER = "anthropic";
    process.env.AI_MODEL_API_KEY = "anthropic-key";
    process.env.PS_OPENAI_DECISIONS_MODEL = "env-model";
    const agent = new PolicySynthSimpleAgentBase();
    const configs: PsOpenAiDecisionsConfig[] = [];
    OpenAiDecisions.prototype.create = async function () { configs.push(this.config); return decision; };
    await agent.callDecisions(request);
    assert.equal(configs[0].modelName, "env-model");
    assert.equal(configs[0].apiKey, undefined);
    process.env.AI_MODEL_PROVIDER = "openai";
    process.env.AI_MODEL_API_KEY = "simple-openai-key";
    await agent.callDecisions(request);
    assert.equal(configs[1].apiKey, "simple-openai-key");
    agent.configureDecisions({ apiKey: "configured-key", modelName: "configured-model", prices: { costInTokensPerMillion: 3 } });
    await agent.callDecisions(request);
    await agent.callDecisions({ ...request, model: "request-model" });
    assert.equal(configs[2].modelName, "configured-model");
    assert.equal(configs[2].prices?.costInTokensPerMillion, 3);
    assert.equal(configs[3].modelName, "request-model");
    assert.equal(configs[3].prices?.costInTokensPerMillion, 0.1);
    assert.equal(configs[3].apiKey, "configured-key");
  });

  it("does not retry a successful request on memory save failure or record failed API usage", async () => {
    const memory: PsSimpleAgentMemoryData = { agentId: 1, groupId: 2 };
    const agent = new PolicySynthSimpleAgentBase(memory);
    let calls = 0;
    OpenAiDecisions.prototype.create = async () => { calls++; return decision; };
    agent.saveMemory = async () => { throw new Error("Memory failed"); };
    await assert.rejects(agent.callDecisions(request), /Memory failed/);
    assert.equal(calls, 1);
    assert.equal(memory.totalCost, 0.000005);
    OpenAiDecisions.prototype.create = async () => { throw new Error("API failed"); };
    await assert.rejects(agent.callDecisions(request), /API failed/);
    assert.equal(memory.totalCost, 0.000005);
  });

  it("initializes a Decisions-only environment and rejects other providers for that type", () => {
    process.env.AI_MODEL_TYPE = "decision";
    process.env.AI_MODEL_PROVIDER = "openai";
    const agent = new PolicySynthSimpleAgentBase();
    assert.equal(agent.models.size, 0);
    process.env.AI_MODEL_PROVIDER = "azure";
    assert.throws(() => new PolicySynthSimpleAgentBase(), /require the OpenAI provider/);
  });
});
