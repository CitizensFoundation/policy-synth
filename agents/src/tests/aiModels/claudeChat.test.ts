import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { ChatCompletionToolChoiceOption } from "openai/resources/chat/completions";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";

process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DB_PORT ??= "5432";

const { ClaudeChat } = await import("../../aiModels/claudeChat.js");

type ClaudeChatInstance = InstanceType<typeof ClaudeChat>;

type ClaudeChatInternals = {
  formatMessages: (
    messages: PsModelMessage[],
    media?: { mimeType: string; data: string }[]
  ) => { system?: unknown; messages: Array<Record<string, unknown>> };
  sanitizeToolId: (id: string | undefined) => string;
  buildTools: (
    tools: Array<{
      type: "function";
      function: {
        name: string;
        description?: string;
        parameters?: Record<string, unknown>;
      };
    }>,
    allowedTools: string[]
  ) => unknown[];
  mapToolChoice: (
    toolChoice:
      | ChatCompletionToolChoiceOption
      | "auto"
      | "required"
      | "none",
    hasTools: boolean
  ) => unknown;
  normalizeToolInput: (input: unknown) => Record<string, unknown>;
  getTextTypeFromContent: (
    content: Array<Record<string, unknown>>
  ) => string;
  getEstimatedNumTokensFromMessages: (messages: PsModelMessage[]) => Promise<number>;
};

type RecordedClaudeRequest = {
  max_tokens?: number;
  messages?: Array<Record<string, unknown>>;
  model?: string;
  temperature?: number;
  thinking?: unknown;
  tools?: unknown[];
  tool_choice?: unknown;
  system?: unknown;
  output_config?: unknown;
  stream?: boolean;
  betas?: string[];
  speed?: string;
};

type ClaudeClientMock = {
  messages: {
    create: (params: unknown) => Promise<unknown>;
    stream: (params: unknown) => Promise<unknown>;
  };
  beta: {
    messages: {
      create: (params: unknown) => Promise<unknown>;
      stream: (params: unknown) => Promise<unknown>;
    };
  };
};

const asInternals = (model: ClaudeChatInstance) =>
  model as unknown as ClaudeChatInternals;

const createConfig = (
  overrides: Partial<PsAiModelConfig> = {}
): PsAiModelConfig => ({
  apiKey: "anthropic-test-key",
  modelName: "claude-3-opus-20240229",
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

const setMockClient = (model: object, client: ClaudeClientMock) => {
  Reflect.set(model, "client", client);
};

const originalUseVertexForClaude = process.env.USE_VERTEX_FOR_CLAUDE;
const originalUseGoogleVertexForClaude =
  process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE;
const originalGoogleCloudProject = process.env.GOOGLE_CLOUD_PROJECT;
const originalGoogleCloudLocation = process.env.GOOGLE_CLOUD_LOCATION;
const originalGoogleVertexLocation = process.env.GOOGLE_VERTEX_LOCATION;
const originalCloudMlRegion = process.env.CLOUD_ML_REGION;
const originalAwsBearer = process.env.AWS_BEARER_TOKEN_BEDROCK;
const originalAwsInferenceProfile = process.env.AWS_INFERENCE_PROFILE;
const originalAwsRegion = process.env.AWS_REGION;
const originalAwsDefaultRegion = process.env.AWS_DEFAULT_REGION;
const originalUseClaude1m = process.env.USE_CLAUDE_1M_CONTEXT_BETA_FLAG;
const originalDebugPromptMessages = process.env.PS_DEBUG_PROMPT_MESSAGES;

afterEach(() => {
  if (originalUseVertexForClaude === undefined) {
    delete process.env.USE_VERTEX_FOR_CLAUDE;
  } else {
    process.env.USE_VERTEX_FOR_CLAUDE = originalUseVertexForClaude;
  }

  if (originalUseGoogleVertexForClaude === undefined) {
    delete process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE;
  } else {
    process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE =
      originalUseGoogleVertexForClaude;
  }

  if (originalGoogleCloudProject === undefined) {
    delete process.env.GOOGLE_CLOUD_PROJECT;
  } else {
    process.env.GOOGLE_CLOUD_PROJECT = originalGoogleCloudProject;
  }

  if (originalGoogleCloudLocation === undefined) {
    delete process.env.GOOGLE_CLOUD_LOCATION;
  } else {
    process.env.GOOGLE_CLOUD_LOCATION = originalGoogleCloudLocation;
  }

  if (originalGoogleVertexLocation === undefined) {
    delete process.env.GOOGLE_VERTEX_LOCATION;
  } else {
    process.env.GOOGLE_VERTEX_LOCATION = originalGoogleVertexLocation;
  }

  if (originalCloudMlRegion === undefined) {
    delete process.env.CLOUD_ML_REGION;
  } else {
    process.env.CLOUD_ML_REGION = originalCloudMlRegion;
  }

  if (originalAwsBearer === undefined) {
    delete process.env.AWS_BEARER_TOKEN_BEDROCK;
  } else {
    process.env.AWS_BEARER_TOKEN_BEDROCK = originalAwsBearer;
  }

  if (originalAwsInferenceProfile === undefined) {
    delete process.env.AWS_INFERENCE_PROFILE;
  } else {
    process.env.AWS_INFERENCE_PROFILE = originalAwsInferenceProfile;
  }

  if (originalAwsRegion === undefined) {
    delete process.env.AWS_REGION;
  } else {
    process.env.AWS_REGION = originalAwsRegion;
  }

  if (originalAwsDefaultRegion === undefined) {
    delete process.env.AWS_DEFAULT_REGION;
  } else {
    process.env.AWS_DEFAULT_REGION = originalAwsDefaultRegion;
  }

  if (originalUseClaude1m === undefined) {
    delete process.env.USE_CLAUDE_1M_CONTEXT_BETA_FLAG;
  } else {
    process.env.USE_CLAUDE_1M_CONTEXT_BETA_FLAG = originalUseClaude1m;
  }

  if (originalDebugPromptMessages === undefined) {
    delete process.env.PS_DEBUG_PROMPT_MESSAGES;
  } else {
    process.env.PS_DEBUG_PROMPT_MESSAGES = originalDebugPromptMessages;
  }
});

describe("ClaudeChat", () => {
  it("resolves Vertex and Bedrock model identifiers from environment flags", () => {
    process.env.USE_VERTEX_FOR_CLAUDE = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";
    process.env.GOOGLE_CLOUD_LOCATION = "europe-west1";

    const vertexModel = new ClaudeChat(
      createConfig({
        modelName: "claude-opus-4-5-20251101",
      })
    );

    assert.equal(vertexModel.modelName, "claude-opus-4-5@20251101");
    assert.equal(vertexModel.getCloneConfig().modelName, "claude-opus-4-5@20251101");

    delete process.env.USE_VERTEX_FOR_CLAUDE;
    process.env.AWS_BEARER_TOKEN_BEDROCK = "token";
    process.env.AWS_INFERENCE_PROFILE = "eu";
    process.env.AWS_REGION = "ap-south-1";

    const bedrockModel = new ClaudeChat(
      createConfig({
        modelName: "claude-opus-4-5-20251101",
      })
    );

    assert.equal(
      bedrockModel.modelName,
      "global.anthropic.claude-opus-4-5-20251101-v1:0"
    );
    assert.equal(
      bedrockModel.getCloneConfig().modelName,
      "global.anthropic.claude-opus-4-5-20251101-v1:0"
    );

    process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE = "true";
    process.env.GCLOUD_PROJECT = "fallback-project";
    delete process.env.GOOGLE_CLOUD_PROJECT;
    delete process.env.GOOGLE_CLOUD_LOCATION;

    const preservedVertex = new ClaudeChat(
      createConfig({
        modelName: "claude-sonnet-4-6@20260301",
      })
    );

    assert.equal(preservedVertex.modelName, "claude-sonnet-4-6@20260301");

    const bedrockStyleVertex = new ClaudeChat(
      createConfig({
        modelName: "global.anthropic.claude-opus-4-5-20251101-v1:0",
      })
    );

    assert.equal(bedrockStyleVertex.modelName, "claude-opus-4-5@20251101");

    const bedrockV2StyleVertex = new ClaudeChat(
      createConfig({
        modelName: "global.anthropic.claude-3-5-sonnet-20241022-v2:0",
      })
    );

    assert.equal(
      bedrockV2StyleVertex.modelName,
      "claude-3-5-sonnet-v2@20241022"
    );

    const apacBedrockStyleVertex = new ClaudeChat(
      createConfig({
        modelName: "apac.anthropic.claude-3-5-sonnet-20241022-v2:0",
      })
    );

    assert.equal(
      apacBedrockStyleVertex.modelName,
      "claude-3-5-sonnet-v2@20241022"
    );

    delete process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE;
    process.env.AWS_BEARER_TOKEN_BEDROCK = "token";
    process.env.AWS_INFERENCE_PROFILE =
      "eu.anthropic.claude-3-haiku-20240307-v1:0";

    const explicitProfile = new ClaudeChat(
      createConfig({
        modelName: "claude-3-haiku-20240307",
      })
    );

    assert.equal(
      explicitProfile.modelName,
      "eu.anthropic.claude-3-haiku-20240307-v1:0"
    );
  });

  it("normalizes additional Vertex and Bedrock model identifier variants", () => {
    process.env.USE_VERTEX_FOR_CLAUDE = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";

    const datestampedVertex = new ClaudeChat(
      createConfig({
        modelName: "claude-sonnet-4-6-20260301",
      })
    );
    assert.equal(datestampedVertex.modelName, "claude-sonnet-4-6@20260301");

    const passthroughVertex = new ClaudeChat(
      createConfig({
        modelName: "claude-custom-preview",
      })
    );
    assert.equal(passthroughVertex.modelName, "claude-custom-preview");

    delete process.env.USE_VERTEX_FOR_CLAUDE;
    process.env.AWS_BEARER_TOKEN_BEDROCK = "token";
    process.env.AWS_DEFAULT_REGION = "us-west-2";
    delete process.env.AWS_INFERENCE_PROFILE;

    const v2Bedrock = new ClaudeChat(
      createConfig({
        modelName: "claude-3-5-sonnet-20241022",
      })
    );
    assert.equal(
      v2Bedrock.modelName,
      "eu.anthropic.claude-3-5-sonnet-20241022-v2:0"
    );

    const passthroughBedrock = new ClaudeChat(
      createConfig({
        modelName: "us.anthropic.claude-3-haiku-20240307-v1:0",
      })
    );
    assert.equal(
      passthroughBedrock.modelName,
      "us.anthropic.claude-3-haiku-20240307-v1:0"
    );

    const apacPassthroughBedrock = new ClaudeChat(
      createConfig({
        modelName: "apac.anthropic.claude-3-5-sonnet-20241022-v2:0",
      })
    );
    assert.equal(
      apacPassthroughBedrock.modelName,
      "apac.anthropic.claude-3-5-sonnet-20241022-v2:0"
    );

    process.env.AWS_INFERENCE_PROFILE = "us";

    const shorthandBedrock = new ClaudeChat(
      createConfig({
        modelName: "claude-3-haiku-20240307",
      })
    );
    assert.equal(
      shorthandBedrock.modelName,
      "us.anthropic.claude-3-haiku-20240307-v1:0"
    );

    const globalOpusBedrock = new ClaudeChat(
      createConfig({
        modelName: "claude-opus-4-8",
      })
    );
    assert.equal(
      globalOpusBedrock.modelName,
      "global.anthropic.claude-opus-4-8-v1:0"
    );

    delete process.env.AWS_INFERENCE_PROFILE;

    const datedOpusBedrock = new ClaudeChat(
      createConfig({
        modelName: "claude-opus-4-20250514",
      })
    );
    assert.equal(
      datedOpusBedrock.modelName,
      "eu.anthropic.claude-opus-4-20250514-v1:0"
    );

    const defaultGlobalBedrock = new ClaudeChat(
      createConfig({
        modelName: "claude-opus-4-5-20251101",
      })
    );
    assert.equal(
      defaultGlobalBedrock.modelName,
      "global.anthropic.claude-opus-4-5-20251101-v1:0"
    );
  });

  it("detects current adaptive-thinking and fast-mode Claude model families", () => {
    delete process.env.AWS_BEARER_TOKEN_BEDROCK;
    delete process.env.USE_VERTEX_FOR_CLAUDE;
    delete process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE;

    const fable = new ClaudeChat(
      createConfig({
        modelName: "claude-fable-5",
        reasoningEffort: "medium",
      })
    );
    assert.equal(Reflect.get(fable, "useAdaptiveThinking"), true);
    assert.equal(Reflect.get(fable, "useFastMode"), false);

    const mythos = new ClaudeChat(
      createConfig({
        modelName: "claude-mythos-5",
        reasoningEffort: "medium",
      })
    );
    assert.equal(Reflect.get(mythos, "useAdaptiveThinking"), true);

    const sonnet46 = new ClaudeChat(
      createConfig({
        modelName: "claude-sonnet-4-6-20260301",
        inferenceType: "fast",
        reasoningEffort: "medium",
      })
    );
    assert.equal(Reflect.get(sonnet46, "useAdaptiveThinking"), true);
    assert.equal(Reflect.get(sonnet46, "useFastMode"), false);

    const haiku45 = new ClaudeChat(
      createConfig({
        modelName: "claude-haiku-4-5",
        reasoningEffort: "medium",
      })
    );
    assert.equal(Reflect.get(haiku45, "useAdaptiveThinking"), false);

    for (const modelName of [
      "claude-opus-4-6",
      "claude-opus-4-7",
      "claude-opus-4-8",
    ]) {
      const fastModel = new ClaudeChat(
        createConfig({
          modelName,
          inferenceType: "fast",
        })
      );
      assert.equal(Reflect.get(fastModel, "useFastMode"), true);
    }
  });

  it("uses adaptive thinking request shape for Claude 5-family models", async () => {
    delete process.env.AWS_BEARER_TOKEN_BEDROCK;
    delete process.env.USE_VERTEX_FOR_CLAUDE;
    delete process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE;

    const model = new ClaudeChat(
      createConfig({
        modelName: "claude-fable-5",
        reasoningEffort: "medium",
        temperature: 0.2,
      })
    );

    let captured: RecordedClaudeRequest | undefined;
    setMockClient(model, {
      messages: {
        create: async (params) => {
          captured = params as RecordedClaudeRequest;
          return {
            id: "claude-fable-5-response",
            usage: {
              input_tokens: 5,
              output_tokens: 2,
            },
            content: [{ type: "text", text: "Fable response" }],
          };
        },
        stream: async () => {
          throw new Error("messages.stream should not be used in this test");
        },
      },
      beta: {
        messages: {
          create: async () => {
            throw new Error("beta.messages.create should not be used in this test");
          },
          stream: async () => {
            throw new Error("beta.messages.stream should not be used in this test");
          },
        },
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.model, "claude-fable-5");
    assert.equal(captured.temperature, 1);
    assert.deepEqual(captured.thinking, { type: "adaptive" });
    assert.deepEqual(captured.output_config, { effort: "medium" });
    assert.equal(captured.stream, false);
    assert.equal(result?.content, "Fable response");
  });

  it("formats messages, sanitizes tool ids, filters tools, and maps tool choices", () => {
    const model = new ClaudeChat(
      createConfig({
        parallelToolCalls: false,
      })
    );
    const internals = asInternals(model);

    const formatted = internals.formatMessages(
      [
        { role: "system", message: "system prompt" },
        { role: "developer", message: "developer prompt" },
        { role: "user", message: "hello" },
        {
          role: "assistant",
          message: "commentary",
          phase: "commentary",
        },
        {
          role: "assistant",
          message: "calling tool",
          toolCall: {
            id: "tool:1",
            name: "lookup",
            arguments: { id: 1 },
          },
        },
      ],
      [
        { mimeType: "image/png", data: "abc123" },
        { mimeType: "text/plain", data: "skip-me" },
      ]
    );

    assert.deepEqual(formatted.system, [
      {
        type: "text",
        text: "system prompt\n\ndeveloper prompt",
        cache_control: { type: "ephemeral" },
      },
    ]);
    assert.deepEqual(formatted.messages, [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: "abc123",
            },
          },
          { type: "text", text: "hello" },
        ],
      },
      {
        role: "assistant",
        content: [
          { type: "text", text: "calling tool" },
          {
            type: "tool_use",
            id: "tool_1",
            name: "lookup",
            input: { id: 1 },
          },
        ],
      },
    ]);

    const builtTools = internals.buildTools(
      [
        {
          type: "function",
          function: {
            name: "lookup",
            description: "Lookup data",
            parameters: {
              properties: {
                id: { type: "number" },
              },
            },
          },
        },
        {
          type: "function",
          function: {
            name: "ignore",
            description: "Ignored tool",
            parameters: {
              properties: {
                query: { type: "string" },
              },
            },
          },
        },
      ],
      ["lookup"]
    );

    assert.deepEqual(builtTools, [
      {
        name: "lookup",
        description: "Lookup data",
        input_schema: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
      },
    ]);

    assert.deepEqual(internals.mapToolChoice("required", true), {
      type: "any",
      disable_parallel_tool_use: true,
    });
    assert.deepEqual(
      internals.mapToolChoice(
        { type: "function", function: { name: "lookup" } },
        true
      ),
      {
        type: "tool",
        name: "lookup",
        disable_parallel_tool_use: true,
      }
    );
    assert.deepEqual(internals.mapToolChoice("none", true), {
      type: "none",
    });
    assert.equal(internals.mapToolChoice("auto", false), undefined);

    assert.deepEqual(internals.normalizeToolInput({ id: 1 }), { id: 1 });
    assert.deepEqual(internals.normalizeToolInput('{"id":2}'), { id: 2 });
    assert.deepEqual(internals.normalizeToolInput("plain"), { value: "plain" });
    assert.deepEqual(internals.normalizeToolInput(4), { value: 4 });
    assert.equal(
      internals.getTextTypeFromContent([
        { type: "text", text: "Hello" },
        { type: "tool_use", name: "lookup" },
        { type: "text", text: " Claude" },
      ]),
      "Hello Claude"
    );
  });

  it("falls back for missing assistant tool ids and unsupported roles", () => {
    const model = new ClaudeChat(
      createConfig({
        parallelToolCalls: false,
      })
    );
    const internals = asInternals(model);

    const formatted = internals.formatMessages([
      {
        role: "assistant",
        message: "",
        toolCall: {
          id: "",
          name: "lookup",
          arguments: {},
        },
      },
      {
        role: "critic",
        message: "skip me",
      },
    ]);

    const assistantContent = formatted.messages[0]
      .content as Array<Record<string, unknown>>;

    assert.equal(formatted.messages.length, 1);
    assert.equal(assistantContent[0].type, "tool_use");
    assert.equal(String(assistantContent[0].id).startsWith("fallback_"), true);
    assert.deepEqual(assistantContent[0].input, {});
    assert.equal(
      String(internals.sanitizeToolId(undefined)).startsWith("fallback_"),
      true
    );
    assert.deepEqual(internals.buildTools([], []), []);
    assert.deepEqual(internals.mapToolChoice("auto", true), {
      type: "auto",
      disable_parallel_tool_use: true,
    });
    assert.deepEqual(
      internals.mapToolChoice(
        { type: "custom" } as unknown as ChatCompletionToolChoiceOption,
        true
      ),
      {
        type: "auto",
        disable_parallel_tool_use: true,
      }
    );
    assert.deepEqual(internals.normalizeToolInput(null), {});
    assert.deepEqual(internals.normalizeToolInput([1, 2]), { value: [1, 2] });
    assert.deepEqual(internals.normalizeToolInput("[1,2]"), { value: "[1,2]" });

    const userWithUndefinedText = internals.formatMessages([
      {
        role: "user",
        message: undefined,
      } as unknown as PsModelMessage,
    ]);
    assert.deepEqual(userWithUndefinedText.messages, [
      {
        role: "user",
        content: [{ type: "text", text: "" }],
      },
    ]);
  });

  it("formats tool results as Claude user tool_result blocks", () => {
    const model = new ClaudeChat(createConfig());
    const internals = asInternals(model);

    const formatted = internals.formatMessages([
      {
        role: "tool",
        name: "lookup",
        message: '{"ok":true}',
        toolCallId: "tool:result",
      },
    ]);

    assert.deepEqual(formatted.messages, [
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tool_result",
            content: '{"ok":true}',
          },
        ],
      },
    ]);

    const missingToolCallId = internals.formatMessages([
      {
        role: "tool",
        name: "lookup",
        message: "",
      },
    ]);

    const missingToolResult = missingToolCallId.messages[0].content as Array<Record<string, unknown>>;
    assert.equal(missingToolCallId.messages[0].role, "user");
    assert.equal(missingToolResult[0].tool_use_id, "lookup");

    const missingToolIdentifiers = internals.formatMessages([
      {
        role: "tool",
        message: "",
      },
    ]);

    const fallbackToolResult = missingToolIdentifiers.messages[0]
      .content as Array<Record<string, unknown>>;
    assert.equal(fallbackToolResult[0].tool_use_id, "tool_call");

    const mediaOnly = internals.formatMessages(
      [{ role: "assistant", message: "", toolCall: undefined }],
      [{ mimeType: "image/jpeg", data: "jpegdata" }]
    );

    assert.deepEqual(mediaOnly.messages, [
      {
        role: "assistant",
        content: [{ type: "text", text: "" }],
      },
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: "jpegdata",
            },
          },
        ],
      },
    ]);

    const unsupportedMediaOnly = internals.formatMessages(
      [],
      [{ mimeType: "text/plain", data: "skip-me" }]
    );
    assert.deepEqual(unsupportedMediaOnly.messages, []);
  });

  it("uses the non-beta create path for legacy Claude models and injects a blank user when needed", async () => {
    delete process.env.AWS_BEARER_TOKEN_BEDROCK;
    delete process.env.USE_VERTEX_FOR_CLAUDE;
    delete process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE;

    const model = new ClaudeChat(
      createConfig({
        modelName: "claude-3-opus-20240229",
        reasoningEffort: "medium",
      })
    );

    let captured: RecordedClaudeRequest | undefined;
    setMockClient(model, {
      messages: {
        create: async (params) => {
          captured = params as RecordedClaudeRequest;
          return {
            id: "claude-legacy-1",
            usage: {
              input_tokens: 12,
              output_tokens: 3,
              cache_creation_input_tokens: 2,
              cache_read_input_tokens: 5,
              service_tier: "standard",
            },
            content: [{ type: "text", text: "Legacy Claude" }],
          };
        },
        stream: async () => {
          throw new Error("messages.stream should not be used in this test");
        },
      },
      beta: {
        messages: {
          create: async () => {
            throw new Error("beta.messages.create should not be used in this test");
          },
          stream: async () => {
            throw new Error("beta.messages.stream should not be used in this test");
          },
        },
      },
    });

    const result = await model.generate([]);

    assert.ok(captured);
    assert.equal(captured.stream, false);
    assert.equal(captured.model, "claude-3-opus-20240229");
    assert.equal(captured.temperature, 1);
    assert.deepEqual(captured.thinking, {
      type: "enabled",
      budget_tokens: 32000,
    });
    assert.equal(captured.output_config, undefined);
    assert.equal(captured.tools, undefined);
    assert.equal(captured.tool_choice, undefined);
    assert.deepEqual(captured.messages, [
      {
        role: "user",
        content: [{ type: "text", text: "" }],
      },
    ]);

    assert.equal(result?.content, "Legacy Claude");
    assert.equal(result?.tokensIn, 15);
    assert.equal(result?.tokensOut, 3);
    assert.equal(result?.cachedInTokens, 2);
    assert.equal(result?.usageItemData?.providerMetadata?.transport, "anthropic");
    assert.equal(result?.usageItemData?.request?.mode, "non_stream");
  });

  it("throws clearly when the Anthropic client is missing and maps high thinking budget", async () => {
    const highThinkingModel = new ClaudeChat(
      createConfig({
        reasoningEffort: "high",
      })
    );
    assert.equal(Reflect.get(highThinkingModel, "maxThinkingTokens"), 64_000);

    Reflect.set(highThinkingModel, "client", undefined);

    await assert.rejects(
      () => highThinkingModel.generate([{ role: "user", message: "hello" }]),
      /Anthropic client not initialized/
    );
  });

  it("uses the non-beta Bedrock create path for legacy models and records Bedrock metadata", async () => {
    process.env.AWS_BEARER_TOKEN_BEDROCK = "token";
    process.env.AWS_DEFAULT_REGION = "us-west-2";
    delete process.env.AWS_INFERENCE_PROFILE;
    delete process.env.USE_VERTEX_FOR_CLAUDE;
    delete process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE;

    const model = new ClaudeChat(
      createConfig({
        modelName: "claude-3-5-sonnet-20241022",
        inferenceType: "fast",
        reasoningEffort: "low",
      })
    );

    let captured: RecordedClaudeRequest | undefined;
    setMockClient(model, {
      messages: {
        create: async (params) => {
          captured = params as RecordedClaudeRequest;
          return {
            id: "claude-bedrock-legacy",
            service_tier: "standard",
            usage: {
              input_tokens: 4,
              output_tokens: 2,
              cache_creation_input_tokens: 0,
              cache_read_input_tokens: 10,
              service_tier: "standard",
            },
            content: [{ type: "text", text: "Bedrock legacy" }],
          };
        },
        stream: async () => {
          throw new Error("messages.stream should not be used in this test");
        },
      },
      beta: {
        messages: {
          create: async () => {
            throw new Error("beta.messages.create should not be used in this test");
          },
          stream: async () => {
            throw new Error("beta.messages.stream should not be used in this test");
          },
        },
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(
      captured.model,
      "eu.anthropic.claude-3-5-sonnet-20241022-v2:0"
    );
    assert.equal(captured.temperature, 1);
    assert.deepEqual(captured.thinking, {
      type: "enabled",
      budget_tokens: 8000,
    });
    assert.equal(captured.output_config, undefined);
    assert.equal(captured.stream, false);
    assert.equal(result?.content, "Bedrock legacy");
    assert.equal(result?.usageItemData?.request?.requestedInferenceType, "fast");
    assert.equal(result?.usageItemData?.request?.requestedSpeed, null);
    assert.equal(result?.usageItemData?.providerMetadata?.transport, "bedrock");
    assert.equal(result?.usageItemData?.providerMetadata?.bedrockRegion, "us-west-2");
    assert.equal(result?.usageItemData?.providerMetadata?.appliedServiceTier, "standard");
  });

  it("uses Bedrock fallback region metadata when no AWS region is configured", async () => {
    process.env.AWS_BEARER_TOKEN_BEDROCK = "token";
    delete process.env.AWS_REGION;
    delete process.env.AWS_DEFAULT_REGION;
    delete process.env.AWS_INFERENCE_PROFILE;
    delete process.env.USE_VERTEX_FOR_CLAUDE;
    delete process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE;
    process.env.PS_DEBUG_PROMPT_MESSAGES = "true";

    const model = new ClaudeChat(
      createConfig({
        modelName: "claude-3-haiku-20240307",
        inferenceType: "fast",
      })
    );

    let captured: RecordedClaudeRequest | undefined;
    setMockClient(model, {
      messages: {
        create: async (params) => {
          captured = params as RecordedClaudeRequest;
          return {
            id: "claude-bedrock-default-region",
            usage: {
              input_tokens: 1,
              output_tokens: 1,
            },
            content: [{ type: "text", text: "Bedrock default region" }],
          };
        },
        stream: async () => {
          throw new Error("messages.stream should not be used in this test");
        },
      },
      beta: {
        messages: {
          create: async () => {
            throw new Error("beta.messages.create should not be used in this test");
          },
          stream: async () => {
            throw new Error("beta.messages.stream should not be used in this test");
          },
        },
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.model, "eu.anthropic.claude-3-haiku-20240307-v1:0");
    assert.equal(captured.tool_choice, undefined);
    assert.equal(result?.content, "Bedrock default region");
    assert.equal(result?.usageItemData?.request?.requestedInferenceType, "fast");
    assert.equal(result?.usageItemData?.request?.requestedSpeed, null);
    assert.equal(result?.usageItemData?.providerMetadata?.bedrockRegion, "eu-west-1");
  });

  it("uses the non-beta Vertex create path and records Vertex transport metadata", async () => {
    process.env.USE_VERTEX_FOR_CLAUDE = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    process.env.GOOGLE_CLOUD_LOCATION = "us-central1";
    delete process.env.AWS_BEARER_TOKEN_BEDROCK;

    const model = new ClaudeChat(
      createConfig({
        modelName: "claude-3-haiku-20240307",
      })
    );

    let captured: RecordedClaudeRequest | undefined;
    setMockClient(model, {
      messages: {
        create: async (params) => {
          captured = params as RecordedClaudeRequest;
          return {
            id: "claude-vertex-1",
            usage: {
              input_tokens: 2,
              output_tokens: 1,
              service_tier: "standard",
            },
            content: [{ type: "text", text: "Vertex Claude" }],
          };
        },
        stream: async () => {
          throw new Error("messages.stream should not be used in this test");
        },
      },
      beta: {
        messages: {
          create: async () => {
            throw new Error("beta.messages.create should not be used in this test");
          },
          stream: async () => {
            throw new Error("beta.messages.stream should not be used in this test");
          },
        },
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.model, "claude-3-haiku@20240307");
    assert.equal(result?.content, "Vertex Claude");
    assert.equal(result?.usageItemData?.providerMetadata?.transport, "vertex");
    assert.equal(result?.usageItemData?.providerMetadata?.vertexRegion, "us-central1");
  });

  it("records the default Claude Vertex region when no region env is set", async () => {
    process.env.USE_VERTEX_FOR_CLAUDE = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    delete process.env.GOOGLE_CLOUD_LOCATION;
    delete process.env.GOOGLE_VERTEX_LOCATION;
    delete process.env.CLOUD_ML_REGION;
    delete process.env.AWS_BEARER_TOKEN_BEDROCK;

    const model = new ClaudeChat(
      createConfig({
        modelName: "claude-3-haiku-20240307",
      })
    );

    setMockClient(model, {
      messages: {
        create: async () => ({
          id: "claude-vertex-default-region",
          usage: {
            input_tokens: 1,
            output_tokens: 1,
          },
          content: [{ type: "text", text: "Vertex default region" }],
        }),
        stream: async () => {
          throw new Error("messages.stream should not be used in this test");
        },
      },
      beta: {
        messages: {
          create: async () => {
            throw new Error("beta.messages.create should not be used in this test");
          },
          stream: async () => {
            throw new Error("beta.messages.stream should not be used in this test");
          },
        },
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.equal(result?.content, "Vertex default region");
    assert.equal(result?.usageItemData?.providerMetadata?.vertexRegion, "europe-west1");
  });

  it("uses the beta create path for fast adaptive models and normalizes the result", async () => {
    const model = new ClaudeChat(
      createConfig({
        modelName: "claude-opus-4-6",
        inferenceType: "priority",
        reasoningEffort: "xhigh",
        parallelToolCalls: false,
        maxTokensOut: 512,
        temperature: 0.2,
      })
    );

    let captured: RecordedClaudeRequest | undefined;
    setMockClient(model, {
      messages: {
        create: async () => {
          throw new Error("messages.create should not be used in this test");
        },
        stream: async () => {
          throw new Error("messages.stream should not be used in this test");
        },
      },
      beta: {
        messages: {
          create: async (params) => {
            captured = params as RecordedClaudeRequest;
            return {
              id: "claude-resp-1",
              speed: "fast",
              usage: {
                input_tokens: 10,
                output_tokens: 5,
                cache_creation_input_tokens: 4,
                cache_read_input_tokens: 10,
                service_tier: "priority",
              },
              content: [
                { type: "text", text: "Hello Claude" },
                {
                  type: "tool_use",
                  id: "call-1",
                  name: "lookup",
                  input: '{"id":1}',
                },
              ],
            };
          },
          stream: async () => {
            throw new Error("beta.messages.stream should not be used in this test");
          },
        },
      },
    });

    const result = await model.generate(
      [
        { role: "system", message: "system prompt" },
        { role: "user", message: "hello" },
      ],
      false,
      undefined,
      undefined,
      [
        {
          type: "function",
          function: {
            name: "lookup",
            description: "Lookup data",
            parameters: {
              properties: {
                id: { type: "number" },
              },
            },
          },
        },
        {
          type: "function",
          function: {
            name: "ignore",
            description: "Ignored tool",
            parameters: {},
          },
        },
      ],
      "required",
      ["lookup"]
    );

    assert.ok(captured);
    assert.equal(captured.model, "claude-opus-4-6");
    assert.equal(captured.max_tokens, 512);
    assert.equal(captured.temperature, 1);
    assert.deepEqual(captured.thinking, { type: "adaptive" });
    assert.deepEqual(captured.output_config, { effort: "max" });
    assert.deepEqual(captured.tool_choice, {
      type: "any",
      disable_parallel_tool_use: true,
    });
    assert.deepEqual(captured.tools, [
      {
        name: "lookup",
        description: "Lookup data",
        input_schema: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
      },
    ]);
    assert.deepEqual(captured.system, [
      {
        type: "text",
        text: "system prompt",
        cache_control: { type: "ephemeral" },
      },
    ]);
    assert.deepEqual(captured.betas, ["fast-mode-2026-02-01"]);
    assert.equal(captured.speed, "fast");
    assert.equal(captured.stream, false);

    assert.equal(result?.content, "Hello Claude");
    assert.equal(result?.tokensIn, 16);
    assert.equal(result?.tokensOut, 5);
    assert.equal(result?.cachedInTokens, 4);
    assert.deepEqual(result?.toolCalls, [
      {
        id: "call-1",
        name: "lookup",
        arguments: { id: 1 },
      },
    ]);
    assert.equal(result?.usageItemData?.request?.requestedInferenceType, "priority");
    assert.equal(result?.usageItemData?.request?.requestedSpeed, "fast");
    assert.equal(result?.usageItemData?.providerMetadata?.appliedSpeed, "fast");
  });

  it("uses the context beta path without fast mode and preserves auto tool choice", async () => {
    process.env.USE_CLAUDE_1M_CONTEXT_BETA_FLAG = "true";

    const model = new ClaudeChat(
      createConfig({
        modelName: "claude-3-5-sonnet-20241022",
      })
    );

    let captured: RecordedClaudeRequest | undefined;
    setMockClient(model, {
      messages: {
        create: async () => {
          throw new Error("messages.create should not be used in this test");
        },
        stream: async () => {
          throw new Error("messages.stream should not be used in this test");
        },
      },
      beta: {
        messages: {
          create: async (params) => {
            captured = params as RecordedClaudeRequest;
            return {
              id: "claude-beta-context",
              usage: {
                input_tokens: 3,
                output_tokens: 2,
              },
              content: [{ type: "text", text: "Context beta" }],
            };
          },
          stream: async () => {
            throw new Error("beta.messages.stream should not be used in this test");
          },
        },
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
            description: "Lookup data",
            parameters: {},
          },
        },
      ],
      "auto"
    );

    assert.ok(captured);
    assert.deepEqual(captured.betas, ["context-1m-2025-08-07"]);
    assert.equal(captured.speed, undefined);
    assert.deepEqual(captured.tool_choice, {
      type: "auto",
      disable_parallel_tool_use: undefined,
    });
    assert.equal(captured.temperature, 0.4);
    assert.equal(result?.content, "Context beta");
    assert.equal(
      result?.usageItemData?.providerMetadata?.contextBeta,
      "context-1m-2025-08-07"
    );
    assert.equal(result?.usageItemData?.providerMetadata?.fastModeBeta, null);
  });

  it("uses the non-beta stream path for legacy models and preserves streamed tool calls", async () => {
    delete process.env.AWS_BEARER_TOKEN_BEDROCK;
    delete process.env.USE_VERTEX_FOR_CLAUDE;
    delete process.env.USE_GOOGLE_VERTEX_AI_FOR_CLAUDE;

    const model = new ClaudeChat(
      createConfig({
        modelName: "claude-3-opus-20240229",
      })
    );

    let captured: RecordedClaudeRequest | undefined;
    const streamedEvents: unknown[] = [];
    setMockClient(model, {
      messages: {
        create: async () => {
          throw new Error("messages.create should not be used in this test");
        },
        stream: async (params) => {
          captured = params as RecordedClaudeRequest;
          return {
            async *[Symbol.asyncIterator]() {
              yield {
                type: "content_block_start",
                content_block: { type: "text", text: "Legacy " },
              };
              yield {
                type: "content_block_delta",
                delta: { type: "text_delta", text: "stream" },
              };
              yield {
                type: "content_block_start",
                content_block: {
                  type: "tool_use",
                  id: "call-legacy",
                  name: "lookup",
                  input: { id: 1 },
                },
              };
            },
            async finalMessage() {
              return {
                id: "claude-legacy-stream",
                usage: {
                  input_tokens: 6,
                  output_tokens: 1,
                  cache_creation_input_tokens: 0,
                  cache_read_input_tokens: 10,
                  service_tier: "standard",
                },
                content: [{ type: "text", text: "Legacy stream" }],
              };
            },
          };
        },
      },
      beta: {
        messages: {
          create: async () => {
            throw new Error("beta.messages.create should not be used in this test");
          },
          stream: async () => {
            throw new Error("beta.messages.stream should not be used in this test");
          },
        },
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (event: unknown) => streamedEvents.push(event)
    );

    assert.ok(captured);
    assert.equal(captured.betas, undefined);
    assert.equal(streamedEvents.length, 3);
    assert.equal(result?.content, "Legacy stream");
    assert.equal(result?.tokensIn, 7);
    assert.deepEqual(result?.toolCalls, [
      {
        id: "call-legacy",
        name: "lookup",
        arguments: { id: 1 },
      },
    ]);
    assert.equal(result?.usageItemData?.request?.mode, "stream");
    assert.equal(result?.usageItemData?.providerMetadata?.transport, "anthropic");
  });

  it("streams Claude content blocks and merges streamed and final tool calls", async () => {
    const model = new ClaudeChat(
      createConfig({
        modelName: "claude-opus-4-6",
        inferenceType: "priority",
      })
    );

    let captured: RecordedClaudeRequest | undefined;
    const streamedEvents: unknown[] = [];
    setMockClient(model, {
      messages: {
        create: async () => {
          throw new Error("messages.create should not be used in this test");
        },
        stream: async () => {
          throw new Error("messages.stream should not be used in this test");
        },
      },
      beta: {
        messages: {
          create: async () => {
            throw new Error("beta.messages.create should not be used in this test");
          },
          stream: async (params) => {
            captured = params as RecordedClaudeRequest;

            const events = [
              {
                type: "content_block_start",
                content_block: { type: "text", text: "Hello " },
              },
              {
                type: "content_block_delta",
                delta: { type: "text_delta", text: "world" },
              },
              {
                type: "content_block_start",
                content_block: {
                  type: "tool_use",
                  id: "call-1",
                  name: "lookup",
                  input: { id: 1 },
                },
              },
            ];

            return {
              async *[Symbol.asyncIterator]() {
                for (const event of events) {
                  yield event;
                }
              },
              async finalMessage() {
                return {
                  id: "claude-stream-1",
                  speed: "fast",
                  usage: {
                    input_tokens: 8,
                    output_tokens: 2,
                    cache_creation_input_tokens: 0,
                    cache_read_input_tokens: 0,
                    service_tier: "priority",
                  },
                  content: [
                    { type: "text", text: "Hello world" },
                    {
                      type: "tool_use",
                      id: "call-1",
                      name: "lookup",
                      input: { id: 1 },
                    },
                    {
                      type: "tool_use",
                      id: "call-2",
                      name: "lookupMore",
                      input: "{",
                    },
                  ],
                };
              },
            };
          },
        },
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (event: unknown) => streamedEvents.push(event)
    );

    assert.ok(captured);
    assert.equal(captured.speed, "fast");
    assert.deepEqual(captured.betas, ["fast-mode-2026-02-01"]);
    assert.equal(streamedEvents.length, 3);
    assert.equal(result?.content, "Hello world");
    assert.deepEqual(result?.toolCalls, [
      {
        id: "call-1",
        name: "lookup",
        arguments: { id: 1 },
      },
      {
        id: "call-2",
        name: "lookupMore",
        arguments: { value: "{" },
      },
    ]);
    assert.equal(result?.usageItemData?.request?.mode, "stream");
  });

  it("estimates token counts from joined message text", async () => {
    const model = new ClaudeChat(createConfig());
    const internals = asInternals(model);

    const estimatedTokens = await internals.getEstimatedNumTokensFromMessages([
      { role: "user", message: "hello" },
      { role: "assistant", message: "world" },
    ]);

    assert.equal(Number.isInteger(estimatedTokens), true);
    assert.equal(estimatedTokens > 0, true);
  });
});
