import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { encoding_for_model } from "tiktoken";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";

process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DB_PORT ??= "5432";

const { OpenAiChat } = await import("../../aiModels/openAiChat.js");
type OpenAiChatInstance = InstanceType<typeof OpenAiChat>;

type RecordedChatRequest = {
  model?: string;
  messages?: Array<Record<string, unknown>>;
  tools?: ChatCompletionTool[];
  tool_choice?: ChatCompletionToolChoiceOption | "auto";
  safety_identifier?: string;
  service_tier?: string;
  logit_bias?: Record<string, number>;
  temperature?: number;
  reasoning_effort?: string;
  max_tokens?: number;
  max_completion_tokens?: number;
  stream?: boolean;
  stream_options?: {
    include_usage?: boolean;
  };
};

type OpenAiChatInternals = {
  preprocessMessages: (
    msgs: PsModelMessage[]
  ) => Array<Record<string, unknown>>;
};

type MockChatCompletions = {
  create: (params: unknown) => Promise<unknown>;
  stream: (
    params: unknown
  ) => AsyncIterable<unknown> & {
    finalChatCompletion: () => Promise<unknown>;
  };
};

const createConfig = (
  overrides: Partial<PsOpenAiModelConfig> = {}
): PsOpenAiModelConfig => ({
  apiKey: "openai-test-key",
  modelName: "gpt-4o",
  modelType: PsAiModelType.Text,
  modelSize: PsAiModelSize.Small,
  maxTokensOut: 256,
  temperature: 0.4,
  prices: {
    costInTokensPerMillion: 1,
    costInCachedContextTokensPerMillion: 0.5,
    costOutTokensPerMillion: 2,
    currency: "USD",
  },
  ...overrides,
});

const setMockClient = (model: object, completions: MockChatCompletions) => {
  Reflect.set(model, "client", {
    chat: {
      completions,
    },
  });
};

const asInternals = (model: OpenAiChatInstance) =>
  model as unknown as OpenAiChatInternals;

const originalOpenAiOverride = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
const originalEnforceEuRegion = process.env.OPENAI_ENFORCE_EU_REGION;
const originalDebugPromptMessages = process.env.PS_DEBUG_PROMPT_MESSAGES;

afterEach(() => {
  if (originalOpenAiOverride === undefined) {
    delete process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
  } else {
    process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY = originalOpenAiOverride;
  }

  if (originalEnforceEuRegion === undefined) {
    delete process.env.OPENAI_ENFORCE_EU_REGION;
  } else {
    process.env.OPENAI_ENFORCE_EU_REGION = originalEnforceEuRegion;
  }

  if (originalDebugPromptMessages === undefined) {
    delete process.env.PS_DEBUG_PROMPT_MESSAGES;
  } else {
    process.env.PS_DEBUG_PROMPT_MESSAGES = originalDebugPromptMessages;
  }
});

describe("OpenAiChat", () => {
  it("uses override keys, maps flex service tier, and preserves assistant names", async () => {
    process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY = "override-openai-key";

    const model = new OpenAiChat(
      createConfig({
        inferenceType: "flex",
        safetyIdentifier: "config-safe",
      })
    );
    const internals = asInternals(model);

    assert.equal(model.getCloneConfig().apiKey, "override-openai-key");
    assert.deepEqual(internals.preprocessMessages([
      {
        role: "assistant",
        name: "planner",
        message: "hello",
      },
    ]), [
      {
        role: "assistant",
        name: "planner",
        content: "hello",
      },
    ]);

    let captured: RecordedChatRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedChatRequest;
        return {
          id: "resp-flex",
          service_tier: "flex",
          choices: [
            {
              message: {
                content: "flex ok",
                tool_calls: [],
              },
            },
          ],
          usage: {
            prompt_tokens: 2,
            completion_tokens: 1,
          },
        };
      },
      stream: () => {
        throw new Error("stream should not be called in this test");
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.service_tier, "flex");
    assert.equal(captured.safety_identifier, "config-safe");
    assert.equal(result.usageItemData?.request?.requestedServiceTier, "flex");
  });

  it("builds non-streaming requests for standard chat models and records usage", async () => {
    const model = new OpenAiChat(
      createConfig({
        inferenceType: "priority",
        temperature: 0.25,
      })
    );

    let captured: RecordedChatRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedChatRequest;
        return {
          id: "resp-standard",
          service_tier: "priority",
          choices: [
            {
              message: {
                content: "completed",
                tool_calls: [
                  {
                    type: "function",
                    id: "tool-1",
                    function: {
                      name: "lookup",
                      arguments: '{"id":1}',
                    },
                  },
                ],
              },
            },
          ],
          usage: {
            prompt_tokens: 11,
            completion_tokens: 7,
            prompt_tokens_details: { cached_tokens: 3 },
            completion_tokens_details: {
              reasoning_tokens: 1,
              audio_tokens: 2,
            },
          },
        };
      },
      stream: () => {
        throw new Error("stream should not be called in this test");
      },
    });

    const tools: ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "lookup",
          description: "Allowed tool",
          parameters: {
            type: "object",
            properties: {
              id: { type: "number" },
            },
          },
        },
      },
      {
        type: "function",
        function: {
          name: "blocked",
          description: "Blocked tool",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
            },
          },
        },
      },
    ];

    const result = await model.generate(
      [
        { role: "system", message: "system prompt" },
        {
          role: "assistant",
          message: "hidden commentary",
          phase: "commentary",
        },
        { role: "user", message: "hello" },
        {
          role: "assistant",
          message: "",
          toolCall: {
            id: "assistant-tool-1",
            name: "lookup",
            arguments: { id: 1 },
          },
        },
        {
          role: "tool",
          message: '{"ok":true}',
          toolCallId: "assistant-tool-1",
        },
      ],
      false,
      undefined,
      undefined,
      tools,
      "auto",
      ["lookup"],
      { safetyIdentifier: "safe-override" }
    );

    assert.ok(captured);
    assert.equal(captured.model, "gpt-4o");
    assert.equal(captured.service_tier, "priority");
    assert.equal(captured.safety_identifier, "safe-override");
    assert.equal(captured.temperature, 0.25);
    assert.equal(captured.max_tokens, 256);
    assert.equal(captured.max_completion_tokens, undefined);
    assert.deepEqual(captured.messages, [
      { role: "system", content: "system prompt" },
      { role: "user", content: "hello" },
      {
        role: "assistant",
        content: "",
        tool_calls: [
          {
            type: "function",
            id: "assistant-tool-1",
            function: {
              name: "lookup",
              arguments: '{"id":1}',
            },
          },
        ],
      },
      {
        role: "tool",
        content: '{"ok":true}',
        tool_call_id: "assistant-tool-1",
      },
    ]);

    const enc = encoding_for_model("gpt-4o");
    try {
      const blockedNameTokens = enc.encode("blocked");
      for (const token of blockedNameTokens) {
        assert.equal(captured.logit_bias?.[String(token)], -100);
      }
    } finally {
      enc.free();
    }

    assert.equal(result.content, "completed");
    assert.equal(result.tokensIn, 11);
    assert.equal(result.tokensOut, 7);
    assert.equal(result.cachedInTokens, 3);
    assert.equal(result.reasoningTokens, 1);
    assert.equal(result.audioTokens, 2);
    assert.deepEqual(result.toolCalls, [
      {
        id: "tool-1",
        name: "lookup",
        arguments: { id: 1 },
      },
    ]);

    const usageRequest = result.usageItemData?.request as
      | Record<string, unknown>
      | undefined;
    assert.equal(usageRequest?.requestedServiceTier, "priority");
    assert.equal(usageRequest?.toolCount, 2);
  });

  it("switches reasoning models to max_completion_tokens and xhigh effort", async () => {
    process.env.OPENAI_ENFORCE_EU_REGION = "true";

    const model = new OpenAiChat(
      createConfig({
        modelType: PsAiModelType.TextReasoning,
        inferenceType: "fast",
        reasoningEffort: "max",
        temperature: 0.9,
      })
    );

    let captured: RecordedChatRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedChatRequest;
        return {
          id: "resp-reasoning",
          service_tier: "priority",
          choices: [
            {
              message: {
                content: "reasoned answer",
                tool_calls: [],
              },
            },
          ],
          usage: {
            prompt_tokens: 5,
            completion_tokens: 6,
            prompt_tokens_details: { cached_tokens: 1 },
            completion_tokens_details: {
              reasoning_tokens: 4,
              audio_tokens: 0,
            },
          },
        };
      },
      stream: () => {
        throw new Error("stream should not be called in this test");
      },
    });

    const result = await model.generate([{ role: "user", message: "reason" }]);

    assert.ok(captured);
    assert.equal(captured.service_tier, "priority");
    assert.equal(captured.reasoning_effort, "xhigh");
    assert.equal(captured.temperature, undefined);
    assert.equal(captured.logit_bias, undefined);
    assert.equal(captured.max_tokens, undefined);
    assert.equal(captured.max_completion_tokens, 256);

    const usageRequest = result.usageItemData?.request as
      | Record<string, unknown>
      | undefined;
    assert.equal(usageRequest?.requestedInferenceType, "fast");
    assert.equal(usageRequest?.requestedServiceTier, "priority");
    assert.equal(usageRequest?.regionalProcessing, "eu");
  });

  it("streams deltas, forwards callbacks, and falls back on malformed tool call arguments", async () => {
    const model = new OpenAiChat(createConfig());

    let captured: RecordedChatRequest | undefined;
    const callbackChunks: string[] = [];
    setMockClient(model, {
      create: async () => {
        throw new Error("create should not be called in this test");
      },
      stream: (params) => {
        captured = params as RecordedChatRequest;

        const events = [
          { choices: [{ delta: { content: "Hello " } }] },
          { choices: [{ delta: { content: "world" } }] },
        ];

        return {
          async *[Symbol.asyncIterator]() {
            for (const event of events) {
              yield event;
            }
          },
          async finalChatCompletion() {
            return {
              id: "resp-stream",
              service_tier: "priority",
              choices: [
                {
                  message: {
                    tool_calls: [
                      {
                        type: "function",
                        id: "tool-1",
                        function: {
                          name: "lookup",
                          arguments: '{"id":7}',
                        },
                      },
                      {
                        type: "function",
                        id: "tool-2",
                        function: {
                          name: "broken",
                          arguments: "{",
                        },
                      },
                    ],
                  },
                },
              ],
              usage: {
                prompt_tokens: 9,
                completion_tokens: 2,
                prompt_tokens_details: { cached_tokens: 0 },
                completion_tokens_details: {
                  reasoning_tokens: 0,
                  audio_tokens: 0,
                },
              },
            };
          },
        };
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (chunk) => callbackChunks.push(chunk)
    );

    assert.ok(captured);
    assert.equal(captured.stream, true);
    assert.deepEqual(captured.stream_options, { include_usage: true });
    assert.equal(captured.max_tokens, 256);
    assert.deepEqual(callbackChunks, ["Hello ", "world"]);
    assert.equal(result.content, "Hello world");
    assert.deepEqual(result.toolCalls, [
      {
        id: "tool-1",
        name: "lookup",
        arguments: { id: 7 },
      },
      {
        id: "tool-2",
        name: "broken",
        arguments: {},
      },
    ]);
    assert.equal(result.usageItemData?.request?.stream, true);
  });

  it("falls back when logit-bias encoding fails and leaves service tier unset by default", async () => {
    const model = new OpenAiChat(
      createConfig({
        modelName: "not-a-real-openai-model",
      })
    );

    let captured: RecordedChatRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedChatRequest;
        return {
          id: "resp-default",
          choices: [
            {
              message: {
                content: "ok",
                tool_calls: [],
              },
            },
          ],
          usage: {
            prompt_tokens: 1,
            completion_tokens: 1,
          },
        };
      },
      stream: () => {
        throw new Error("stream should not be called in this test");
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      false,
      undefined,
      undefined,
      [
        {
          type: "function",
          function: {
            name: "lookup",
            parameters: {
              type: "object",
            },
          },
        },
      ],
      "auto",
      ["different-tool"]
    );

    assert.ok(captured);
    assert.equal(captured.service_tier, undefined);
    assert.equal(captured.logit_bias, undefined);
    assert.equal(captured.temperature, 0.4);
    assert.equal(result.usageItemData?.request?.requestedServiceTier, null);
  });

  it("maps undefined tool arguments and honors config-driven EU processing", async () => {
    process.env.PS_DEBUG_PROMPT_MESSAGES = "true";

    const model = new OpenAiChat(
      createConfig({
        regionalProcessing: "eu",
      })
    );

    let captured: RecordedChatRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedChatRequest;
        return {
          id: "resp-eu-config",
          choices: [
            {
              message: {
                content: null,
                tool_calls: [
                  {
                    type: "function",
                    id: "tool-empty",
                    function: {
                      name: "lookup",
                      arguments: "",
                    },
                  },
                ],
              },
            },
          ],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
          },
        };
      },
      stream: () => {
        throw new Error("stream should not be called in this test");
      },
    });

    const result = await model.generate([
      {
        role: "assistant",
        message: "",
        toolCall: {
          id: "assistant-tool-empty",
          name: "lookup",
        } as ToolCall,
      },
    ]);

    assert.ok(captured);
    assert.equal(captured.service_tier, undefined);
    assert.equal(captured.messages?.[0]?.role, "assistant");
    assert.deepEqual(captured.messages?.[0]?.tool_calls, [
      {
        type: "function",
        id: "assistant-tool-empty",
        function: {
          name: "lookup",
          arguments: "{}",
        },
      },
    ]);
    assert.equal(result.content, "");
    assert.deepEqual(result.toolCalls, [
      {
        id: "tool-empty",
        name: "lookup",
        arguments: {},
      },
    ]);
    assert.equal(result.usageItemData?.request?.regionalProcessing, "eu");
    assert.equal(result.usageItemData?.providerMetadata?.regionalProcessing, "eu");
  });

  it("streams empty deltas without callback and defaults final usage", async () => {
    const model = new OpenAiChat(createConfig());

    setMockClient(model, {
      create: async () => {
        throw new Error("create should not be called in this test");
      },
      stream: () => ({
        async *[Symbol.asyncIterator]() {
          yield { choices: [] };
          yield { choices: [{ delta: {} }] };
          yield { choices: [{ delta: { content: "partial" } }] };
        },
        async finalChatCompletion() {
          return {
            id: null,
            choices: [
              {
                message: {},
              },
            ],
          };
        },
      }),
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true
    );

    assert.equal(result.content, "partial");
    assert.deepEqual(result.toolCalls, []);
    assert.equal(result.tokensIn, 0);
    assert.equal(result.tokensOut, 0);
    assert.equal(result.cachedInTokens, 0);
    assert.equal(result.reasoningTokens, 0);
    assert.equal(result.audioTokens, 0);
    assert.equal(result.usageItemData?.providerMetadata?.responseId, null);
  });

  it("maps a runtime fast tier to priority when present on the active config", async () => {
    const model = new OpenAiChat(createConfig());
    const currentConfig = Reflect.get(model, "cfg") as PsOpenAiModelConfig;
    Reflect.set(model, "cfg", {
      ...currentConfig,
      inferenceType: "fast",
    });

    let captured: RecordedChatRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedChatRequest;
        return {
          choices: [
            {
              message: {
                content: "fast tier",
              },
            },
          ],
          usage: {
            prompt_tokens: 1,
            completion_tokens: 1,
          },
        };
      },
      stream: () => {
        throw new Error("stream should not be called in this test");
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.service_tier, "priority");
    assert.equal(result.content, "fast tier");
    assert.equal(result.usageItemData?.request?.requestedServiceTier, "priority");
  });
});
