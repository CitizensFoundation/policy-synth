import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encoding_for_model } from "tiktoken";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";

process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DB_PORT ??= "5432";
process.env.AZURE_OPENAI_ENDPOINT ??= "https://example.openai.azure.com/";

const { AzureOpenAiChat } = await import("../../aiModels/azureOpenAiChat.js");
type AzureTokenEstimateMessage =
  Parameters<InstanceType<typeof AzureOpenAiChat>["getEstimatedNumTokensFromMessages"]>[0][number];

type RecordedAzureRequest = {
  messages?: Array<Record<string, unknown>>;
  max_tokens?: number;
  model?: string;
  stream?: boolean;
  reasoning_effort?: string;
  temperature?: number;
  stream_options?: {
    include_usage?: boolean;
  };
};

type AzureCompletionsMock = {
  create: (params: unknown) => Promise<unknown>;
};

const createConfig = (
  overrides: Partial<PsAzureAiModelConfig> = {}
): PsAzureAiModelConfig => ({
  apiKey: "azure-test-key",
  endpoint: "https://example.openai.azure.com/",
  deploymentName: "gpt-4o-deployment",
  modelName: "gpt-4o",
  modelType: PsAiModelType.Text,
  modelSize: PsAiModelSize.Small,
  maxTokensOut: 256,
  reasoningEffort: "medium",
  temperature: 0.4,
  prices: {
    costInTokensPerMillion: 1,
    costInCachedContextTokensPerMillion: 0.5,
    costOutTokensPerMillion: 2,
    currency: "USD",
  },
  ...overrides,
});

const setMockClient = (model: object, completions: AzureCompletionsMock) => {
  Reflect.set(model, "client", {
    chat: {
      completions,
    },
  });
};

describe("AzureOpenAiChat", () => {
  it("builds non-streaming chat requests and records usage data", async () => {
    const model = new AzureOpenAiChat(
      createConfig({
        reasoningEffort: "max",
        temperature: 0.15,
      })
    );

    let captured: RecordedAzureRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedAzureRequest;
        return {
          id: "azure-resp-1",
          service_tier: "standard",
          choices: [
            { message: { content: "Hello " } },
            { message: { content: "Azure" } },
          ],
          usage: {
            prompt_tokens: 9,
            completion_tokens: 4,
            prompt_tokens_details: { cached_tokens: 1 },
            completion_tokens_details: {
              reasoning_tokens: 2,
              audio_tokens: 3,
            },
          },
        };
      },
    });

    const result = await model.generate([
      { role: "system", message: "system prompt" },
      {
        role: "assistant",
        message: "commentary",
        phase: "commentary",
      },
      { role: "user", message: "hello", name: "speaker" },
      {
        role: "assistant",
        message: "",
        toolCall: {
          id: "tool-1",
          name: "lookup",
          arguments: { id: 1 },
        },
      },
      {
        role: "tool",
        message: '{"ok":true}',
        toolCallId: "tool-1",
      },
    ]);

    assert.ok(captured);
    assert.equal(captured.max_tokens, 256);
    assert.equal(captured.model, "");
    assert.equal(captured.reasoning_effort, "xhigh");
    assert.equal(captured.temperature, 0.15);
    assert.deepEqual(captured.messages, [
      { role: "system", content: "system prompt" },
      { role: "user", content: "hello", name: "speaker" },
      {
        role: "assistant",
        content: "",
        tool_calls: [
          {
            type: "function",
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
        tool_call_id: "tool-1",
      },
    ]);

    assert.equal(result.content, "Hello Azure");
    assert.equal(result.tokensIn, 9);
    assert.equal(result.tokensOut, 4);
    assert.equal(result.cachedInTokens, 1);
    assert.equal(result.reasoningTokens, 2);
    assert.equal(result.audioTokens, 3);
    assert.equal(result.usageItemData?.providerMetadata?.responseId, "azure-resp-1");
    assert.equal(
      result.usageItemData?.request?.deploymentName,
      "gpt-4o-deployment"
    );
  });

  it("streams deltas and carries final usage details into the result", async () => {
    const model = new AzureOpenAiChat(createConfig());

    let captured: RecordedAzureRequest | undefined;
    const chunks: string[] = [];
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedAzureRequest;

        return {
          async *[Symbol.asyncIterator]() {
            yield {
              id: "stream-1",
              service_tier: "standard",
              choices: [{ delta: { content: "Hello " } }],
            };
            yield {
              id: "stream-1",
              service_tier: "standard",
              usage: {
                prompt_tokens: 12,
                completion_tokens: 5,
                prompt_tokens_details: { cached_tokens: 2 },
                completion_tokens_details: {
                  reasoning_tokens: 1,
                  audio_tokens: 0,
                },
              },
              choices: [{ delta: { content: "stream" } }],
            };
          },
        };
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (chunk) => chunks.push(chunk)
    );

    assert.ok(captured);
    assert.equal(captured.stream, true);
    assert.deepEqual(captured.stream_options, { include_usage: true });
    assert.equal(captured.reasoning_effort, "medium");
    assert.deepEqual(chunks, ["Hello ", "stream"]);
    assert.equal(result.content, "Hello stream");
    assert.equal(result.tokensIn, 12);
    assert.equal(result.tokensOut, 5);
    assert.equal(result.cachedInTokens, 2);
    assert.equal(result.reasoningTokens, 1);
    assert.equal(result.usageItemData?.request?.stream, true);
  });

  it("uses constructor fallbacks and zeroes missing usage fields", async () => {
    const model = new AzureOpenAiChat({
      endpoint: "https://example.openai.azure.com/",
      apiKey: "azure-test-key",
      deploymentName: "fallback-deployment",
      modelName: "",
      modelType: PsAiModelType.Text,
      modelSize: PsAiModelSize.Small,
      maxTokensOut: 0,
      temperature: 0,
      prices: {
        costInTokensPerMillion: 1,
        costInCachedContextTokensPerMillion: 0.5,
        costOutTokensPerMillion: 2,
        currency: "USD",
      },
    });

    let captured: RecordedAzureRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedAzureRequest;
        return {
          id: "azure-defaults",
          choices: [
            { message: { content: null } },
            {},
            { message: { content: "fallback text" } },
          ],
        };
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.max_tokens, 4096);
    assert.equal(captured.reasoning_effort, "medium");
    assert.equal(captured.temperature, 0.7);
    assert.equal(model.modelName, "gpt-4");
    assert.equal(result.content, "fallback text");
    assert.equal(result.tokensIn, 0);
    assert.equal(result.tokensOut, 0);
    assert.equal(result.cachedInTokens, 0);
    assert.equal(result.reasoningTokens, 0);
    assert.equal(result.audioTokens, 0);
    assert.equal(result.usageItemData?.providerMetadata?.responseId, "azure-defaults");
  });

  it("streams without callbacks or usage metadata", async () => {
    const model = new AzureOpenAiChat(createConfig());

    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield { choices: undefined };
          yield { choices: [{ delta: {} }] };
          yield { choices: [{ delta: { content: "done" } }] };
        },
      }),
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true
    );

    assert.equal(result.content, "done");
    assert.equal(result.tokensIn, 0);
    assert.equal(result.tokensOut, 0);
    assert.equal(result.cachedInTokens, 0);
    assert.equal(result.reasoningTokens, 0);
    assert.equal(result.audioTokens, 0);
    assert.equal(result.usageItemData?.usageRaw, undefined);
  });

  it("estimates tokens by summing message encodings", async () => {
    const model = new AzureOpenAiChat(createConfig());
    const messages: AzureTokenEstimateMessage[] = [
      { role: "user", message: "hello world" },
      { role: "assistant", message: "another line" },
    ];

    const encoder = encoding_for_model("gpt-4o");
    try {
      const expected = messages.reduce(
        (sum, message) => sum + encoder.encode(message.message).length,
        0
      );
      const actual = await model.getEstimatedNumTokensFromMessages(messages);
      assert.equal(actual, expected);
    } finally {
      encoder.free();
    }
  });
});
