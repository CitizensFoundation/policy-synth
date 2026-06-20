import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { readFile, rm } from "node:fs/promises";
import type { GenerateContentResponse } from "@google/genai";
import { FunctionCallingConfigMode } from "@google/genai";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";

process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DB_PORT ??= "5432";

const { GoogleGeminiChat } = await import("../../aiModels/googleGeminiChat.js");

class ExposedGoogleGeminiChat extends GoogleGeminiChat {
  buildContentsForTest(
    messages: PsModelMessage[],
    media?: PsPromptImage[]
  ) {
    return this.buildContents(messages, media);
  }

  getAiForLocationForTest(location?: string) {
    return this.getAiForLocation(location);
  }

  getDefaultAiForTest() {
    return (this as unknown as { getDefaultAi: () => unknown }).getDefaultAi();
  }

  getNextGeminiRegionStartIndexForTest(regionCount: number) {
    return (this as unknown as {
      getNextGeminiRegionStartIndex: (regionCount: number) => number;
    }).getNextGeminiRegionStartIndex(regionCount);
  }

  getErrorMessageForTest(error: unknown) {
    return (this as unknown as {
      getErrorMessage: (error: unknown) => string;
    }).getErrorMessage(error);
  }

  isGeminiRegionFailoverEligibleForTest(error: unknown) {
    return (this as unknown as {
      isGeminiRegionFailoverEligible: (error: unknown) => boolean;
    }).isGeminiRegionFailoverEligible(error);
  }

  buildUsageItemDataForTest(
    usageRaw: Record<string, unknown> | null | undefined,
    request: {
      stream: boolean;
      toolChoice: "auto";
      toolCount: number;
      systemInstructionPresent: boolean;
      geminiRegions: string[];
      selectedGeminiRegion: string | null;
    },
    usage: {
      tokensIn: number;
      tokensOut: number;
      cachedInTokens: number;
      reasoningTokens: number;
    }
  ) {
    return (this as unknown as {
      buildUsageItemData: (
        usageRaw: Record<string, unknown> | null | undefined,
        request: {
          stream: boolean;
          toolChoice: "auto";
          toolCount: number;
          systemInstructionPresent: boolean;
          geminiRegions: string[];
          selectedGeminiRegion: string | null;
        },
        usage: {
          tokensIn: number;
          tokensOut: number;
          cachedInTokens: number;
          reasoningTokens: number;
        }
      ) => PsModelUsageItemProviderData & Record<string, unknown>;
    }).buildUsageItemData(usageRaw, request, usage);
  }
}

class SpyGoogleGeminiChat extends ExposedGoogleGeminiChat {
  handledStreamChunks: GenerateContentResponse[] = [];
  handledFinalResponses: GenerateContentResponse[] = [];

  protected override handleStreamChunk(chunk: GenerateContentResponse) {
    this.handledStreamChunks.push(chunk);
  }

  protected override handleFinalResponse(response: GenerateContentResponse) {
    this.handledFinalResponses.push(response);
  }
}

type GeminiAiMock = {
  models: {
    generateContent?: (params: unknown) => Promise<unknown>;
    generateContentStream?: (params: unknown) => Promise<AsyncIterable<unknown>>;
  };
};

class RegionAwareGoogleGeminiChat extends SpyGoogleGeminiChat {
  requestedLocations: Array<string | undefined> = [];
  private readonly aiByLocation = new Map<string, GeminiAiMock>();

  setAiForLocation(location: string | undefined, ai: GeminiAiMock) {
    this.aiByLocation.set(location ?? "__default__", ai);
  }

  protected override getAiForLocation(location?: string) {
    this.requestedLocations.push(location);
    const ai = this.aiByLocation.get(location ?? "__default__");
    if (ai) {
      return ai as unknown as InstanceType<typeof GoogleGeminiChat>["ai"];
    }

    return super.getAiForLocation(location);
  }
}

const createConfig = (
  overrides: Partial<PsAiModelConfig> = {}
): PsAiModelConfig => ({
  apiKey: "gemini-test-key",
  modelName: "gemini-2.0-flash",
  modelType: PsAiModelType.MultiModal,
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

type RecordedGeminiRequest = {
  model?: string;
  contents?: unknown[];
  config?: {
    systemInstruction?: string;
    tools?: unknown[];
    toolConfig?: {
      functionCallingConfig?: {
        mode?: string;
        allowedFunctionNames?: string[];
      };
    };
    safetySettings?: unknown[];
  };
};

const setMockAi = (
  model: object,
  ai: GeminiAiMock
) => {
  Reflect.set(model, "ai", ai);
};

const createGeminiResponse = (
  text: string,
  usageMetadata: Record<string, number> = {},
  functionCalls: Array<{ id?: string; name?: string; args?: Record<string, unknown> }> = []
) => ({
  text,
  functionCalls,
  usageMetadata,
  candidates: [
    {
      finishReason: "STOP",
      content: {
        parts: [{ text }],
      },
    },
  ],
});

const originalVertexFlag = process.env.USE_GOOGLE_VERTEX_AI;
const originalVertexAllowlist = process.env.USE_GOOGLE_VERTEX_AI_FOR_MODELS;
const originalProject = process.env.GOOGLE_CLOUD_PROJECT;
const originalLocation = process.env.GOOGLE_CLOUD_LOCATION;
const originalDebugTokenCsv = process.env.DEBUG_TOKENS_COUNTS_TO_CSV_FILE;
const originalDebugPromptMessages = process.env.PS_DEBUG_PROMPT_MESSAGES;

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

  if (originalProject === undefined) {
    delete process.env.GOOGLE_CLOUD_PROJECT;
  } else {
    process.env.GOOGLE_CLOUD_PROJECT = originalProject;
  }

  if (originalLocation === undefined) {
    delete process.env.GOOGLE_CLOUD_LOCATION;
  } else {
    process.env.GOOGLE_CLOUD_LOCATION = originalLocation;
  }

  if (originalDebugTokenCsv === undefined) {
    delete process.env.DEBUG_TOKENS_COUNTS_TO_CSV_FILE;
  } else {
    process.env.DEBUG_TOKENS_COUNTS_TO_CSV_FILE = originalDebugTokenCsv;
  }

  if (originalDebugPromptMessages === undefined) {
    delete process.env.PS_DEBUG_PROMPT_MESSAGES;
  } else {
    process.env.PS_DEBUG_PROMPT_MESSAGES = originalDebugPromptMessages;
  }
});

describe("GoogleGeminiChat", () => {
  it("enables Vertex transport when the model is allowlisted", () => {
    process.env.USE_GOOGLE_VERTEX_AI_FOR_MODELS =
      " gemini-2.0-flash , gemini-2.5-pro ";
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";
    process.env.GOOGLE_CLOUD_LOCATION = "europe-west1";

    const model = new GoogleGeminiChat(createConfig());

    assert.equal(model.useVertex, true);
  });

  it("covers Gemini client initialization fallbacks and Vertex client caching", () => {
    const directModel = new ExposedGoogleGeminiChat(createConfig());
    Reflect.set(directModel, "ai", undefined);
    assert.throws(
      () => directModel.getAiForLocationForTest(),
      /Gemini client is not initialized/
    );

    process.env.USE_GOOGLE_VERTEX_AI = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    delete process.env.GOOGLE_CLOUD_LOCATION;

    const missingLocationModel = new ExposedGoogleGeminiChat(createConfig());
    assert.throws(
      () => missingLocationModel.getAiForLocationForTest(),
      /requires GOOGLE_CLOUD_LOCATION or requestOptions\.geminiRegions/
    );
    assert.throws(
      () => missingLocationModel.getDefaultAiForTest(),
      /requires GOOGLE_CLOUD_LOCATION or requestOptions\.geminiRegions/
    );
    assert.equal(
      missingLocationModel.buildUsageItemDataForTest(
        null,
        {
          stream: false,
          toolChoice: "auto",
          toolCount: 0,
          systemInstructionPresent: false,
          geminiRegions: [],
          selectedGeminiRegion: null,
        },
        {
          tokensIn: 0,
          tokensOut: 0,
          cachedInTokens: 0,
          reasoningTokens: 0,
        }
      ).providerMetadata?.location,
      null
    );
    assert.equal(
      missingLocationModel.getNextGeminiRegionStartIndexForTest(1),
      0
    );

    const circular: Record<string, unknown> = {};
    circular.self = circular;
    assert.equal(
      missingLocationModel.getErrorMessageForTest(circular),
      "[object Object]"
    );
    assert.equal(
      missingLocationModel.isGeminiRegionFailoverEligibleForTest({
        cause: { code: "EPIPE" },
      }),
      true
    );
    assert.equal(
      missingLocationModel.isGeminiRegionFailoverEligibleForTest({
        response: { status: "503" },
      }),
      true
    );
    assert.equal(
      missingLocationModel.isGeminiRegionFailoverEligibleForTest(
        new Error("prompt may be malformed")
      ),
      false
    );

    process.env.GOOGLE_CLOUD_LOCATION = "europe-west1";
    const vertexModel = new ExposedGoogleGeminiChat(createConfig());
    Reflect.set(vertexModel, "ai", undefined);
    Reflect.set(vertexModel, "vertexClients", new Map<string, unknown>());

    const defaultClient = vertexModel.getAiForLocationForTest("europe-west1");
    assert.equal(Boolean(defaultClient), true);
    const createdClient = vertexModel.getAiForLocationForTest("us-east4");
    assert.equal(Boolean(createdClient), true);
    assert.equal(vertexModel.getAiForLocationForTest("us-east4"), createdClient);
  });

  it("uses required tool mode and records vertex usage metadata", async () => {
    process.env.USE_GOOGLE_VERTEX_AI = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    process.env.GOOGLE_CLOUD_LOCATION = "us-central1";

    const model = new SpyGoogleGeminiChat(createConfig());

    let captured: RecordedGeminiRequest | undefined;
    setMockAi(model, {
      models: {
        generateContent: async (params) => {
          captured = params as RecordedGeminiRequest;
          return {
            text: "Vertex Gemini",
            functionCalls: [],
            usageMetadata: {
              promptTokenCount: 4,
              toolUsePromptTokenCount: 1,
              candidatesTokenCount: 2,
              cachedContentTokenCount: 1,
            },
            candidates: [
              {
                finishReason: "STOP",
                content: {
                  parts: [{ text: "Vertex Gemini" }],
                },
              },
            ],
          };
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
            parameters: {
              type: "object",
              properties: {
                id: { type: "number" },
              },
            },
          },
        },
      ],
      "required",
      ["lookup", "search"]
    );

    assert.ok(captured);
    assert.deepEqual(captured.config?.toolConfig, {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.ANY,
        allowedFunctionNames: ["lookup", "search"],
      },
    });
    assert.equal(result.content, "Vertex Gemini");
    assert.equal(result.usageItemData?.request?.toolChoice, "required");
    assert.equal(result.usageItemData?.providerMetadata?.transport, "vertex");
    assert.equal(
      result.usageItemData?.providerMetadata?.project,
      "vertex-project"
    );
    assert.equal(
      result.usageItemData?.providerMetadata?.location,
      "us-central1"
    );
  });

  it("rotates across request-supplied Gemini regions and records the selected region", async () => {
    process.env.USE_GOOGLE_VERTEX_AI = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    delete process.env.GOOGLE_CLOUD_LOCATION;

    const model = new RegionAwareGoogleGeminiChat(createConfig());

    model.setAiForLocation("europe-west1", {
      models: {
        generateContent: async () =>
          createGeminiResponse("west-1", {
            promptTokenCount: 2,
            candidatesTokenCount: 1,
          }),
      },
    });
    model.setAiForLocation("us-east4", {
      models: {
        generateContent: async () =>
          createGeminiResponse("east-4", {
            promptTokenCount: 3,
            candidatesTokenCount: 1,
          }),
      },
    });

    const requestOptions: PsModelRequestOptions = {
      geminiRegions: [" europe-west1 ", "us-east4", "europe-west1"],
    };

    const first = await model.generate(
      [{ role: "user", message: "hello" }],
      false,
      undefined,
      undefined,
      undefined,
      "auto",
      undefined,
      requestOptions
    );
    const second = await model.generate(
      [{ role: "user", message: "hello again" }],
      false,
      undefined,
      undefined,
      undefined,
      "auto",
      undefined,
      requestOptions
    );

    assert.deepEqual(model.requestedLocations, ["europe-west1", "us-east4"]);
    assert.equal(first.content, "west-1");
    assert.equal(second.content, "east-4");
    assert.deepEqual(first.usageItemData?.request?.geminiRegions, [
      "europe-west1",
      "us-east4",
    ]);
    assert.equal(
      first.usageItemData?.request?.selectedGeminiRegion,
      "europe-west1"
    );
    assert.equal(
      second.usageItemData?.providerMetadata?.selectedGeminiRegion,
      "us-east4"
    );
    assert.equal(second.usageItemData?.providerMetadata?.location, "us-east4");
  });

  it("fails over to the next Gemini region on retryable vertex errors", async () => {
    process.env.USE_GOOGLE_VERTEX_AI = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    delete process.env.GOOGLE_CLOUD_LOCATION;

    const model = new RegionAwareGoogleGeminiChat(createConfig());

    model.setAiForLocation("europe-west1", {
      models: {
        generateContent: async () => {
          throw Object.assign(new Error("429 rate limit"), { status: 429 });
        },
      },
    });
    model.setAiForLocation("us-east4", {
      models: {
        generateContent: async () =>
          createGeminiResponse("recovered", {
            promptTokenCount: 5,
            candidatesTokenCount: 2,
          }),
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      false,
      undefined,
      undefined,
      undefined,
      "auto",
      undefined,
      {
        geminiRegions: ["europe-west1", "us-east4"],
      }
    );

    assert.deepEqual(model.requestedLocations, ["europe-west1", "us-east4"]);
    assert.equal(result.content, "recovered");
    assert.equal(result.usageItemData?.providerMetadata?.location, "us-east4");
    assert.deepEqual(result.usageItemData?.providerMetadata?.geminiRegions, [
      "europe-west1",
      "us-east4",
    ]);
  });

  it("fails over on string Gemini errors and annotates the recovered region", async () => {
    process.env.USE_GOOGLE_VERTEX_AI = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    delete process.env.GOOGLE_CLOUD_LOCATION;

    const model = new RegionAwareGoogleGeminiChat(createConfig());

    model.setAiForLocation("europe-west1", {
      models: {
        generateContent: async () => {
          throw "quota exceeded";
        },
      },
    });
    model.setAiForLocation("us-east4", {
      models: {
        generateContent: async () =>
          createGeminiResponse("string recovered", {
            promptTokenCount: 2,
            candidatesTokenCount: 1,
          }),
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      false,
      undefined,
      undefined,
      undefined,
      "auto",
      undefined,
      {
        geminiRegions: ["europe-west1", "us-east4"],
      }
    );

    assert.equal(result.content, "string recovered");
    assert.deepEqual(model.requestedLocations, ["europe-west1", "us-east4"]);
  });

  it("does not fail over on non-retryable Gemini status errors", async () => {
    process.env.USE_GOOGLE_VERTEX_AI = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    delete process.env.GOOGLE_CLOUD_LOCATION;

    const model = new RegionAwareGoogleGeminiChat(createConfig());

    model.setAiForLocation("europe-west1", {
      models: {
        generateContent: async () => {
          throw Object.assign(new Error("bad request"), { status: 400 });
        },
      },
    });
    model.setAiForLocation("us-east4", {
      models: {
        generateContent: async () => createGeminiResponse("should not run"),
      },
    });

    await assert.rejects(
      () =>
        model.generate(
          [{ role: "user", message: "hello" }],
          false,
          undefined,
          undefined,
          undefined,
          "auto",
          undefined,
          {
            geminiRegions: ["europe-west1", "us-east4"],
          }
        ),
      /Gemini region europe-west1 attempt 1\/2: bad request/
    );
    assert.deepEqual(model.requestedLocations, ["europe-west1"]);
  });

  it("requires a Vertex location when no Gemini request regions are usable", async () => {
    process.env.USE_GOOGLE_VERTEX_AI = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    delete process.env.GOOGLE_CLOUD_LOCATION;

    const model = new RegionAwareGoogleGeminiChat(createConfig());

    await assert.rejects(
      () =>
        model.generate(
          [{ role: "user", message: "hello" }],
          false,
          undefined,
          undefined,
          undefined,
          "auto",
          undefined,
          {
            geminiRegions: [" ", "\t"],
          }
        ),
      /requires GOOGLE_CLOUD_LOCATION or requestOptions\.geminiRegions/
    );

    assert.deepEqual(model.requestedLocations, []);
  });

  it("fails over streamed Gemini requests only before output is emitted", async () => {
    process.env.USE_GOOGLE_VERTEX_AI = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    delete process.env.GOOGLE_CLOUD_LOCATION;

    const model = new RegionAwareGoogleGeminiChat(createConfig());

    model.setAiForLocation("europe-west1", {
      models: {
        generateContentStream: async () => ({
          async *[Symbol.asyncIterator]() {
            throw Object.assign(new Error("service unavailable"), {
              statusCode: "503",
            });
          },
        }),
      },
    });
    model.setAiForLocation("us-east4", {
      models: {
        generateContentStream: async () => ({
          async *[Symbol.asyncIterator]() {
            yield createGeminiResponse("stream recovered", {
              promptTokenCount: 4,
              candidatesTokenCount: 2,
            });
          },
        }),
      },
    });

    const recovered = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      undefined,
      undefined,
      undefined,
      "auto",
      undefined,
      {
        geminiRegions: ["europe-west1", "us-east4"],
      }
    );

    assert.equal(recovered.content, "stream recovered");
    assert.deepEqual(model.requestedLocations, ["europe-west1", "us-east4"]);

    const noFailover = new RegionAwareGoogleGeminiChat(createConfig());
    noFailover.setAiForLocation("europe-west1", {
      models: {
        generateContentStream: async () => ({
          async *[Symbol.asyncIterator]() {
            yield createGeminiResponse("partial", {
              promptTokenCount: 1,
              candidatesTokenCount: 1,
            });
            throw Object.assign(new Error("429 after output"), { status: 429 });
          },
        }),
      },
    });
    noFailover.setAiForLocation("us-east4", {
      models: {
        generateContentStream: async () => ({
          async *[Symbol.asyncIterator]() {
            yield createGeminiResponse("should not run");
          },
        }),
      },
    });

    await assert.rejects(
      () =>
        noFailover.generate(
          [{ role: "user", message: "hello" }],
          true,
          undefined,
          undefined,
          undefined,
          "auto",
          undefined,
          {
            geminiRegions: ["europe-west1", "us-east4"],
          }
        ),
      /Gemini region europe-west1 attempt 1\/2: 429 after output/
    );
    assert.deepEqual(noFailover.requestedLocations, ["europe-west1"]);
  });

  it("does not fail over Gemini regions for blocked or malformed requests", async () => {
    process.env.USE_GOOGLE_VERTEX_AI = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    delete process.env.GOOGLE_CLOUD_LOCATION;

    const model = new RegionAwareGoogleGeminiChat(createConfig());

    model.setAiForLocation("europe-west1", {
      models: {
        generateContent: async () => ({
          candidates: [],
          promptFeedback: {
            blockReason: "SAFETY",
          },
        }),
      },
    });
    model.setAiForLocation("us-east4", {
      models: {
        generateContent: async () =>
          createGeminiResponse("should-not-run"),
      },
    });

    await assert.rejects(
      () =>
        model.generate(
          [{ role: "user", message: "hello" }],
          false,
          undefined,
          undefined,
          undefined,
          "auto",
          undefined,
          {
            geminiRegions: ["europe-west1", "us-east4"],
          }
        ),
      /blocked via prompt: SAFETY/
    );

    assert.deepEqual(model.requestedLocations, ["europe-west1"]);
  });

  it("uses auto tool mode and omits system instructions when none are provided", async () => {
    const model = new SpyGoogleGeminiChat(createConfig());

    let captured: RecordedGeminiRequest | undefined;
    setMockAi(model, {
      models: {
        generateContent: async (params) => {
          captured = params as RecordedGeminiRequest;
          return {
            text: "Auto Gemini",
            candidates: [
              {
                finishReason: "STOP",
                content: {
                  parts: [{ text: "Auto Gemini" }],
                },
              },
            ],
          };
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
            parameters: {
              type: "object",
            },
          },
        },
      ]
    );

    assert.ok(captured);
    assert.equal(captured.config?.systemInstruction, "");
    assert.deepEqual(captured.config?.toolConfig, {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.AUTO,
        allowedFunctionNames: undefined,
      },
    });
    assert.equal(result.content, "Auto Gemini");
    assert.equal(result.tokensIn, 0);
    assert.equal(result.tokensOut, 0);
    assert.equal(result.usageItemData?.request?.systemInstructionPresent, false);
    assert.equal(result.usageItemData?.request?.toolChoice, "auto");
    assert.equal(result.usageItemData?.request?.toolCount, 1);
  });

  it("ignores Gemini region overrides when using the direct Gemini API", async () => {
    const model = new SpyGoogleGeminiChat(createConfig());

    setMockAi(model, {
      models: {
        generateContent: async () =>
          createGeminiResponse("Direct Gemini", {
            promptTokenCount: 4,
            candidatesTokenCount: 2,
          }),
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      false,
      undefined,
      undefined,
      undefined,
      "auto",
      undefined,
      {
        geminiRegions: ["europe-west1", "us-east4"],
      }
    );

    assert.equal(result.content, "Direct Gemini");
    assert.equal(result.usageItemData?.providerMetadata?.transport, "google-genai");
    assert.equal(result.usageItemData?.providerMetadata?.location, null);
    assert.equal(result.usageItemData?.request?.geminiRegions, null);
    assert.equal(result.usageItemData?.request?.selectedGeminiRegion, null);
  });

  it("builds Gemini contents for user text, tool calls, tool responses, and media", () => {
    const model = new ExposedGoogleGeminiChat(createConfig());

    const contents = model.buildContentsForTest(
      [
        { role: "system", message: "system prompt" },
        { role: "developer", message: "developer prompt" },
        {
          role: "assistant",
          message: "skip commentary",
          phase: "commentary",
        },
        { role: "user", message: "hello" },
        {
          role: "assistant",
          message: "",
          toolCall: {
            id: "tool-1",
            name: "lookup",
            arguments: { id: 1 },
          },
        },
        { role: "tool", name: "lookup", message: '{"value":2}' },
      ],
      [{ mimeType: "image/png", data: "abc123" }]
    );

    assert.deepEqual(contents, [
      { role: "user", parts: [{ text: "hello" }] },
      {
        role: "model",
        parts: [{ functionCall: { name: "lookup", args: { id: 1 } } }],
      },
      {
        role: "function",
        parts: [
          {
            functionResponse: {
              name: "lookup",
              response: { value: 2 },
            },
          },
        ],
      },
      {
        role: "user",
        parts: [{ inlineData: { mimeType: "image/png", data: "abc123" } }],
      },
    ]);
  });

  it("handles plain assistant text, default tool names, and malformed no-candidate responses", () => {
    const model = new ExposedGoogleGeminiChat(createConfig());

    const contents = model.buildContentsForTest([
      { role: "assistant", message: "plain assistant reply" },
      { role: "tool", message: "" },
    ]);

    assert.deepEqual(contents, [
      { role: "model", parts: [{ text: "plain assistant reply" }] },
      {
        role: "function",
        parts: [
          {
            functionResponse: {
              name: "tool_response",
              response: {},
            },
          },
        ],
      },
    ]);
    assert.deepEqual(model.parseToolResponse(""), {});
    assert.equal(model.tokensOut(undefined), 0);
    assert.throws(
      () =>
        model.assertGeminiNotBlocked({
          candidates: [],
        } as unknown as GenerateContentResponse),
      /prompt may be malformed/
    );
  });

  it("writes token debug rows when CSV logging is enabled", async () => {
    process.env.DEBUG_TOKENS_COUNTS_TO_CSV_FILE = "true";
    await rm("/tmp/geminiTokenDebug.csv", { force: true });

    const model = new GoogleGeminiChat(createConfig());
    await model.logTokens(3, 4, 1);

    const csv = await readFile("/tmp/geminiTokenDebug.csv", "utf8");
    assert.equal(csv.includes("gemini-2.0-flash,3,4,1"), true);
  });

  it("parses tool responses and normalizes output token counts", () => {
    const model = new GoogleGeminiChat(createConfig());

    assert.deepEqual(model.parseToolResponse('{"ok":true}'), { ok: true });
    assert.deepEqual(model.parseToolResponse("plain text"), {
      result: "plain text",
    });
    assert.equal(
      model.tokensOut({ candidatesTokenCount: 18, thoughtsTokenCount: 2 }),
      20
    );
    assert.equal(
      model.tokensOut({
        totalTokenCount: 30,
        promptTokenCount: 10,
        toolUsePromptTokenCount: 4,
      }),
      16
    );
    assert.equal(model.tokensOut({}), 0);
  });

  it("raises clear errors when Gemini blocks a prompt or a candidate", () => {
    const model = new GoogleGeminiChat(createConfig());

    const blockedPrompt = {
      candidates: [],
      promptFeedback: {
        blockReason: "SAFETY",
        safetyRatings: [
          { category: "harassment", probability: "HIGH" },
        ],
      },
    } as unknown as GenerateContentResponse;

    const blockedCandidate = {
      candidates: [
        {
          finishReason: "SAFETY",
          safetyRatings: [
            { category: "dangerous", probability: "HIGH" },
          ],
        },
      ],
    } as unknown as GenerateContentResponse;

    assert.throws(
      () => model.assertGeminiNotBlocked(blockedPrompt),
      /blocked via prompt: SAFETY/
    );
    assert.throws(
      () => model.assertGeminiNotBlocked(blockedCandidate),
      /blocked via safety: dangerous=HIGH/
    );
    assert.throws(
      () =>
        model.assertGeminiNotBlocked({
          candidates: [
            {
              finishReason: "SAFETY",
            },
          ],
        } as unknown as GenerateContentResponse),
      /blocked via safety: /
    );
  });

  it("builds non-streaming generate requests with explicit tool choice and usage metadata", async () => {
    const model = new SpyGoogleGeminiChat(createConfig());

    let captured: RecordedGeminiRequest | undefined;
    setMockAi(model, {
      models: {
        generateContent: async (params) => {
          captured = params as RecordedGeminiRequest;
          return {
            text: "Gemini result",
            functionCalls: [
              {
                id: "call-1",
                name: "lookup",
                args: { id: 1 },
              },
            ],
            usageMetadata: {
              promptTokenCount: 10,
              toolUsePromptTokenCount: 2,
              totalTokenCount: 17,
              cachedContentTokenCount: 3,
              thoughtsTokenCount: 1,
            },
            candidates: [
              {
                finishReason: "STOP",
                content: {
                  parts: [{ text: "Gemini result" }],
                },
              },
            ],
          };
        },
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
      undefined,
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
      ["ignored-name"]
    );

    assert.ok(captured);
    assert.equal(captured.model, "gemini-2.0-flash");
    assert.equal(captured.config?.systemInstruction, "system prompt\n\ndeveloper prompt");
    assert.deepEqual(captured.config?.tools, [
      {
        functionDeclarations: [
          {
            name: "lookup",
            description: "Lookup data",
            parametersJsonSchema: {
              type: "object",
              properties: {
                id: { type: "number" },
              },
            },
          },
        ],
      },
    ]);
    assert.deepEqual(captured.config?.toolConfig, {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.ANY,
        allowedFunctionNames: ["lookup"],
      },
    });
    assert.equal(captured.config?.safetySettings?.length, 5);

    assert.equal(result.content, "Gemini result");
    assert.equal(result.tokensIn, 12);
    assert.equal(result.tokensOut, 5);
    assert.equal(result.cachedInTokens, 3);
    assert.equal(result.reasoningTokens, 1);
    assert.deepEqual(result.toolCalls, [
      {
        id: "call-1",
        name: "lookup",
        arguments: { id: 1 },
      },
    ]);
    assert.equal(model.handledFinalResponses.length, 1);
    assert.equal(result.usageItemData?.request?.systemInstructionPresent, true);
    assert.deepEqual(result.usageItemData?.request?.allowedFunctionNames, [
      "lookup",
    ]);
  });

  it("streams generate requests, forwards chunk callbacks, and records function calls", async () => {
    const model = new SpyGoogleGeminiChat(
      createConfig({
        modelName: "gemini-2.5-pro",
      })
    );

    let captured: RecordedGeminiRequest | undefined;
    const streamedChunks: string[] = [];
    setMockAi(model, {
      models: {
        generateContentStream: async (params) => {
          captured = params as RecordedGeminiRequest;

          const chunks = [
            {
              text: "Hello ",
              functionCalls: [
                {
                  id: "call-1",
                  name: "lookup",
                  args: { id: 1 },
                },
              ],
              candidates: [
                {
                  finishReason: "STOP",
                  content: {
                    parts: [{ text: "Hello " }],
                  },
                },
              ],
            },
            {
              text: "stream",
              usageMetadata: {
                promptTokenCount: 6,
                toolUsePromptTokenCount: 1,
                candidatesTokenCount: 3,
                thoughtsTokenCount: 2,
                cachedContentTokenCount: 1,
              },
              candidates: [
                {
                  finishReason: "STOP",
                  content: {
                    parts: [{ text: "stream" }],
                  },
                },
              ],
            },
          ];

          return {
            async *[Symbol.asyncIterator]() {
              for (const chunk of chunks) {
                yield chunk;
              }
            },
          };
        },
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true,
      (chunk) => streamedChunks.push(chunk),
      [{ mimeType: "image/png", data: "abc123" }],
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
      "none"
    );

    assert.ok(captured);
    assert.deepEqual(captured.config?.toolConfig, {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.NONE,
        allowedFunctionNames: undefined,
      },
    });
    assert.deepEqual(streamedChunks, ["Hello ", "stream"]);
    assert.equal(result.content, "Hello stream");
    assert.equal(result.tokensIn, 7);
    assert.equal(result.tokensOut, 5);
    assert.equal(result.cachedInTokens, 1);
    assert.equal(result.reasoningTokens, 2);
    assert.deepEqual(result.toolCalls, [
      {
        id: "call-1",
        name: "lookup",
        arguments: { id: 1 },
      },
    ]);
    assert.equal(model.handledStreamChunks.length, 2);
    assert.equal(model.handledFinalResponses.length, 1);
    assert.equal(result.usageItemData?.request?.stream, true);
    assert.equal(result.usageItemData?.request?.toolChoice, "none");
  });

  it("defaults missing Gemini response text, tool call fields, and usage", async () => {
    process.env.PS_DEBUG_PROMPT_MESSAGES = "true";

    const model = new SpyGoogleGeminiChat(createConfig());
    setMockAi(model, {
      models: {
        generateContent: async () => ({
          functionCalls: [{}],
          candidates: [
            {
              finishReason: "STOP",
              content: {
                parts: [],
              },
            },
          ],
        }),
      },
    });

    const result = await model.generate([{ role: "user", message: "hello" }]);

    assert.equal(result.content, "");
    assert.equal(result.tokensIn, 0);
    assert.equal(result.tokensOut, 0);
    assert.equal(result.cachedInTokens, 0);
    assert.equal(result.reasoningTokens, 0);
    assert.deepEqual(result.toolCalls, [
      {
        id: "",
        name: "unknown",
        arguments: {},
      },
    ]);
    assert.equal(result.usageItemData?.usageRaw, undefined);
  });

  it("uses base Gemini hooks and default Vertex metadata when no region override is selected", async () => {
    process.env.USE_GOOGLE_VERTEX_AI = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "vertex-project";
    process.env.GOOGLE_CLOUD_LOCATION = "europe-west1";

    const model = new GoogleGeminiChat(createConfig());
    setMockAi(model, {
      models: {
        generateContentStream: async () => ({
          async *[Symbol.asyncIterator]() {
            yield createGeminiResponse("base hooks", {
              promptTokenCount: 3,
              candidatesTokenCount: 2,
            });
          },
        }),
      },
    });

    const result = await model.generate(
      [{ role: "user", message: "hello" }],
      true
    );

    assert.equal(result.content, "base hooks");
    assert.equal(
      result.usageItemData?.request?.selectedGeminiRegion,
      "europe-west1"
    );
    assert.equal(
      result.usageItemData?.providerMetadata?.location,
      "europe-west1"
    );
  });
});
