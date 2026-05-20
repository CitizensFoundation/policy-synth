import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";

process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DB_PORT ??= "5432";

const { OpenAiResponses } = await import("../../aiModels/openAiResponses.js");
type OpenAiResponsesInstance = InstanceType<typeof OpenAiResponses>;

type RecordedResponsesRequest = {
  input?: unknown[];
  instructions?: string;
  tools?: unknown[];
  tool_choice?: unknown;
  include?: unknown[];
  temperature?: number;
  max_output_tokens?: number;
  safety_identifier?: string;
  service_tier?: string;
  previous_response_id?: string;
  reasoning?: {
    effort?: string;
  };
  model?: string;
  stream?: boolean;
  store?: boolean;
};

type ResponsesClientMock = {
  create: (params: unknown) => Promise<unknown>;
};

type OpenAiResponsesInternals = {
  mapToolsForResponses: (tools: ChatCompletionTool[]) => unknown[];
  mapBuiltInToolsForResponses: (builtInTools?: PsBuiltInTool[]) => unknown[];
  mapBuiltInToolIncludes: (builtInTools?: PsBuiltInTool[]) => unknown[];
  mapToolChoiceForResponses: (
    toolChoice: ChatCompletionToolChoiceOption | "auto" | undefined
  ) => unknown;
  preprocessForResponses: (
    msgs: PsModelMessage[],
    hasPreviousResponses: boolean,
    lastSubmittedMessageCount: number
  ) => {
    inputItems: unknown[];
    instructions?: string;
    pendingToolCallIds: string[];
  };
  buildResponseMessageItem: (
    role: string,
    content: string,
    phase?: PsAssistantMessagePhase
  ) => Record<string, unknown>;
  buildUsageItemData: (
    response: {
      id?: string | null;
      previous_response_id?: string | null;
      service_tier?: string | null;
      usage?: Record<string, unknown> | null;
      output?: unknown;
    },
    params: {
      stream?: boolean;
      tool_choice?: unknown;
      tools?: unknown[];
      include?: unknown[];
      store?: boolean;
      service_tier?: string | null;
      previous_response_id?: string | null;
      model?: string;
    },
    usage: {
      tokensIn: number;
      tokensOut: number;
      cachedInTokens: number;
      reasoningTokens: number;
      audioTokens: number;
    }
  ) => PsModelUsageItemProviderData & Record<string, unknown>;
  extractBuiltInToolMetadata: (
    response: unknown
  ) => Record<string, unknown> | undefined;
  attachImagesToLastUserMessage: (
    inputItems: Array<Record<string, unknown>>,
    images?: Array<{ mimeType: string; data: string } | { url: string }>,
    detail?: "low" | "medium" | "high" | "auto"
  ) => void;
  extractTextFromResponse: (resp: unknown) => string;
  selectAssistantReply: (
    resp: unknown
  ) => { content: string; phase?: PsAssistantMessagePhase };
  extractOrderedOutputItems: (resp: unknown) => PsResponseOutputItem[];
  extractToolCallsFromResponse: (resp: unknown) => ToolCall[];
  isPhaseAwareResponsesModel: () => boolean;
  resetResponsesState: () => void;
};

const createConfig = (
  overrides: Partial<PsOpenAiModelConfig> = {}
): PsOpenAiModelConfig => ({
  apiKey: "responses-test-key",
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

const asInternals = (model: OpenAiResponsesInstance) =>
  model as unknown as OpenAiResponsesInternals;

const setMockClient = (model: object, responses: ResponsesClientMock) => {
  Reflect.set(model, "client", { responses });
};

const originalOpenAiOverride = process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY;
const originalEnforceEuRegion = process.env.OPENAI_ENFORCE_EU_REGION;
const originalAzureKey = process.env.AZURE_OPENAI_KEY;
const originalAzureEndpoint = process.env.AZURE_ENDPOINT;
const originalAzureDeployment = process.env.AZURE_DEPLOYMENT_NAME;
const originalAzureApiVersion = process.env.AZURE_OPENAI_API_VERSION;
const originalPsAiModelName = process.env.PS_AI_MODEL_NAME;
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

  if (originalAzureKey === undefined) {
    delete process.env.AZURE_OPENAI_KEY;
  } else {
    process.env.AZURE_OPENAI_KEY = originalAzureKey;
  }

  if (originalAzureEndpoint === undefined) {
    delete process.env.AZURE_ENDPOINT;
  } else {
    process.env.AZURE_ENDPOINT = originalAzureEndpoint;
  }

  if (originalAzureDeployment === undefined) {
    delete process.env.AZURE_DEPLOYMENT_NAME;
  } else {
    process.env.AZURE_DEPLOYMENT_NAME = originalAzureDeployment;
  }

  if (originalAzureApiVersion === undefined) {
    delete process.env.AZURE_OPENAI_API_VERSION;
  } else {
    process.env.AZURE_OPENAI_API_VERSION = originalAzureApiVersion;
  }

  if (originalPsAiModelName === undefined) {
    delete process.env.PS_AI_MODEL_NAME;
  } else {
    process.env.PS_AI_MODEL_NAME = originalPsAiModelName;
  }

  if (originalDebugPromptMessages === undefined) {
    delete process.env.PS_DEBUG_PROMPT_MESSAGES;
  } else {
    process.env.PS_DEBUG_PROMPT_MESSAGES = originalDebugPromptMessages;
  }
});

describe("OpenAiResponses", () => {
  it("maps tools, tool choices, and image attachments for phase-aware models", () => {
    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.3",
      })
    );
    const internals = asInternals(model);

    assert.equal(internals.isPhaseAwareResponsesModel(), true);
    assert.equal(model.getCloneConfig().modelName, "gpt-5.3");
    assert.deepEqual(internals.mapToolsForResponses([]), []);

    const tools: ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "lookup",
          description: "Lookup data",
          parameters: {
            type: "object",
            properties: {
              id: { type: "number" },
            },
          },
        },
      },
    ];
    const passthroughTool = {
      type: "web_search_preview",
      user_location: {
        type: "approximate",
      },
    } as unknown as ChatCompletionTool;
    const strictTool = {
      type: "function",
      strict: true,
      function: {
        name: "strictLookup",
        parameters: {
          type: "object",
        },
      },
    } as unknown as ChatCompletionTool;
    const missingFunctionTool = {
      type: "function",
    } as unknown as ChatCompletionTool;

    assert.deepEqual(internals.mapToolsForResponses([
      ...tools,
      passthroughTool,
      strictTool,
      missingFunctionTool,
    ]), [
      {
        type: "function",
        name: "lookup",
        description: "Lookup data",
        parameters: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
      },
      passthroughTool,
      {
        type: "function",
        name: "strictLookup",
        description: undefined,
        parameters: {
          type: "object",
        },
        strict: true,
      },
      {
        type: "function",
        name: undefined,
        description: undefined,
        parameters: undefined,
      },
    ]);
    assert.deepEqual(
      internals.mapToolChoiceForResponses({
        type: "function",
        function: { name: "lookup" },
      }),
      {
        type: "function",
        name: "lookup",
      }
    );
    assert.equal(
      internals.mapToolChoiceForResponses("none"),
      "none"
    );
    assert.equal(internals.mapToolChoiceForResponses("auto"), "auto");
    assert.equal(internals.mapToolChoiceForResponses(undefined), "auto");
    assert.deepEqual(
      internals.mapToolChoiceForResponses({
        type: "custom",
      } as unknown as ChatCompletionToolChoiceOption),
      {
        type: "custom",
      }
    );
    assert.deepEqual(
      internals.mapToolChoiceForResponses({
        type: "function",
        function: {},
      } as unknown as ChatCompletionToolChoiceOption),
      {
        type: "function",
        function: {},
      }
    );
    assert.equal(
      internals.mapToolChoiceForResponses(
        "required" as unknown as ChatCompletionToolChoiceOption
      ),
      "auto"
    );

    const items: Array<Record<string, unknown>> = [
      { role: "user", content: "hello" },
    ];
    internals.attachImagesToLastUserMessage(
      items,
      [{ mimeType: "image/png", data: "abc123" }],
      "high"
    );
    assert.deepEqual(items, [
      {
        role: "user",
        content: [
          { type: "input_text", text: "hello" },
          {
            type: "input_image",
            image_url: "data:image/png;base64,abc123",
            detail: "high",
          },
        ],
      },
    ]);

    const unchangedItems: Array<Record<string, unknown>> = [
      { role: "user", content: "plain" },
    ];
    internals.attachImagesToLastUserMessage(unchangedItems, []);
    internals.attachImagesToLastUserMessage(unchangedItems);
    assert.deepEqual(unchangedItems, [{ role: "user", content: "plain" }]);

    const itemsWithoutUser: Array<Record<string, unknown>> = [];
    internals.attachImagesToLastUserMessage(
      itemsWithoutUser,
      [{ url: "https://example.com/image.png" }],
      "low"
    );
    assert.deepEqual(itemsWithoutUser, [
      {
        role: "user",
        content: [
          {
            type: "input_image",
            image_url: "https://example.com/image.png",
            detail: "low",
          },
        ],
      },
    ]);

    const itemsWithArrayContent: Array<Record<string, unknown>> = [
      {
        role: "user",
        content: [{ type: "input_text", text: "existing" }],
      },
    ];
    internals.attachImagesToLastUserMessage(
      itemsWithArrayContent,
      [{ url: "https://example.com/image-2.png" }]
    );
    assert.deepEqual(itemsWithArrayContent, [
      {
        role: "user",
        content: [
          { type: "input_text", text: "existing" },
          {
            type: "input_image",
            image_url: "https://example.com/image-2.png",
            detail: "auto",
          },
        ],
      },
    ]);

    const itemsWithObjectContent: Array<Record<string, unknown>> = [
      {
        role: "user",
        content: { type: "unsupported" },
      },
    ];
    internals.attachImagesToLastUserMessage(
      itemsWithObjectContent,
      [{ mimeType: "image/jpeg", data: "jpeg123" }],
      "medium"
    );
    assert.deepEqual(itemsWithObjectContent, [
      {
        role: "user",
        content: [
          {
            type: "input_image",
            image_url: "data:image/jpeg;base64,jpeg123",
            detail: "medium",
          },
        ],
      },
    ]);

    assert.equal(
      new OpenAiResponses(createConfig({ modelName: "gpt-4o" }))
        .getCloneConfig()
        .modelName,
      "gpt-4o"
    );
  });

  it("maps built-in tools without turning hosted tool calls into local tool calls", async () => {
    const model = new OpenAiResponses(createConfig({ modelName: "gpt-5.5" }));
    const internals = asInternals(model);

    const builtInTools: PsBuiltInTool[] = [
      {
        type: "web_search",
        searchContextSize: "high",
        allowedDomains: ["example.com"],
        userLocation: {
          city: "Reykjavik",
          country: "IS",
          timezone: "Atlantic/Reykjavik",
        },
        includeSources: true,
      },
      {
        type: "code_interpreter",
        container: "auto",
        memoryLimit: "4g",
        fileIds: ["file-1"],
        includeOutputs: true,
      },
    ];

    assert.deepEqual(internals.mapBuiltInToolsForResponses(builtInTools), [
      {
        type: "web_search",
        search_context_size: "high",
        filters: { allowed_domains: ["example.com"] },
        user_location: {
          type: "approximate",
          city: "Reykjavik",
          country: "IS",
          timezone: "Atlantic/Reykjavik",
        },
      },
      {
        type: "code_interpreter",
        container: {
          type: "auto",
          file_ids: ["file-1"],
          memory_limit: "4g",
        },
      },
    ]);
    assert.deepEqual(
      internals.mapBuiltInToolsForResponses([
        { type: "code_interpreter", container: "container-123" },
      ]),
      [{ type: "code_interpreter", container: "container-123" }]
    );
    assert.deepEqual(internals.mapBuiltInToolIncludes(builtInTools), [
      "web_search_call.action.sources",
      "code_interpreter_call.outputs",
    ]);
    assert.deepEqual(
      internals.mapBuiltInToolIncludes([
        { type: "web_search" },
        { type: "code_interpreter" },
      ]),
      []
    );

    let captured: RecordedResponsesRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-built-in",
          output: [
            {
              type: "web_search_call",
              id: "ws-1",
              status: "completed",
              action: {
                type: "search",
                query: "policy",
                sources: [{ type: "url", url: "https://example.com/a" }],
              },
            },
            {
              type: "code_interpreter_call",
              id: "ci-1",
              status: "completed",
              container_id: "container-1",
              code: "print('ok')",
              outputs: [{ type: "logs", logs: "ok\n" }],
            },
            {
              type: "function_call",
              call_id: "call-1",
              name: "lookup",
              arguments: "{\"id\":1}",
            },
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: "done",
                  annotations: [
                    {
                      type: "url_citation",
                      start_index: 0,
                      end_index: 4,
                      title: "Example",
                      url: "https://example.com/a",
                    },
                    {
                      type: "container_file_citation",
                      start_index: 0,
                      end_index: 4,
                      container_id: "container-1",
                      file_id: "file-generated",
                      filename: "chart.png",
                    },
                  ],
                },
              ],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "research and calculate" }],
      false,
      undefined,
      undefined,
      [
        {
          type: "function",
          function: {
            name: "lookup",
            parameters: { type: "object" },
          },
        },
      ],
      "auto",
      ["lookup"],
      { builtInTools }
    );

    assert.ok(captured);
    assert.deepEqual(captured.include, [
      "web_search_call.action.sources",
      "code_interpreter_call.outputs",
    ]);
    assert.deepEqual(captured.tools, [
      {
        type: "function",
        name: "lookup",
        description: undefined,
        parameters: { type: "object" },
      },
      ...internals.mapBuiltInToolsForResponses(builtInTools),
    ]);
    assert.deepEqual(result.toolCalls, [
      { id: "call-1", name: "lookup", arguments: { id: 1 } },
    ]);
    assert.deepEqual(
      result.usageItemData?.providerMetadata?.requestedBuiltInTools,
      ["web_search", "code_interpreter"]
    );

    const metadata = result.usageItemData?.providerMetadata?.builtInTools as
      | Record<string, unknown>
      | undefined;
    assert.deepEqual(metadata?.webSearchCalls, [
      {
        id: "ws-1",
        status: "completed",
        action: {
          type: "search",
          query: "policy",
          sources: [{ type: "url", url: "https://example.com/a" }],
        },
      },
    ]);
    assert.deepEqual(metadata?.codeInterpreterCalls, [
      {
        id: "ci-1",
        status: "completed",
        containerId: "container-1",
        code: "print('ok')",
        outputs: [{ type: "logs", logs: "ok\n" }],
      },
    ]);
    assert.deepEqual(metadata?.outputTextAnnotations, [
      {
        type: "url_citation",
        start_index: 0,
        end_index: 4,
        title: "Example",
        url: "https://example.com/a",
      },
      {
        type: "container_file_citation",
        start_index: 0,
        end_index: 4,
        container_id: "container-1",
        file_id: "file-generated",
        filename: "chart.png",
      },
    ]);
  });

  it("resets truncated history and synthesizes blank input when only instructions remain", async () => {
    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.2",
        inferenceType: "flex",
      })
    );
    const internals = asInternals(model);

    assert.equal(internals.isPhaseAwareResponsesModel(), false);

    Reflect.set(model, "previousResponseId", "prev-truncated");
    Reflect.set(model, "lastSubmittedMessageCount", 3);

    let captured: RecordedResponsesRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-blank-input",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "blank input ok" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await model.generate([
      { role: "system", message: "system only" },
    ]);

    assert.ok(captured);
    assert.equal(captured.previous_response_id, undefined);
    assert.equal(captured.instructions, "system only");
    assert.equal(captured.service_tier, "flex");
    assert.deepEqual(captured.input, [{ role: "user", content: "" }]);
    assert.equal(result.content, "blank input ok");
  });

  it("treats gpt-6 models as phase-aware and preserves direct priority service tier", async () => {
    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-6",
        inferenceType: "priority",
      })
    );
    const internals = asInternals(model);

    assert.equal(internals.isPhaseAwareResponsesModel(), true);

    let captured: RecordedResponsesRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-gpt6",
          previous_response_id: null,
          service_tier: "priority",
          usage: {
            prompt_tokens: 3,
            completion_tokens: 2,
            prompt_tokens_details: { cached_tokens: 1 },
          },
          output: [
            {
              type: "message",
              phase: "final_answer",
              content: [{ type: "output_text", text: "gpt6 result" }],
            },
          ],
        };
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.service_tier, "priority");
    assert.equal(result.content, "gpt6 result");
    assert.equal(result.tokensIn, 3);
    assert.equal(result.tokensOut, 2);
    assert.equal(result.cachedInTokens, 1);
    assert.equal(result.usageItemData?.request?.requestedInferenceType, "priority");
    assert.equal(result.usageItemData?.request?.requestedServiceTier, "priority");
  });

  it("uses PS_AI_MODEL_NAME for phase awareness when config model name is absent", () => {
    process.env.PS_AI_MODEL_NAME = "gpt-5.3";

    const configWithoutModelName: Partial<PsOpenAiModelConfig> = {
      ...createConfig(),
    };
    delete configWithoutModelName.modelName;

    const model = new OpenAiResponses(
      configWithoutModelName as PsOpenAiModelConfig
    );
    const internals = asInternals(model);

    assert.equal(internals.isPhaseAwareResponsesModel(), true);
    const originalParseInt = Number.parseInt;
    Number.parseInt = (() => Number.NaN) as typeof Number.parseInt;
    try {
      assert.equal(internals.isPhaseAwareResponsesModel(), false);
    } finally {
      Number.parseInt = originalParseInt;
    }
    assert.equal(model.getCloneConfig().modelName, "gpt-5.3");
    assert.deepEqual(model.getResponsesContinuationIdentity(), {
      modelName: "gpt-5.3",
      regionalProcessing: undefined,
      transportBaseUrl: undefined,
      usingAzure: false,
    });
  });

  it("applies runtime Responses overrides without remapping Azure requests", async () => {
    const model = new OpenAiResponses(createConfig());

    model.applyRuntimeResponsesOverrides({
      inferenceType: "fast",
      maxTokensOut: 512,
      temperature: 0.2,
      reasoningEffort: "high",
      maxThinkingTokens: 1234,
    });

    assert.equal(model.getCloneConfig().inferenceType, "priority");
    assert.equal(model.getCloneConfig().maxTokensOut, 512);
    assert.equal(model.getCloneConfig().temperature, 0.2);
    assert.equal(model.getCloneConfig().reasoningEffort, "high");
    assert.equal(model.getCloneConfig().maxThinkingTokens, 1234);

    process.env.AZURE_OPENAI_KEY = "azure-key";
    process.env.AZURE_ENDPOINT = "https://azure.example.com/v1";
    process.env.AZURE_DEPLOYMENT_NAME = "azure-responses-deployment";
    process.env.PS_DEBUG_PROMPT_MESSAGES = "true";

    const azureModel = new OpenAiResponses(
      createConfig({
        inferenceType: "priority",
      })
    );
    azureModel.applyRuntimeResponsesOverrides({
      inferenceType: "fast",
    });

    let captured: RecordedResponsesRequest | undefined;
    setMockClient(azureModel, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "azure-runtime-overrides",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "azure override" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await azureModel.generate([{ role: "user", message: "hello" }]);

    assert.equal(azureModel.getCloneConfig().inferenceType, "fast");
    assert.ok(captured);
    assert.equal(captured.service_tier, undefined);
    assert.equal(result.content, "azure override");
    assert.equal(result.usageItemData?.provider, "azure");
  });

  it("covers additional Responses helper and default-config branches", () => {
    delete process.env.PS_AI_MODEL_NAME;
    delete process.env.AZURE_OPENAI_KEY;
    delete process.env.AZURE_ENDPOINT;
    delete process.env.AZURE_DEPLOYMENT_NAME;

    const configWithoutOptionalDefaults: Partial<PsOpenAiModelConfig> = {
      ...createConfig(),
    };
    delete configWithoutOptionalDefaults.modelName;
    delete configWithoutOptionalDefaults.maxTokensOut;

    const model = new OpenAiResponses(
      configWithoutOptionalDefaults as PsOpenAiModelConfig
    );
    const internals = asInternals(model);

    assert.equal(internals.isPhaseAwareResponsesModel(), false);
    assert.equal(model.getCloneConfig().modelName, "gpt-4o");
    assert.equal(model.getCloneConfig().maxTokensOut, 16_384);

    model.applyRuntimeResponsesOverrides({});
    assert.equal(model.getCloneConfig().modelName, "gpt-4o");

    const previousWithNegativeStart = internals.preprocessForResponses(
      [
        { role: "system", message: "" },
        { role: "developer", message: "" },
        { role: "user", message: "delta" },
      ],
      true,
      -3
    );
    assert.deepEqual(previousWithNegativeStart.inputItems, [
      { role: "user", content: "delta" },
    ]);
    assert.equal(previousWithNegativeStart.instructions, undefined);

    const assistantToolWithoutArgs = internals.preprocessForResponses(
      [
        {
          role: "assistant",
          message: "",
          toolCall: {
            id: "call-no-args",
            name: "lookup",
          } as ToolCall,
        },
      ],
      false,
      0
    );
    assert.deepEqual(assistantToolWithoutArgs.inputItems, [
      {
        type: "function_call",
        call_id: "call-no-args",
        name: "lookup",
        arguments: undefined,
      },
    ]);

    assert.deepEqual(
      internals.extractOrderedOutputItems({
        output: [
          {
            type: "function_call",
            id: "fallback-id",
          },
        ],
      }),
      [
        {
          type: "tool_call",
          toolCall: {
            id: "fallback-id",
            name: "",
            arguments: {},
          },
        },
      ]
    );
    assert.deepEqual(
      internals.extractToolCallsFromResponse({
        output: [
          {
            type: "function_call",
            id: "fallback-id",
          },
        ],
      }),
      [
        {
          id: "fallback-id",
          name: "",
          arguments: {},
        },
      ]
    );

    const usageItemData = internals.buildUsageItemData(
      {
        id: null,
        previous_response_id: null,
        service_tier: null,
        usage: null,
      },
      {
        stream: undefined,
        tool_choice: undefined,
        tools: undefined,
        store: undefined,
        service_tier: null,
        previous_response_id: null,
        model: undefined,
      },
      {
        tokensIn: 0,
        tokensOut: 0,
        cachedInTokens: 0,
        reasoningTokens: 0,
        audioTokens: 0,
      }
    );
    assert.equal(usageItemData.modelName, "gpt-4o");
    assert.deepEqual(usageItemData.request?.toolChoice, "auto");
    assert.equal(usageItemData.usageRaw, undefined);
  });

  it("uses override API keys and config-driven EU regional processing without env forcing", async () => {
    process.env.PS_AGENT_OVERRIDE_OPENAI_API_KEY = "override-key";

    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-4o",
        regionalProcessing: "eu",
      })
    );

    let captured: RecordedResponsesRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-eu-config",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "regional result" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.model, "gpt-4o");
    assert.equal(captured.service_tier, undefined);
    assert.equal(result.content, "regional result");
    assert.equal(result.usageItemData?.request?.regionalProcessing, "eu");
    assert.equal(result.usageItemData?.providerMetadata?.regionalProcessing, "eu");
  });

  it("attaches short media inputs on non-reasoning requests", async () => {
    const model = new OpenAiResponses(createConfig());
    let captured: RecordedResponsesRequest | undefined;

    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-short-media",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "short media" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      false,
      undefined,
      [{ mimeType: "image/png", data: "short" }]
    );

    assert.ok(captured);
    assert.deepEqual(captured.input, [
      {
        role: "user",
        content: [
          { type: "input_text", text: "hello" },
          {
            type: "input_image",
            image_url: "data:image/png;base64,short",
            detail: "auto",
          },
        ],
      },
    ]);
    assert.equal(result.content, "short media");
  });

  it("builds non-streaming requests and extracts final answers plus tool calls", async () => {
    process.env.OPENAI_ENFORCE_EU_REGION = "true";

    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.3",
        modelType: PsAiModelType.TextReasoning,
        inferenceType: "fast",
        reasoningEffort: "max",
        temperature: 0.9,
      })
    );

    let captured: RecordedResponsesRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-1",
          previous_response_id: null,
          service_tier: "priority",
          usage: {
            input_tokens: 10,
            output_tokens: 6,
            input_tokens_details: { cached_tokens: 2 },
            output_tokens_details: {
              reasoning_tokens: 3,
              audio_tokens: 0,
            },
          },
          output: [
            {
              type: "message",
              phase: "commentary",
              content: [{ type: "output_text", text: "thinking..." }],
            },
            {
              type: "function_call",
              call_id: "tool-1",
              name: "lookup",
              arguments: '{"id":1}',
            },
            {
              type: "message",
              phase: "final_answer",
              content: [{ type: "output_text", text: "done" }],
            },
          ],
        };
      },
    });

    const result = await model.generate(
      [
        { role: "system", message: "system prompt" },
        { role: "developer", message: "developer prompt" },
        { role: "user", message: "hello" },
      ],
      false,
      undefined,
      [{ mimeType: "image/png", data: "a".repeat(210) }],
      [
        {
          type: "function",
          function: {
            name: "lookup",
            description: "Lookup data",
            parameters: {
              type: "object",
              properties: {
                id: { type: "number" },
              },
            },
          },
        },
      ],
      {
        type: "function",
        function: { name: "lookup" },
      },
      ["lookup"],
      { safetyIdentifier: "safe-1" }
    );

    assert.ok(captured);
    assert.equal(captured.model, "gpt-5.3");
    assert.equal(captured.service_tier, "priority");
    assert.deepEqual(captured.reasoning, { effort: "xhigh" });
    assert.equal(captured.temperature, undefined);
    assert.equal(captured.max_output_tokens, 256);
    assert.equal(captured.safety_identifier, "safe-1");
    assert.equal(captured.instructions, "system prompt\n\ndeveloper prompt");
    assert.deepEqual(captured.tool_choice, {
      type: "function",
      name: "lookup",
    });
    assert.deepEqual(captured.tools, [
      {
        type: "function",
        name: "lookup",
        description: "Lookup data",
        parameters: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
      },
    ]);
    assert.deepEqual(captured.input, [
      {
        role: "user",
        content: [
          { type: "input_text", text: "hello" },
          {
            type: "input_image",
            image_url: `data:image/png;base64,${"a".repeat(210)}`,
            detail: "auto",
          },
        ],
      },
    ]);

    assert.equal(result.content, "done");
    assert.equal(result.phase, "final_answer");
    assert.deepEqual(result.assistantMessages, [
      { content: "thinking...", phase: "commentary" },
      { content: "done", phase: "final_answer" },
    ]);
    assert.deepEqual(result.toolCalls, [
      {
        id: "tool-1",
        name: "lookup",
        arguments: { id: 1 },
      },
    ]);
    assert.deepEqual(result.orderedOutputItems, [
      {
        type: "assistant_message",
        message: {
          content: "thinking...",
          phase: "commentary",
        },
      },
      {
        type: "tool_call",
        toolCall: {
          id: "tool-1",
          name: "lookup",
          arguments: { id: 1 },
        },
      },
      {
        type: "assistant_message",
        message: {
          content: "done",
          phase: "final_answer",
        },
      },
    ]);

    const usageRequest = result.usageItemData?.request as
      | Record<string, unknown>
      | undefined;
    assert.equal(usageRequest?.requestedInferenceType, "fast");
    assert.equal(usageRequest?.requestedServiceTier, "priority");
    assert.equal(usageRequest?.regionalProcessing, "eu");
  });

  it("continues prior responses by sending only new tool outputs", async () => {
    const model = new OpenAiResponses(createConfig());
    const capturedRequests: RecordedResponsesRequest[] = [];

    setMockClient(model, {
      create: async (params) => {
        const request = params as RecordedResponsesRequest;
        capturedRequests.push(request);

        if (capturedRequests.length === 1) {
          return {
            id: "resp-1",
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: "Need tool output" }],
              },
              {
                type: "function_call",
                call_id: "call-1",
                name: "lookup",
                arguments: '{"id":1}',
              },
            ],
            usage: {},
          };
        }

        return {
          id: "resp-2",
          previous_response_id: "resp-1",
          output: [
            {
              type: "message",
              phase: "final_answer",
              content: [{ type: "output_text", text: "Tool handled" }],
            },
          ],
          usage: {},
        };
      },
    });

    await model.generate([{ role: "user", message: "hello" }]);
    const result = await model.generate([
      { role: "user", message: "hello" },
      {
        role: "assistant",
        message: "",
        toolCall: {
          id: "call-1",
          name: "lookup",
          arguments: { id: 1 },
        },
      },
      {
        role: "tool",
        message: '{"ok":true}',
        toolCallId: "call-1",
      },
    ]);

    assert.equal(capturedRequests.length, 2);
    assert.equal(capturedRequests[1].previous_response_id, "resp-1");
    assert.deepEqual(capturedRequests[1].input, [
      {
        type: "function_call_output",
        call_id: "call-1",
        output: '{"ok":true}',
      },
    ]);
    assert.equal(result.content, "Tool handled");
  });

  it("omits reasoning options when a reasoning Responses model has no effort", async () => {
    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.3",
        modelType: PsAiModelType.TextReasoning,
        reasoningEffort: undefined,
      })
    );

    let captured: RecordedResponsesRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-no-effort",
          usage: {},
          output: [
            {
              type: "function_call",
              call_id: "empty-args",
              name: "lookup",
            },
            {
              type: "message",
              phase: "final_answer",
              content: [{ type: "output_text", text: "no effort" }],
            },
          ],
        };
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.reasoning, undefined);
    assert.equal(captured.temperature, undefined);
    assert.equal(result.content, "no effort");
    assert.deepEqual(result.toolCalls, [
      {
        id: "empty-args",
        name: "lookup",
        arguments: {},
      },
    ]);
    assert.deepEqual(result.orderedOutputItems?.[0], {
      type: "tool_call",
      toolCall: {
        id: "empty-args",
        name: "lookup",
        arguments: {},
      },
    });
  });

  it("continues a previous response without resending input when only instructions remain", async () => {
    const model = new OpenAiResponses(createConfig());
    let captured: RecordedResponsesRequest | undefined;

    Reflect.set(model, "previousResponseId", "prev-keep");
    Reflect.set(model, "lastSubmittedMessageCount", 0);

    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-continued",
          previous_response_id: "prev-keep",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "continued" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await model.generate([
      { role: "system", message: "system prompt" },
    ]);

    assert.ok(captured);
    assert.equal(captured.previous_response_id, "prev-keep");
    assert.equal(captured.input, undefined);
    assert.equal(captured.instructions, "system prompt");
    assert.equal(result.content, "continued");
  });

  it("clears stale bookkeeping when last submission state exists without a previous response", async () => {
    const model = new OpenAiResponses(createConfig());
    let captured: RecordedResponsesRequest | undefined;

    Reflect.set(model, "lastSubmittedMessageCount", 2);
    Reflect.set(model, "lastNoInputContinuationSignature", "stale-signature");
    Reflect.set(model, "sentToolOutputIds", new Set(["call-stale"]));

    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-clean",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "fresh state" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.previous_response_id, undefined);
    assert.deepEqual(captured.input, [{ role: "user", content: "hello" }]);
    assert.equal(result.content, "fresh state");
    assert.equal(Reflect.get(model, "lastSubmittedMessageCount"), 1);
    assert.equal(Reflect.get(model, "lastNoInputContinuationSignature"), undefined);
    assert.deepEqual(
      Array.from(Reflect.get(model, "sentToolOutputIds") as Set<string>),
      []
    );
  });

  it("resets internal continuation state directly", () => {
    const model = new OpenAiResponses(createConfig());
    const internals = asInternals(model);

    Reflect.set(model, "previousResponseId", "resp-old");
    Reflect.set(model, "lastSubmittedMessageCount", 3);
    Reflect.set(model, "lastNoInputContinuationSignature", "sig-old");
    Reflect.set(model, "sentToolOutputIds", new Set(["call-1"]));

    internals.resetResponsesState();

    assert.equal(Reflect.get(model, "previousResponseId"), undefined);
    assert.equal(Reflect.get(model, "lastSubmittedMessageCount"), 0);
    assert.equal(Reflect.get(model, "lastNoInputContinuationSignature"), undefined);
    assert.deepEqual(
      Array.from(Reflect.get(model, "sentToolOutputIds") as Set<string>),
      []
    );
  });

  it("streams phase-aware output and ignores commentary deltas", async () => {
    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.3",
      })
    );

    let captured: RecordedResponsesRequest | undefined;
    const chunks: string[] = [];
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          async *[Symbol.asyncIterator]() {
            yield {
              type: "response.output_text.delta",
              item_id: "commentary-item",
              delta: "hidden ",
            };
            yield {
              type: "response.output_item.added",
              item: {
                type: "message",
                id: "commentary-item",
                phase: "commentary",
              },
            };
            yield {
              type: "response.output_text.delta",
              item_id: "final-item",
              delta: "Hello ",
            };
            yield {
              type: "response.output_item.added",
              item: {
                type: "message",
                id: "final-item",
                phase: "final_answer",
              },
            };
            yield {
              type: "response.text.delta",
              item_id: "final-item",
              delta: "world",
            };
            yield {
              type: "response.completed",
              response: {
                id: "stream-resp-1",
                previous_response_id: null,
                service_tier: "priority",
                usage: {
                  input_tokens: 8,
                  output_tokens: 4,
                  input_tokens_details: { cached_tokens: 1 },
                  output_tokens_details: {
                    reasoning_tokens: 2,
                    audio_tokens: 1,
                  },
                },
                output: [
                  {
                    type: "message",
                    id: "commentary-item",
                    phase: "commentary",
                    content: [{ type: "output_text", text: "hidden " }],
                  },
                  {
                    type: "message",
                    id: "final-item",
                    phase: "final_answer",
                    content: [{ type: "output_text", text: "Hello world" }],
                  },
                  {
                    type: "function_call",
                    call_id: "tool-1",
                    name: "lookup",
                    arguments: '{"id":1}',
                  },
                ],
              },
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
    assert.deepEqual(chunks, ["Hello ", "world"]);
    assert.equal(result.content, "Hello world");
    assert.equal(result.phase, "final_answer");
    assert.equal(result.tokensIn, 8);
    assert.equal(result.tokensOut, 4);
    assert.equal(result.cachedInTokens, 1);
    assert.equal(result.reasoningTokens, 2);
    assert.equal(result.audioTokens, 1);
    assert.deepEqual(result.toolCalls, [
      {
        id: "tool-1",
        name: "lookup",
        arguments: { id: 1 },
      },
    ]);
    assert.equal(result.usageItemData?.request?.stream, true);
  });

  it("flushes deferred unphased stream content from the final response on phase-aware models", async () => {
    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.3",
      })
    );

    const chunks: string[] = [];
    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.output_text.delta",
            item_id: "late-item",
            delta: "late answer",
          };
          yield {
            type: "response.completed",
            response: {
              id: "late-stream",
              usage: {},
              output: [
                {
                  type: "message",
                  id: "late-item",
                  content: [{ type: "output_text", text: "late answer" }],
                },
              ],
            },
          };
        },
      }),
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (chunk) => chunks.push(chunk)
    );

    assert.deepEqual(chunks, ["late answer"]);
    assert.equal(result.content, "late answer");
  });

  it("suppresses unphased interim stream items on phase-aware models before a final response exists", async () => {
    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.3",
      })
    );

    const chunks: string[] = [];
    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.output_text.delta",
            item_id: "unphased-item",
            delta: "hidden",
          };
          yield {
            type: "response.output_item.added",
            item: {
              type: "message",
              id: "unphased-item",
            },
          };
          yield {
            type: "response.text.delta",
            item_id: "unphased-item",
            delta: " still hidden",
          };
        },
      }),
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (chunk) => chunks.push(chunk)
    );

    assert.deepEqual(chunks, []);
    assert.equal(result.content, "");
    assert.equal(result.tokensIn, 0);
    assert.equal(result.tokensOut, 0);
    assert.deepEqual(result.toolCalls, []);
  });

  it("flushes pending final-answer stream deltas when item metadata arrives late", async () => {
    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.3",
      })
    );

    const chunks: string[] = [];
    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.output_text.delta",
            item_id: "final-late-metadata",
            delta: "pending final",
          };
          yield {
            type: "response.output_item.added",
            item: {
              type: "message",
              id: "final-late-metadata",
              phase: "final_answer",
            },
          };
        },
      }),
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (chunk) => chunks.push(chunk)
    );

    assert.deepEqual(chunks, ["pending final"]);
    assert.equal(result.content, "pending final");
  });

  it("handles stream data deltas, non-message item metadata, and direct item emission", async () => {
    const model = new OpenAiResponses(createConfig({ modelName: "gpt-4o" }));
    const chunks: string[] = [];

    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.output_item.added",
            item: {
              type: "function_call",
              id: "tool-item",
            },
          };
          yield {
            type: "response.output_text.delta",
            item_id: "answer-item",
            data: "from data ",
          };
          yield {
            type: "response.output_item.done",
            item: {
              type: "message",
              id: "answer-item",
            },
          };
          yield {
            type: "response.output_text.delta",
            item_id: "answer-item",
            delta: "direct",
          };
          yield {
            type: "response.output_text.delta",
            delta: "",
          };
          yield {
            type: "response.completed",
            response: {
              id: "stream-data-delta",
              usage: {},
              output: [
                {
                  type: "message",
                  id: "answer-item",
                  content: [{ type: "output_text", text: "from data direct" }],
                },
              ],
            },
          };
        },
      }),
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (chunk) => chunks.push(chunk)
    );

    assert.deepEqual(chunks, ["from data ", "direct"]);
    assert.equal(result.content, "from data direct");
  });

  it("falls back to buffered content when a streaming response never finalizes", async () => {
    const model = new OpenAiResponses(createConfig());

    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.output_text.delta",
            delta: "partial",
          };
        },
        async finalResponse() {
          throw new Error("stream finalization failed");
        },
      }),
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true
    );

    assert.equal(result.content, "partial");
    assert.equal(result.tokensIn, 0);
    assert.equal(result.tokensOut, 0);
    assert.deepEqual(result.toolCalls, []);
  });

  it("flushes orphaned item deltas for non-phase-aware streams without final responses", async () => {
    const model = new OpenAiResponses(createConfig({ modelName: "gpt-4o" }));
    const chunks: string[] = [];

    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.output_text.delta",
            item_id: "orphaned-item",
            delta: "orphaned content",
          };
        },
      }),
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (chunk) => chunks.push(chunk)
    );

    assert.deepEqual(chunks, ["orphaned content"]);
    assert.equal(result.content, "orphaned content");
  });

  it("drops buffered commentary deltas when a phase-aware stream never finalizes", async () => {
    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.3",
      })
    );

    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.output_text.delta",
            item_id: "commentary-item",
            delta: "hidden",
          };
          yield {
            type: "response.output_item.added",
            item: {
              type: "message",
              id: "commentary-item",
              phase: "commentary",
            },
          };
        },
      }),
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true
    );

    assert.equal(result.content, "");
    assert.deepEqual(result.toolCalls, []);
  });

  it("ignores commentary deltas that arrive after stream item metadata", async () => {
    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.3",
      })
    );

    const chunks: string[] = [];
    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.output_item.added",
            item: {
              type: "message",
              id: "commentary-item",
              phase: "commentary",
            },
          };
          yield {
            type: "response.output_text.delta",
            item_id: "commentary-item",
            delta: "hidden",
          };
          yield {
            type: "response.completed",
            response: {
              id: "commentary-after-metadata",
              usage: {},
              output: [],
            },
          };
        },
      }),
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (chunk) => chunks.push(chunk)
    );

    assert.deepEqual(chunks, []);
    assert.equal(result.content, "");
  });

  it("resets stale response state when the same message set is retried with no delta", async () => {
    const model = new OpenAiResponses(createConfig());
    let captured: RecordedResponsesRequest | undefined;

    Reflect.set(model, "previousResponseId", "prev-1");
    Reflect.set(model, "lastSubmittedMessageCount", 1);

    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-fresh",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "fresh retry" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.previous_response_id, undefined);
    assert.deepEqual(captured.input, [{ role: "user", content: "hello" }]);
    assert.equal(result.content, "fresh retry");
  });

  it("resets previous response state when a no-input continuation repeats", async () => {
    const model = new OpenAiResponses(createConfig());
    let captured: RecordedResponsesRequest | undefined;

    Reflect.set(model, "previousResponseId", "prev-repeat");
    Reflect.set(model, "lastSubmittedMessageCount", 2);
    Reflect.set(model, "lastNoInputContinuationSignature", "prev-repeat:1:2");

    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-repeat-reset",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "repeat reset" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await model.generate([
      { role: "system", message: "system only" },
    ]);

    assert.ok(captured);
    assert.equal(captured.previous_response_id, undefined);
    assert.deepEqual(captured.input, [{ role: "user", content: "" }]);
    assert.equal(result.content, "repeat reset");
  });

  it("uses Azure-compatible responses transport when Azure environment variables are present", async () => {
    process.env.AZURE_OPENAI_KEY = "azure-key";
    process.env.AZURE_ENDPOINT = "https://azure.example.com/v1";
    process.env.AZURE_DEPLOYMENT_NAME = "azure-responses-deployment";

    const model = new OpenAiResponses(
      createConfig({
        modelName: "gpt-5.3",
        inferenceType: "fast",
      })
    );

    let captured: RecordedResponsesRequest | undefined;
    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "azure-resp",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "azure result" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.ok(captured);
    assert.equal(captured.model, "azure-responses-deployment");
    assert.equal(captured.service_tier, undefined);
    assert.equal(result.content, "azure result");
    assert.equal(result.usageItemData?.provider, "azure");
    assert.equal(
      result.usageItemData?.providerMetadata?.transport,
      "azure-openai-compatible"
    );
  });

  it("preprocesses response input deltas and helper message extraction branches", () => {
    const model = new OpenAiResponses(createConfig());
    const internals = asInternals(model);

    Reflect.set(model, "sentToolOutputIds", new Set(["done-call"]));

    const previous = internals.preprocessForResponses(
      [
        { role: "system", message: "system prompt" },
        { role: "developer", message: "developer prompt" },
        { role: "user", message: "old" },
        { role: "user", message: "new" },
        {
          role: "tool",
          message: '{"ok":true}',
          toolCallId: "new-call",
        },
        {
          role: "tool",
          message: '{"done":true}',
          toolCallId: "done-call",
        },
      ],
      true,
      3
    );

    assert.equal(previous.instructions, "system prompt\n\ndeveloper prompt");
    assert.deepEqual(previous.inputItems, [
      {
        type: "function_call_output",
        call_id: "new-call",
        output: '{"ok":true}',
      },
    ]);
    assert.deepEqual(previous.pendingToolCallIds, ["new-call"]);

    const previousDelta = internals.preprocessForResponses(
      [
        { role: "user", message: "old" },
        { role: "user", message: "new" },
        { role: "assistant", message: "stored already" },
        {
          role: "tool",
          message: '{"ignored":true}',
          toolCallId: "done-call",
        },
        { role: "system", message: "delta system" },
        { role: "developer", message: "delta developer" },
        { role: "critic", message: "odd" },
      ],
      true,
      1
    );

    assert.deepEqual(previousDelta.inputItems, [
      { role: "user", content: "new" },
      { role: "critic", content: "odd" },
    ]);

    const firstTurnWithToolCall = internals.preprocessForResponses(
      [
        {
          role: "assistant",
          message: "",
          toolCall: {
            id: "call-1",
            name: "lookup",
            arguments: { id: 1 },
          },
        },
        {
          role: "tool",
          message: '{"ok":true}',
          toolCallId: "call-1",
        },
      ],
      false,
      0
    );

    assert.deepEqual(firstTurnWithToolCall.inputItems, [
      {
        type: "function_call",
        call_id: "call-1",
        name: "lookup",
        arguments: '{"id":1}',
      },
      {
        type: "function_call_output",
        call_id: "call-1",
        output: '{"ok":true}',
      },
    ]);
    assert.deepEqual(firstTurnWithToolCall.pendingToolCallIds, ["call-1"]);

    const firstTurn = internals.preprocessForResponses(
      [
        { role: "system", message: "system only" },
        {
          role: "assistant",
          message: "",
          toolCall: {
            id: "",
            name: "lookup",
            arguments: { id: 1 },
          },
        },
      ],
      false,
      0
    );

    assert.deepEqual(firstTurn.inputItems, []);
    assert.equal(firstTurn.instructions, "system only");

    const invalidFirstTurn = internals.preprocessForResponses(
      [
        { role: "tool", message: "missing id" },
        { role: "critic", message: "odd" },
      ],
      false,
      0
    );

    assert.deepEqual(invalidFirstTurn.inputItems, []);
    assert.deepEqual(invalidFirstTurn.pendingToolCallIds, []);

    assert.deepEqual(
      internals.buildResponseMessageItem("assistant", "done", "final_answer"),
      {
        role: "assistant",
        content: "done",
        phase: "final_answer",
      }
    );
    assert.deepEqual(internals.buildResponseMessageItem("user", "hello", "commentary"), {
      role: "user",
      content: "hello",
    });

    assert.equal(
      internals.extractTextFromResponse({
        output: [
          {
            type: "message",
            content: [
              { type: "text", text: "joined " },
              { type: "output_text", text: "text" },
            ],
          },
          {
            type: "message",
            content: [{ type: "refusal", refusal: "no thanks" }],
          },
        ],
      }),
      "joined textno thanks"
    );
    assert.equal(
      internals.extractTextFromResponse({
        get output() {
          throw new Error("bad output");
        },
      }),
      ""
    );
    Reflect.set(model, "extractAssistantMessages", () => []);
    assert.equal(
      internals.extractTextFromResponse({
        output: [
          {
            type: "message",
            content: [{ type: "output_text", text: "fallback branch" }],
          },
        ],
      }),
      "fallback branch"
    );
    Reflect.deleteProperty(model, "extractAssistantMessages");
    assert.deepEqual(
      internals.selectAssistantReply({
        output_text: "fallback output text",
      }),
      { content: "fallback output text" }
    );
    assert.deepEqual(
      internals.selectAssistantReply({
        output: [
          {
            type: "message",
            phase: "commentary",
            content: [{ type: "output_text", text: "thinking..." }],
          },
        ],
      }),
      {
        content: "thinking...",
        phase: "commentary",
      }
    );
    assert.deepEqual(
      internals.selectAssistantReply({
        output: [
          {
            type: "message",
            phase: "final_answer",
            content: [],
          },
        ],
      }),
      {
        content: "",
        phase: "final_answer",
      }
    );
    assert.deepEqual(
      internals.extractOrderedOutputItems({
        output: [
          {
            type: "message",
            content: [],
          },
        ],
      }),
      []
    );
    assert.deepEqual(
      internals.extractOrderedOutputItems({
        get output() {
          throw new Error("bad output");
        },
      }),
      []
    );
    assert.deepEqual(
      internals.extractToolCallsFromResponse({
        get output() {
          throw new Error("bad output");
        },
      }),
      []
    );
  });

  it("streams non-phase-aware output and surfaces stream errors", async () => {
    const model = new OpenAiResponses(createConfig({ modelName: "gpt-4o" }));

    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.output_text.delta",
            item_id: "item-1",
            delta: "Hello ",
          };
          yield {
            type: "response.output_item.done",
            item: {
              type: "message",
              id: "item-1",
            },
          };
          yield {
            type: "response.refusal.delta",
            item_id: "item-1",
            delta: "world",
          };
        },
        async finalResponse() {
          return {
            id: "stream-fallback",
            usage: {},
            output: [
              {
                type: "message",
                id: "item-1",
                content: [{ type: "output_text", text: "Hello world" }],
              },
            ],
          };
        },
      }),
    });

    const chunks: string[] = [];
    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (chunk) => chunks.push(chunk)
    );

    assert.deepEqual(chunks, ["Hello ", "world"]);
    assert.equal(result.content, "Hello world");

    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.error",
            error: { message: "boom" },
          };
        },
      }),
    });

    await assert.rejects(
      () => model.generate([{ role: "user", message: "hello" }], true),
      /boom/
    );

    setMockClient(model, {
      create: async () => ({
        async *[Symbol.asyncIterator]() {
          yield {
            type: "response.error",
            error: {},
          };
        },
      }),
    });

    await assert.rejects(
      () => model.generate([{ role: "user", message: "hello" }], true),
      /Streaming error from Responses API/
    );
  });

  it("does not attach media when continuing with tool outputs only", async () => {
    const model = new OpenAiResponses(createConfig());
    let captured: RecordedResponsesRequest | undefined;

    Reflect.set(model, "previousResponseId", "resp-tools");
    Reflect.set(model, "lastSubmittedMessageCount", 1);

    setMockClient(model, {
      create: async (params) => {
        captured = params as RecordedResponsesRequest;
        return {
          id: "resp-tools-2",
          previous_response_id: "resp-tools",
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "tool only" }],
            },
          ],
          usage: {},
        };
      },
    });

    const result = await model.generate(
      [
        { role: "user", message: "hello" },
        {
          role: "tool",
          message: '{"ok":true}',
          toolCallId: "call-1",
        },
      ],
      false,
      undefined,
      [{ mimeType: "image/png", data: "abc123" }]
    );

    assert.ok(captured);
    assert.deepEqual(captured.input, [
      {
        type: "function_call_output",
        call_id: "call-1",
        output: '{"ok":true}',
      },
    ]);
    assert.equal(result.content, "tool only");
  });

  it("prefers unphased messages over commentary and falls back on malformed tool arguments", () => {
    const model = new OpenAiResponses(createConfig());
    const internals = asInternals(model);

    const response = {
      output: [
        {
          type: "message",
          phase: "commentary",
          content: [{ type: "output_text", text: "thinking..." }],
        },
        {
          type: "message",
          content: [{ type: "output_text", text: "plain answer" }],
        },
        {
          type: "function_call",
          call_id: "broken-call",
          name: "lookup",
          arguments: "{",
        },
      ],
    };

    assert.deepEqual(internals.selectAssistantReply(response), {
      content: "plain answer",
    });
    assert.deepEqual(internals.extractOrderedOutputItems(response), [
      {
        type: "assistant_message",
        message: {
          content: "thinking...",
          phase: "commentary",
        },
      },
      {
        type: "assistant_message",
        message: {
          content: "plain answer",
          phase: undefined,
        },
      },
      {
        type: "tool_call",
        toolCall: {
          id: "broken-call",
          name: "lookup",
          arguments: {},
        },
      },
    ]);
    assert.deepEqual(internals.extractToolCallsFromResponse(response), [
      {
        id: "broken-call",
        name: "lookup",
        arguments: {},
      },
    ]);
  });
});
