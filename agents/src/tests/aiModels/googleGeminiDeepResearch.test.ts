import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";

process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DB_PORT ??= "5432";

const { GoogleGeminiDeepResearch } = await import(
  "../../aiModels/googleGeminiDeepResearch.js"
);

type RecordedDeepResearchRequest = {
  agent?: string;
  agent_config?: PsGeminiDeepResearchConfig;
  input?: string;
  background?: boolean;
  store?: boolean;
  system_instruction?: string;
  previous_interaction_id?: string;
};

type MockInteraction = {
  id: string;
  status: string;
  output_text?: string;
  previous_interaction_id?: string;
  usage?: Record<string, number>;
  steps?: Array<{
    type?: string;
    content?: unknown;
  }>;
};

type MockInteractions = {
  create: (
    params: RecordedDeepResearchRequest,
    options?: Record<string, unknown>
  ) => Promise<MockInteraction>;
  get: (
    id: string,
    params?: null,
    options?: Record<string, unknown>
  ) => Promise<MockInteraction>;
  cancel: (
    id: string,
    params?: null,
    options?: Record<string, unknown>
  ) => Promise<MockInteraction>;
};

const originalVertexFlag = process.env.USE_GOOGLE_VERTEX_AI;
const originalVertexAllowlist = process.env.USE_GOOGLE_VERTEX_AI_FOR_MODELS;

afterEach(() => {
  if (originalVertexFlag === undefined) {
    delete process.env.USE_GOOGLE_VERTEX_AI;
  } else {
    process.env.USE_GOOGLE_VERTEX_AI = originalVertexFlag;
  }

  if (originalVertexAllowlist === undefined) {
    delete process.env.USE_GOOGLE_VERTEX_AI_FOR_MODELS;
  } else {
    process.env.USE_GOOGLE_VERTEX_AI_FOR_MODELS = originalVertexAllowlist;
  }
});

const createConfig = (
  overrides: Partial<PsAiModelConfig> = {}
): PsAiModelConfig => ({
  apiKey: "gemini-deep-research-test-key",
  modelName: "deep-research-preview-04-2026",
  modelType: PsAiModelType.TextReasoning,
  modelSize: PsAiModelSize.Large,
  maxTokensOut: 4096,
  prices: {
    costInTokensPerMillion: 1,
    costInCachedContextTokensPerMillion: 0.5,
    costOutTokensPerMillion: 2,
    currency: "USD",
  },
  ...overrides,
});

const setMockInteractions = (
  model: object,
  interactions: MockInteractions,
  pollDelayMs = 0
) => {
  Reflect.set(model, "ai", { interactions });
  Reflect.set(model, "pollDelayMs", pollDelayMs);
};

const createInteraction = (
  overrides: Partial<MockInteraction> = {}
): MockInteraction => ({
  id: "interaction-1",
  status: "completed",
  output_text: "research report",
  usage: {
    total_input_tokens: 10,
    total_tool_use_tokens: 2,
    total_output_tokens: 20,
    total_cached_tokens: 3,
    total_thought_tokens: 4,
  },
  ...overrides,
});

const generate = (
  model: InstanceType<typeof GoogleGeminiDeepResearch>,
  messages: PsModelMessage[],
  requestOptions?: PsModelRequestOptions
) =>
  model.generate(
    messages,
    false,
    undefined,
    undefined,
    undefined,
    "auto",
    undefined,
    requestOptions
  );

describe("GoogleGeminiDeepResearch", () => {
  it("polls a background interaction to completion and records usage", async () => {
    const model = new GoogleGeminiDeepResearch(createConfig());
    const capturedCreates: RecordedDeepResearchRequest[] = [];
    const getIds: string[] = [];
    setMockInteractions(model, {
      create: async (params) => {
        capturedCreates.push(params);
        return createInteraction({
          id: "interaction-happy",
          status: "in_progress",
        });
      },
      get: async (id) => {
        getIds.push(id);
        return createInteraction({
          id,
          status: "completed",
          output_text: "final research report",
        });
      },
      cancel: async (id) => createInteraction({ id, status: "cancelled" }),
    });

    const chunks: string[] = [];
    const result = await model.generate(
      [
        { role: "system", message: "system prompt" },
        { role: "developer", message: "developer prompt" },
        { role: "user", message: "research question" },
        { role: "assistant", message: "prior context" },
      ],
      true,
      (chunk) => chunks.push(chunk),
      undefined,
      undefined,
      "auto",
      undefined,
      { timeoutMs: 60_000 }
    );

    assert.equal(result.content, "final research report");
    assert.deepEqual(chunks, ["final research report"]);
    assert.equal(result.tokensIn, 12);
    assert.equal(result.tokensOut, 20);
    assert.equal(result.cachedInTokens, 3);
    assert.equal(result.reasoningTokens, 4);
    assert.deepEqual(result.toolCalls, []);
    assert.deepEqual(getIds, ["interaction-happy"]);
    assert.deepEqual(capturedCreates[0], {
      agent: "deep-research-preview-04-2026",
      agent_config: { type: "deep-research" },
      input: "user: research question\n\nassistant: prior context",
      background: true,
      store: true,
      system_instruction: "system prompt\n\ndeveloper prompt",
    });
    assert.equal(result.usageItemData?.apiFamily, "interactions");
    assert.equal(
      result.usageItemData?.providerMetadata?.interactionId,
      "interaction-happy"
    );
    assert.equal(result.usageItemData?.request?.background, true);
    assert.equal(result.usageItemData?.request?.store, true);
  });

  it("rejects terminal failed interactions without cancelling", async () => {
    const model = new GoogleGeminiDeepResearch(createConfig());
    let cancelCalled = false;
    setMockInteractions(model, {
      create: async () =>
        createInteraction({
          id: "interaction-failed",
          status: "failed",
          output_text: "failure details",
        }),
      get: async (id) => createInteraction({ id }),
      cancel: async (id) => {
        cancelCalled = true;
        return createInteraction({ id, status: "cancelled" });
      },
    });

    await assert.rejects(
      () => generate(model, [{ role: "user", message: "research" }]),
      /finished with status failed: failure details/
    );
    assert.equal(cancelCalled, false);
  });

  it("treats requires_action as terminal when collaborative planning is disabled", async () => {
    const model = new GoogleGeminiDeepResearch(createConfig());
    let getCalled = false;
    let cancelCalled = false;
    setMockInteractions(model, {
      create: async () =>
        createInteraction({
          id: "interaction-plan",
          status: "requires_action",
          output_text: "manual plan approval required",
        }),
      get: async (id) => {
        getCalled = true;
        return createInteraction({ id });
      },
      cancel: async (id) => {
        cancelCalled = true;
        return createInteraction({ id, status: "cancelled" });
      },
    });

    await assert.rejects(
      () => generate(model, [{ role: "user", message: "research" }]),
      /requires action: manual plan approval required/
    );
    assert.equal(getCalled, false);
    assert.equal(cancelCalled, false);
  });

  it("cancels a running interaction before surfacing local timeout", async () => {
    const model = new GoogleGeminiDeepResearch(createConfig());
    const cancelledIds: string[] = [];
    setMockInteractions(
      model,
      {
        create: async () =>
          createInteraction({
            id: "interaction-timeout",
            status: "in_progress",
          }),
        get: async (id) => createInteraction({ id, status: "in_progress" }),
        cancel: async (id) => {
          cancelledIds.push(id);
          return createInteraction({ id, status: "cancelled" });
        },
      },
      1
    );

    await assert.rejects(
      () =>
        generate(model, [{ role: "user", message: "research" }], {
          timeoutMs: 5,
        }),
      /timed out/
    );
    assert.deepEqual(cancelledIds, ["interaction-timeout"]);
  });

  it("tolerates two retrieve failures but cancels after the third", async () => {
    const recoveredModel = new GoogleGeminiDeepResearch(createConfig());
    let recoveredAttempts = 0;
    setMockInteractions(recoveredModel, {
      create: async () =>
        createInteraction({
          id: "interaction-recovered",
          status: "in_progress",
        }),
      get: async (id) => {
        recoveredAttempts += 1;
        if (recoveredAttempts <= 2) {
          throw new Error("temporary retrieve failure");
        }
        return createInteraction({ id, status: "completed" });
      },
      cancel: async (id) => createInteraction({ id, status: "cancelled" }),
    });

    const recovered = await generate(recoveredModel, [
      { role: "user", message: "research" },
    ]);
    assert.equal(recovered.content, "research report");
    assert.equal(recoveredAttempts, 3);

    const failedModel = new GoogleGeminiDeepResearch(createConfig());
    const cancelledIds: string[] = [];
    setMockInteractions(failedModel, {
      create: async () =>
        createInteraction({
          id: "interaction-retrieve-fail",
          status: "in_progress",
        }),
      get: async () => {
        throw new Error("permanent retrieve failure");
      },
      cancel: async (id) => {
        cancelledIds.push(id);
        return createInteraction({ id, status: "cancelled" });
      },
    });

    await assert.rejects(
      () => generate(failedModel, [{ role: "user", message: "research" }]),
      /permanent retrieve failure/
    );
    assert.deepEqual(cancelledIds, ["interaction-retrieve-fail"]);
  });

  it("rejects Vertex transport for Deep Research models", () => {
    process.env.USE_GOOGLE_VERTEX_AI = "true";

    assert.throws(
      () => new GoogleGeminiDeepResearch(createConfig()),
      /requires the Gemini Developer API/
    );
  });

  it("continues keyed follow-up research with previous_interaction_id and only new user input", async () => {
    const model = new GoogleGeminiDeepResearch(createConfig());
    const capturedCreates: RecordedDeepResearchRequest[] = [];
    setMockInteractions(model, {
      create: async (params) => {
        capturedCreates.push(params);
        return createInteraction({
          id: `interaction-${capturedCreates.length}`,
          status: "completed",
          output_text: `report ${capturedCreates.length}`,
        });
      },
      get: async (id) => createInteraction({ id }),
      cancel: async (id) => createInteraction({ id, status: "cancelled" }),
    });

    const stateOptions: PsModelRequestOptions = {
      geminiDeepResearchStateKey: "research-thread-1",
    };
    await generate(
      model,
      [{ role: "user", message: "initial question" }],
      stateOptions
    );
    await generate(
      model,
      [
        { role: "user", message: "initial question" },
        { role: "assistant", message: "ignored old answer" },
        { role: "user", message: "follow up question" },
      ],
      stateOptions
    );

    assert.equal(capturedCreates[1].previous_interaction_id, "interaction-1");
    assert.equal(capturedCreates[1].input, "follow up question");
  });

  it("continues keyed follow-up research when callers send only the next turn", async () => {
    const model = new GoogleGeminiDeepResearch(createConfig());
    const capturedCreates: RecordedDeepResearchRequest[] = [];
    setMockInteractions(model, {
      create: async (params) => {
        capturedCreates.push(params);
        return createInteraction({
          id: `interaction-${capturedCreates.length}`,
          status: "completed",
          output_text: `report ${capturedCreates.length}`,
        });
      },
      get: async (id) => createInteraction({ id }),
      cancel: async (id) => createInteraction({ id, status: "cancelled" }),
    });

    const stateOptions: PsModelRequestOptions = {
      geminiDeepResearchStateKey: "research-thread-1",
    };
    await generate(
      model,
      [{ role: "user", message: "initial question" }],
      stateOptions
    );
    await generate(
      model,
      [{ role: "user", message: "single-turn follow up" }],
      stateOptions
    );

    assert.equal(capturedCreates[1].previous_interaction_id, "interaction-1");
    assert.equal(capturedCreates[1].input, "single-turn follow up");
  });

  it("does not continue unkeyed calls on a reused wrapper instance", async () => {
    const model = new GoogleGeminiDeepResearch(createConfig());
    const capturedCreates: RecordedDeepResearchRequest[] = [];
    setMockInteractions(model, {
      create: async (params) => {
        capturedCreates.push(params);
        return createInteraction({
          id: `interaction-${capturedCreates.length}`,
          status: "completed",
          output_text: `report ${capturedCreates.length}`,
        });
      },
      get: async (id) => createInteraction({ id }),
      cancel: async (id) => createInteraction({ id, status: "cancelled" }),
    });

    await generate(model, [{ role: "user", message: "initial question" }]);
    await generate(model, [
      { role: "system", message: "unrelated system" },
      { role: "user", message: "unrelated question" },
    ]);

    assert.equal(capturedCreates[1].previous_interaction_id, undefined);
    assert.equal(capturedCreates[1].input, "unrelated question");
    assert.equal(capturedCreates[1].system_instruction, "unrelated system");
  });

  it("auto-approves collaborative planning once and returns the execution report", async () => {
    const model = new GoogleGeminiDeepResearch(createConfig());
    const capturedCreates: RecordedDeepResearchRequest[] = [];
    const planUsage = {
      total_input_tokens: 5,
      total_tool_use_tokens: 1,
      total_output_tokens: 7,
      total_cached_tokens: 2,
      total_thought_tokens: 3,
    };
    const executionUsage = {
      total_input_tokens: 10,
      total_tool_use_tokens: 2,
      total_output_tokens: 20,
      total_cached_tokens: 3,
      total_thought_tokens: 4,
    };
    setMockInteractions(model, {
      create: async (params) => {
        capturedCreates.push(params);
        if (capturedCreates.length === 1) {
          return createInteraction({
            id: "interaction-plan",
            status: "requires_action",
            output_text: "research plan",
            usage: planUsage,
          });
        }
        return createInteraction({
          id: "interaction-execution",
          status: "completed",
          output_text: "execution report",
          usage: executionUsage,
        });
      },
      get: async (id) => createInteraction({ id }),
      cancel: async (id) => createInteraction({ id, status: "cancelled" }),
    });

    const result = await generate(
      model,
      [{ role: "user", message: "research" }],
      {
        timeoutMs: 60_000,
        geminiDeepResearchConfig: {
          type: "deep-research",
          collaborative_planning: true,
        },
      }
    );

    assert.equal(result.content, "execution report");
    assert.equal(result.tokensIn, 18);
    assert.equal(result.tokensOut, 27);
    assert.equal(result.cachedInTokens, 5);
    assert.equal(result.reasoningTokens, 7);
    assert.equal(capturedCreates.length, 2);
    assert.equal(capturedCreates[0].agent_config?.collaborative_planning, true);
    assert.equal(capturedCreates[1].previous_interaction_id, "interaction-plan");
    assert.equal(capturedCreates[1].agent_config?.collaborative_planning, false);
    assert.equal(
      capturedCreates[1].input,
      "Approved. Proceed with the research plan."
    );
    assert.deepEqual(result.usageItemData?.usageRaw, {
      planning: planUsage,
      execution: executionUsage,
    });
    assert.equal(
      result.usageItemData?.providerMetadata?.planningInteractionId,
      "interaction-plan"
    );
  });

  it("shares one timeout budget across collaborative planning and execution", async () => {
    const model = new GoogleGeminiDeepResearch(createConfig());
    const originalDateNow = Date.now;
    let nowMs = 1_000;
    const createTimeouts: unknown[] = [];

    Date.now = () => nowMs;
    try {
      setMockInteractions(model, {
        create: async (_params, options) => {
          createTimeouts.push(options?.timeout);
          if (createTimeouts.length === 1) {
            nowMs += 55;
            return createInteraction({
              id: "interaction-plan",
              status: "requires_action",
              output_text: "research plan",
            });
          }
          return createInteraction({
            id: "interaction-execution",
            status: "completed",
            output_text: "execution report",
          });
        },
        get: async (id) => createInteraction({ id }),
        cancel: async (id) => createInteraction({ id, status: "cancelled" }),
      });

      await generate(
        model,
        [{ role: "user", message: "research" }],
        {
          timeoutMs: 100,
          geminiDeepResearchConfig: {
            type: "deep-research",
            collaborative_planning: true,
          },
        }
      );
    } finally {
      Date.now = originalDateNow;
    }

    assert.deepEqual(createTimeouts, [90, 35]);
  });

  it("passes through Deep Research agent config fields", async () => {
    const model = new GoogleGeminiDeepResearch(createConfig());
    let captured: RecordedDeepResearchRequest | undefined;
    setMockInteractions(model, {
      create: async (params) => {
        captured = params;
        return createInteraction();
      },
      get: async (id) => createInteraction({ id }),
      cancel: async (id) => createInteraction({ id, status: "cancelled" }),
    });

    await generate(model, [{ role: "user", message: "research" }], {
      geminiDeepResearchConfig: {
        type: "deep-research",
        thinking_summaries: "auto",
        visualization: "auto",
        enable_bigquery_tool: true,
      },
    });

    assert.deepEqual(captured?.agent_config, {
      type: "deep-research",
      thinking_summaries: "auto",
      visualization: "auto",
      enable_bigquery_tool: true,
    });
  });
});
