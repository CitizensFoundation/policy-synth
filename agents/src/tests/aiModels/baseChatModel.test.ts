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

const { BaseChatModel } = await import("../../aiModels/baseChatModel.js");

class TestChatModel extends BaseChatModel {
  override async generate(
    _messages: PsModelMessage[],
    _streaming?: boolean,
    _streamingCallback?: Function,
    _media?: PsPromptImage[],
    _tools?: ChatCompletionTool[],
    _toolChoice?: ChatCompletionToolChoiceOption | "auto",
    _allowedTools?: string[],
    _requestOptions?: PsModelRequestOptions
  ): Promise<PsBaseModelReturnParameters> {
    return {
      content: "",
      tokensIn: 0,
      tokensOut: 0,
    };
  }
}

const defaultConfig: PsAiModelConfig = {
  apiKey: "test-key",
  modelName: "gpt-4o",
  modelType: PsAiModelType.Text,
  modelSize: PsAiModelSize.Small,
  prices: {
    costInTokensPerMillion: 1,
    costInCachedContextTokensPerMillion: 0.5,
    costOutTokensPerMillion: 2,
    currency: "USD",
  },
};

const stripAnsi = (value: string) =>
  value.replace(/\u001B\[[0-9;]*m/g, "");

const originalPromptTagLimit =
  process.env.PS_DEBUG_PROMPT_MESSAGES_MAX_TAG_CHARS;

afterEach(() => {
  if (originalPromptTagLimit === undefined) {
    delete process.env.PS_DEBUG_PROMPT_MESSAGES_MAX_TAG_CHARS;
  } else {
    process.env.PS_DEBUG_PROMPT_MESSAGES_MAX_TAG_CHARS =
      originalPromptTagLimit;
  }
});

describe("BaseChatModel", () => {
  it("truncates oversized XML blocks without touching shorter tags", () => {
    const model = new TestChatModel(defaultConfig, "gpt-4o");
    const longBody = "x".repeat(510);

    const truncated = model.truncateXmlTags(
      `<doc>${longBody}</doc><short>ok</short>`
    );

    assert.match(truncated, /\[TRUNCATED: 10 chars\]/);
    assert.match(truncated, /<short>ok<\/short>/);
  });

  it("preserves XML text when ANSI colors are stripped", () => {
    const model = new TestChatModel(defaultConfig, "gpt-4o");
    const original = '<doc attr="value">hello</doc>';

    assert.equal(stripAnsi(model.colorCodeXml(original)), original);
  });

  it("pretty-prints numbered prompt messages using the configured tag limit", () => {
    process.env.PS_DEBUG_PROMPT_MESSAGES_MAX_TAG_CHARS = "5";
    const model = new TestChatModel(defaultConfig, "gpt-4o");

    const printed = stripAnsi(
      model.prettyPrintPromptMessages([
        { role: "system", content: "<doc>123456789</doc>" },
        { role: "user", content: "plain message" },
      ])
    );

    assert.match(printed, /Message #0 \[system\]:/);
    assert.match(printed, /Message #1 \[user\]:/);
    assert.match(printed, /\[TRUNCATED: 4 chars\]/);
  });

  it("returns a cloned config object", () => {
    const model = new TestChatModel(defaultConfig, "gpt-4o");
    const clone = model.getCloneConfig();

    assert.deepEqual(clone, defaultConfig);
    assert.notEqual(clone, model.config);
  });
});
