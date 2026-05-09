import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BaseChatModel } from "../../aiModels/baseChatModel.js";
import { PsAiModelProvider, PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";
import { TokenLimitChunker, type ModelCaller } from "../../base/tokenLimitChunker.js";

class StubModel extends BaseChatModel {
  constructor(overrides: Partial<PsAiModelConfig> = {}) {
    const config: PsAiModelConfig = {
      apiKey: "test-key",
      modelName: "gpt-test",
      provider: PsAiModelProvider.OpenAI,
      modelType: PsAiModelType.Text,
      modelSize: PsAiModelSize.Small,
      maxTokensOut: 1000,
      maxContextTokens: 50000,
      prices: {
        costInTokensPerMillion: 1,
        costInCachedContextTokensPerMillion: 0.5,
        costOutTokensPerMillion: 2,
        currency: "USD",
      },
      ...overrides,
    };
    super(config, config.modelName, config.maxTokensOut);
    this.provider = config.provider;
  }

  override async generate(): Promise<PsBaseModelReturnParameters | undefined> {
    return {
      content: "ok",
      tokensIn: 1,
      tokensOut: 1,
    };
  }
}

class RecordingCaller implements ModelCaller {
  calls: Array<{
    type: PsAiModelType;
    size: PsAiModelSize;
    messages: PsModelMessage[];
    options: PsCallModelOptions;
  }> = [];
  private readonly results: unknown[];

  constructor(results: unknown[]) {
    this.results = [...results];
  }

  async callModel(
    type: PsAiModelType,
    size: PsAiModelSize,
    messages: PsModelMessage[],
    options: PsCallModelOptions
  ): Promise<unknown> {
    this.calls.push({ type, size, messages, options });
    const result = this.results.shift();
    if (result instanceof Error) {
      throw result;
    }
    return result;
  }
}

const overrideChunker = (
  chunker: TokenLimitChunker,
  overrides: {
    countTokens?: (model: BaseChatModel, text: string) => Promise<number>;
    chunkByTokens?: (
      model: BaseChatModel,
      text: string,
      allowedTokens: number
    ) => Promise<string[]>;
  }
) => {
  for (const [key, value] of Object.entries(overrides)) {
    Reflect.set(chunker, key, value);
  }
};

type ChunkerInternals = {
  countTokens: (model: BaseChatModel, text: string) => Promise<number>;
  chunkByTokens: (
    model: BaseChatModel,
    text: string,
    allowedTokens: number
  ) => Promise<string[]>;
  chunkByTokensGemini: (
    model: BaseChatModel,
    text: string,
    allowedTokens: number
  ) => Promise<string[]>;
};

const asInternals = (chunker: TokenLimitChunker) =>
  chunker as unknown as ChunkerInternals;

describe("TokenLimitChunker", () => {
  it("detects and parses provider token limit errors", () => {
    assert.equal(TokenLimitChunker.isTokenLimitError(undefined), false);
    assert.equal(
      TokenLimitChunker.isTokenLimitError({
        code: "context_length_exceeded",
      }),
      true
    );
    assert.equal(
      TokenLimitChunker.isTokenLimitError({
        response: { data: { error: { code: "request_too_large" } } },
      }),
      true
    );
    assert.equal(
      TokenLimitChunker.isTokenLimitError({
        message: "Please reduce the length of the messages",
      }),
      true
    );
    assert.equal(
      TokenLimitChunker.isTokenLimitError({
        message: "maximum context length reached",
      }),
      true
    );
    assert.equal(
      TokenLimitChunker.isTokenLimitError({
        message: "input token count is too high",
      }),
      true
    );
    assert.equal(
      TokenLimitChunker.isTokenLimitError({
        message: "exceeds context window size",
      }),
      true
    );
    assert.equal(
      TokenLimitChunker.isTokenLimitError({
        message: "request exceeds the maximum allowed number of bytes",
      }),
      true
    );
    assert.equal(
      TokenLimitChunker.isTokenLimitError({
        message: "string too long",
      }),
      true
    );
    assert.equal(
      TokenLimitChunker.isTokenLimitError({ message: "ordinary failure" }),
      false
    );

    assert.equal(
      TokenLimitChunker.parseTokenLimit({
        message: "maximum number of tokens allowed (12345)",
      }),
      12345
    );
    assert.equal(
      TokenLimitChunker.parseTokenLimit({
        message: "maximum context length is 64000 tokens",
      }),
      64000
    );
    assert.equal(
      TokenLimitChunker.parseTokenLimit({
        message: "context window size exceeded 200000",
      }),
      200000
    );
    assert.equal(
      TokenLimitChunker.parseTokenLimit({
        message: "maximum length 4000",
      }),
      1000
    );
    assert.equal(TokenLimitChunker.parseTokenLimit({ message: "none" }), undefined);
  });

  it("counts Gemini tokens through the Gemini client and falls back to tiktoken", async () => {
    const caller = new RecordingCaller([]);
    const chunker = new TokenLimitChunker(caller);
    const internals = asInternals(chunker);
    const originalGeminiAi = Reflect.get(TokenLimitChunker, "geminiAi");
    const geminiModel = new StubModel({ modelName: "gemini-test" });

    try {
      Reflect.set(TokenLimitChunker, "geminiAi", {
        models: {
          countTokens: async (request: {
            model: string;
            contents: Array<{ role: string; parts: Array<{ text: string }> }>;
          }) => {
            assert.equal(request.model, "gemini-test");
            assert.equal(request.contents[0].parts[0].text, "hello gemini");
            return { totalTokens: 12 };
          },
        },
      });

      assert.equal(
        await internals.countTokens(geminiModel, "hello gemini"),
        12
      );

      Reflect.set(TokenLimitChunker, "geminiAi", {
        models: {
          countTokens: async () => {
            throw new Error("count failed");
          },
        },
      });

      assert.ok(await internals.countTokens(geminiModel, "fallback text"));
    } finally {
      Reflect.set(TokenLimitChunker, "geminiAi", originalGeminiAi);
    }
  });

  it("chunks text with the OpenAI tokenizer and the Gemini paragraph packer", async () => {
    const caller = new RecordingCaller([]);
    const chunker = new TokenLimitChunker(caller);
    const internals = asInternals(chunker);

    const openAiChunks = await internals.chunkByTokens(
      new StubModel({ modelName: "gpt-test" }),
      "alpha beta gamma delta",
      2
    );
    assert.ok(openAiChunks.length > 1);
    assert.equal(openAiChunks.join("").replace(/\s+/g, " ").trim(), "alpha beta gamma delta");

    const geminiChunker = new TokenLimitChunker(caller);
    overrideChunker(geminiChunker, {
      countTokens: async (_model, text) => text.length,
    });
    const geminiChunks = await asInternals(geminiChunker).chunkByTokensGemini(
      new StubModel({ modelName: "gemini-test" }),
      "first paragraph\n\nsecond paragraph is longer",
      20
    );

    assert.ok(geminiChunks.length > 1);
    assert.equal(geminiChunks.join("").replace(/\n+/g, ""), "first paragraphsecond paragraph is longer");

    const emptyGeminiChunks = await asInternals(geminiChunker).chunkByTokensGemini(
      new StubModel({ modelName: "gemini-test" }),
      "",
      20
    );
    assert.deepEqual(emptyGeminiChunks, []);

    let countCalls = 0;
    const verifyingChunker = new TokenLimitChunker(caller);
    overrideChunker(verifyingChunker, {
      countTokens: async (_model, text) => {
        countCalls += 1;
        if (countCalls === 1) {
          return 1;
        }
        return text.length > 2 ? 3 : text.length;
      },
    });
    const verifiedChunks = await asInternals(verifyingChunker).chunkByTokensGemini(
      new StubModel({ modelName: "gemini-test" }),
      "abcdef",
      2
    );
    assert.deepEqual(verifiedChunks, ["a", "bc", "d", "ef"]);
  });

  it("splits oversized documents, preserves context, and summarizes analyses", async () => {
    const caller = new RecordingCaller(["first analysis", { second: true }, "final"]);
    const chunker = new TokenLimitChunker(caller);
    overrideChunker(chunker, {
      countTokens: async (_model, text) => text.split(/\s+/).filter(Boolean).length,
      chunkByTokens: async () => ["chunk one", "chunk two"],
    });

    const result = await chunker.handle(
      new StubModel(),
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [
        { role: "system", message: "system prompt" },
        {
          role: "user",
          message:
            "alpha beta gamma delta epsilon <Important>keep this</Important> tail one tail two",
        },
      ],
      {
        xmlTagToPreserveForTooManyTokenSplitting: "Important",
        numberOfLastWordsToPreserveForTooManyTokenSplitting: 2,
      },
      new Error("maximum context length is 50000 tokens")
    );

    assert.equal(result, "final");
    assert.equal(caller.calls.length, 3);
    assert.equal(caller.calls[0].type, PsAiModelType.Text);
    assert.equal(caller.calls[0].size, PsAiModelSize.Small);
    assert.equal(caller.calls[0].options.disableChunkingRetry, true);
    assert.equal(caller.calls[0].options.returnBaseModelResult, false);
    assert.match(caller.calls[0].messages[1].message, /<PartialDocument index="1">chunk one<\/PartialDocument>/);
    assert.match(caller.calls[0].messages[1].message, /<Important>keep this<\/Important>/);
    assert.match(caller.calls[0].messages[1].message, /tail two/);
    assert.match(caller.calls[2].messages[1].message, /<Analysis index="1">first analysis<\/Analysis>/);
    assert.match(caller.calls[2].messages[1].message, /<Analysis index="2">\{"second":true\}<\/Analysis>/);
  });

  it("rejects impossible chunk budgets before calling the model", async () => {
    const caller = new RecordingCaller([]);
    const chunker = new TokenLimitChunker(caller);
    overrideChunker(chunker, {
      countTokens: async () => 1,
    });

    await assert.rejects(
      () =>
        chunker.handle(
          new StubModel({ maxContextTokens: 9000, maxTokensOut: 1000 }),
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [
            { role: "system", message: "prefix" },
            { role: "user", message: "document" },
          ],
          {},
          new Error("maximum context length is 9000 tokens")
        ),
      /leaves no room/
    );
    assert.equal(caller.calls.length, 0);
  });

  it("rejects preserved context that leaves too little chunk budget", async () => {
    const caller = new RecordingCaller([]);
    const chunker = new TokenLimitChunker(caller);
    overrideChunker(chunker, {
      countTokens: async (_model, text) =>
        text.includes("<Important>") ? 30000 : 1,
    });

    await assert.rejects(
      () =>
        chunker.handle(
          new StubModel({ maxContextTokens: 40000, maxTokensOut: 1000 }),
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [
            { role: "system", message: "prefix" },
            {
              role: "user",
              message: "document <Important>large preserved context</Important>",
            },
          ],
          {
            xmlTagToPreserveForTooManyTokenSplitting: "Important",
            numberOfLastWordsToPreserveForTooManyTokenSplitting: 0,
          },
          new Error("maximum context length is 40000 tokens")
        ),
      /Preserved context/
    );
    assert.equal(caller.calls.length, 0);
  });

  it("falls back to the minimum token limit when model context is missing", async () => {
    const caller = new RecordingCaller(["final"]);
    const chunker = new TokenLimitChunker(caller);
    overrideChunker(chunker, {
      countTokens: async () => 1,
      chunkByTokens: async () => [],
    });

    const result = await chunker.handle(
      new StubModel({ maxContextTokens: undefined }),
      PsAiModelType.Text,
      PsAiModelSize.Small,
      [
        { role: "system", message: "prefix" },
        { role: "user", message: "document" },
      ],
      { numberOfLastWordsToPreserveForTooManyTokenSplitting: 0 },
      new Error("maximum context length is 40000 tokens")
    );

    assert.equal(result, "final");
    assert.equal(caller.calls.length, 1);
  });

  it("enforces maximum chunk counts", async () => {
    const caller = new RecordingCaller([]);
    const chunker = new TokenLimitChunker(caller);
    overrideChunker(chunker, {
      countTokens: async () => 1,
      chunkByTokens: async () => ["one", "two", "three"],
    });

    await assert.rejects(
      () =>
        chunker.handle(
          new StubModel(),
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [
            { role: "system", message: "prefix" },
            { role: "user", message: "document" },
          ],
          { maximumNumberOfSplitDocumentChunks: 2 },
          new Error("maximum context length is 50000 tokens")
        ),
      /exceeds the allowed maximum/
    );
    assert.equal(caller.calls.length, 0);
  });

  it("surfaces token errors from chunk analysis and final summarization", async () => {
    const chunkError = Object.assign(new Error("request_too_large"), {
      code: "request_too_large",
    });
    const chunkCaller = new RecordingCaller([chunkError]);
    const chunker = new TokenLimitChunker(chunkCaller);
    overrideChunker(chunker, {
      countTokens: async () => 1,
      chunkByTokens: async () => ["chunk"],
    });

    await assert.rejects(
      () =>
        chunker.handle(
          new StubModel(),
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [
            { role: "system", message: "prefix" },
            { role: "user", message: "document" },
          ],
          {},
          new Error("maximum context length is 50000 tokens")
        ),
      /request_too_large/
    );

    const finalError = new Error("maximum context length is 50000 tokens");
    const finalCaller = new RecordingCaller(["analysis", finalError]);
    const finalChunker = new TokenLimitChunker(finalCaller);
    overrideChunker(finalChunker, {
      countTokens: async () => 1,
      chunkByTokens: async () => ["chunk"],
    });

    await assert.rejects(
      () =>
        finalChunker.handle(
          new StubModel(),
          PsAiModelType.Text,
          PsAiModelSize.Small,
          [
            { role: "system", message: "prefix" },
            { role: "user", message: "document" },
          ],
          {},
          finalError
        ),
      /maximum context length/
    );
  });
});
