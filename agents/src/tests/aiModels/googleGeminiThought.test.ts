import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { GenerateContentResponse } from "@google/genai";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";

process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DB_PORT ??= "5432";

const { GoogleGeminiThought } = await import(
  "../../aiModels/googleGeminiThought.js"
);
const { GoogleGeminiChat } = await import("../../aiModels/googleGeminiChat.js");

type GoogleGeminiThoughtInstance = InstanceType<typeof GoogleGeminiThought>;

type GoogleGeminiThoughtInternals = {
  buildAssistantToolCallMessage: (message: PsModelMessage) => {
    role: string;
    parts: unknown[];
  };
  handleStreamChunk: (chunk: GenerateContentResponse) => void;
  handleFinalResponse: (response: GenerateContentResponse) => void;
};

const asInternals = (model: GoogleGeminiThoughtInstance) =>
  model as unknown as GoogleGeminiThoughtInternals;

const createConfig = (
  overrides: Partial<PsAiModelConfig> = {}
): PsAiModelConfig => ({
  apiKey: "gemini-thought-test-key",
  modelName: "gemini-2.5-pro",
  modelType: PsAiModelType.MultiModalReasoning,
  modelSize: PsAiModelSize.Small,
  maxTokensOut: 4096,
  prices: {
    costInTokensPerMillion: 1,
    costInCachedContextTokensPerMillion: 0.5,
    costOutTokensPerMillion: 2,
    currency: "USD",
  },
  ...overrides,
});

const originalGenerate = GoogleGeminiChat.prototype.generate;

afterEach(() => {
  Reflect.set(GoogleGeminiChat.prototype, "generate", originalGenerate);
});

describe("GoogleGeminiThought", () => {
  it("retries empty responses until content becomes available", async () => {
    let callCount = 0;

    const patchedGenerate = (async () => {
      callCount += 1;
      if (callCount < 3) {
        return {
          content: "",
          tokensIn: 0,
          tokensOut: 0,
          toolCalls: [],
        };
      }

      return {
        content: "resolved",
        tokensIn: 5,
        tokensOut: 7,
      };
    }) as typeof GoogleGeminiChat.prototype.generate;

    Reflect.set(GoogleGeminiChat.prototype, "generate", patchedGenerate);

    const model = new GoogleGeminiThought(createConfig());
    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.equal(callCount, 3);
    assert.equal(result.content, "resolved");
    assert.equal(result.tokensIn, 5);
    assert.equal(result.tokensOut, 7);
  });

  it("returns the final empty result after exhausting retries", async () => {
    let callCount = 0;

    const patchedGenerate = (async () => {
      callCount += 1;
      return {
        content: "",
        tokensIn: 0,
        tokensOut: 0,
        toolCalls: [],
      };
    }) as typeof GoogleGeminiChat.prototype.generate;

    Reflect.set(GoogleGeminiChat.prototype, "generate", patchedGenerate);

    const model = new GoogleGeminiThought(createConfig());
    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.equal(callCount, 4);
    assert.equal(result.content, "");
    assert.deepEqual(result.toolCalls, []);
  });

  it("injects captured tool-call parts by call id and preserves thought signatures", () => {
    const model = new GoogleGeminiThought(createConfig());
    const internals = asInternals(model);

    internals.handleStreamChunk({
      candidates: [
        {
          content: {
            parts: [
              { text: "preface", thoughtSignature: "sig-1" },
              {
                functionCall: {
                  id: "call-1",
                  name: "lookup",
                  args: { id: 1 },
                },
              },
            ],
          },
        },
      ],
    } as unknown as GenerateContentResponse);

    const injected = internals.buildAssistantToolCallMessage({
      role: "assistant",
      message: "",
      toolCall: {
        id: "call-1",
        name: "lookup",
        arguments: { id: 1 },
      },
    });

    const parts = injected.parts as Array<Record<string, unknown>>;
    assert.equal(injected.role, "model");
    assert.equal(parts.length, 2);
    assert.equal(parts[0].text, "preface");
    assert.deepEqual(parts[1].functionCall, {
      id: "call-1",
      name: "lookup",
      args: { id: 1 },
    });
    assert.equal(parts[1].thoughtSignature, "sig-1");
  });

  it("queues tool-call parts without ids and reuses them for later injections", () => {
    const model = new GoogleGeminiThought(createConfig());
    const internals = asInternals(model);

    internals.handleFinalResponse({
      candidates: [
        {
          content: {
            parts: [
              { text: "queued", thoughtSignature: "sig-q" },
              {
                functionCall: {
                  name: "lookup",
                  args: { id: 2 },
                },
              },
            ],
          },
        },
      ],
    } as unknown as GenerateContentResponse);

    const first = internals.buildAssistantToolCallMessage({
      role: "assistant",
      message: "",
      toolCall: {
        id: "",
        name: "lookup",
        arguments: { id: 2 },
      },
    });

    const second = internals.buildAssistantToolCallMessage({
      role: "assistant",
      message: "",
      toolCall: {
        id: "",
        name: "lookup",
        arguments: { id: 2 },
      },
    });

    const firstParts = first.parts as Array<Record<string, unknown>>;
    const secondParts = second.parts as Array<Record<string, unknown>>;

    assert.equal(first.role, "model");
    assert.equal(firstParts[0].text, "queued");
    assert.equal(
      (firstParts[1].functionCall as Record<string, unknown>).name,
      "lookup"
    );
    assert.equal(firstParts[1].thoughtSignature, "sig-q");
    assert.deepEqual(firstParts, secondParts);
  });

  it("captures automatic function-calling history once and keeps stored parts immutable", () => {
    const model = new GoogleGeminiThought(createConfig());
    const internals = asInternals(model);

    internals.handleFinalResponse({
      automaticFunctionCallingHistory: [
        {
          parts: [
            { text: "history" },
            {
              functionCall: {
                id: "call-history",
                name: "lookup",
                args: { id: 4 },
              },
            },
          ],
        },
      ],
    } as unknown as GenerateContentResponse);

    const first = internals.buildAssistantToolCallMessage({
      role: "assistant",
      message: "",
      toolCall: {
        id: "call-history",
        name: "lookup",
        arguments: { id: 4 },
      },
    });

    const firstParts = first.parts as Array<Record<string, unknown>>;
    assert.equal(firstParts[0].text, "history");

    firstParts[0].text = "mutated";

    internals.handleStreamChunk({
      candidates: [
        {
          content: {
            parts: [
              { text: "replacement" },
              {
                functionCall: {
                  id: "call-history",
                  name: "lookup",
                  args: { id: 99 },
                },
              },
            ],
          },
        },
      ],
    } as unknown as GenerateContentResponse);

    const second = internals.buildAssistantToolCallMessage({
      role: "assistant",
      message: "",
      toolCall: {
        id: "call-history",
        name: "lookup",
        arguments: { id: 4 },
      },
    });

    const secondParts = second.parts as Array<Record<string, unknown>>;
    assert.equal(secondParts[0].text, "history");
    assert.deepEqual(secondParts[1].functionCall, {
      id: "call-history",
      name: "lookup",
      args: { id: 4 },
    });
  });

  it("falls back to the base Gemini tool-call message when no captured state exists", () => {
    const model = new GoogleGeminiThought(createConfig());
    const internals = asInternals(model);

    const fallback = internals.buildAssistantToolCallMessage({
      role: "assistant",
      message: "",
      toolCall: {
        id: "missing-call",
        name: "lookup",
        arguments: { id: 3 },
      },
    });

    assert.deepEqual(fallback, {
      role: "model",
      parts: [
        {
          functionCall: {
            name: "lookup",
            args: { id: 3 },
          },
        },
      ],
    });
  });
});
