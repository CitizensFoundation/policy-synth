import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encoding_for_model } from "tiktoken";

import { AirbrakeTransport } from "../../base/winstonAirbrake.js";
import { PolicySynthAgentBase } from "../../base/agentBase.js";

class TestAgentBase extends PolicySynthAgentBase {
  createSystemMessageForTest(content: string) {
    return this.createSystemMessage(content);
  }

  createHumanMessageForTest(content: string) {
    return this.createHumanMessage(content);
  }
}

describe("PolicySynthAgentBase", () => {
  it("creates trimmed system and user messages", () => {
    const agent = new TestAgentBase();

    assert.deepEqual(agent.createSystemMessageForTest("  system prompt \n"), {
      role: "system",
      message: "system prompt",
    });
    assert.deepEqual(agent.createHumanMessageForTest("  user prompt \n"), {
      role: "user",
      message: "user prompt",
    });
  });

  it("extracts JSON blocks from fenced responses", () => {
    const agent = new TestAgentBase();

    assert.equal(
      agent.getJsonBlock("prefix\n```json\n{\"count\":1}\n```\nsuffix"),
      '{"count":1}'
    );
    assert.equal(agent.getJsonBlock("no fenced block here"), null);
    assert.equal(agent.getJsonBlock("prefix\n```json\n{\"count\":1}"), null);
  });

  it("parses fenced JSON and repairs malformed JSON when needed", () => {
    const agent = new TestAgentBase();

    assert.deepEqual(
      agent.parseJsonResponse<{ count: number }>(
        '```json\n{"count":1}\n```'
      ),
      { count: 1 }
    );
    assert.deepEqual(agent.parseJsonResponse<{ count: number }>('{"count":1,}'), {
      count: 1,
    });
  });

  it("cleans trailing JSON fences when the opening fence was already stripped", () => {
    const agent = new TestAgentBase();

    assert.deepEqual(
      agent.parseJsonResponse<{ status: string }>('{"status":"ok"}\n```'),
      { status: "ok" }
    );
  });

  it("throws a normalized error when JSON cannot be repaired", () => {
    const agent = new TestAgentBase();
    const unrecoverableJson = "{foo: true false}";

    assert.throws(
      () => agent.repairJson(unrecoverableJson),
      /Unable to repair JSON/
    );
    assert.throws(
      () => agent.parseJsonResponse(unrecoverableJson),
      /Unable to parse JSON: Unable to repair JSON/
    );
  });

  it("formats numbers with the requested precision", () => {
    const agent = new TestAgentBase();

    assert.equal(agent.formatNumber(12345.678, 1), "12,345.7");
    assert.equal(agent.formatNumber(12345.678), "12,346");
  });

  it("counts message tokens and applies the name field adjustment", async () => {
    const agent = new TestAgentBase();
    const messages: PsModelMessage[] = [
      { role: "system", message: "Rules" },
      { role: "user", name: "custom_sender_name", message: "Hello" },
    ];
    const encoding = encoding_for_model("gpt-4o");

    let expected = 2;
    for (const message of messages) {
      expected += 4;
      for (const [key, value] of Object.entries(message)) {
        expected += encoding.encode(value).length;
        if (key === "name") {
          expected -= 1;
        }
      }
    }
    encoding.free();

    assert.equal(await agent.getTokensFromMessages(messages), expected);
  });

  it("redacts API keys and authorization values from log payloads", () => {
    const redactLogValue = Reflect.get(
      PolicySynthAgentBase,
      "redactLogValue"
    ) as (value: unknown) => unknown;
    const metadata = { visible: "ok" };
    Object.defineProperty(metadata, "hiddenApiKey", {
      value: "hidden-secret",
      enumerable: false,
    });
    const levelSymbol = Symbol.for("level");
    const hiddenSymbol = Symbol("hiddenApiKey");
    Object.defineProperty(metadata, hiddenSymbol, {
      value: "hidden-symbol-secret",
      enumerable: false,
    });

    const redacted = redactLogValue({
      level: "error",
      [levelSymbol]: "error",
      message:
        "request failed OPENAI_API_KEY=sk-envsecret12345 " +
        'headers={"Authorization":"Bearer sk-requestsecret12345"} ' +
        "password='correct horse' client_secret='abc,def' " +
        "AIRBRAKE_PROJECT_KEY='air brake project' " +
        "AWS_BEARER_TOKEN_BEDROCK='bedrock token value'",
      config: {
        apiKey: "sk-configsecret12345",
        bearerToken: "bearer-token-secret",
        session_token: "session-token-secret",
        jwtToken: "jwt-token-secret",
        AWS_BEARER_TOKEN_BEDROCK: "aws-bedrock-token-secret",
        AIRBRAKE_PROJECT_KEY: "airbrake-project-secret",
        modelName: "gpt-test",
        tokensIn: 42,
      },
      response: {
        headers: {
          "api-key": "azure-secret-key",
          authorization: "Bearer sk-headersecret12345",
        },
        url: "https://example.test/v1?key=AIzaSyExampleSecretKey1234567890&model=ok",
      },
      metadata,
    }) as {
      message: string;
      config: {
        apiKey: string;
        bearerToken: string;
        session_token: string;
        jwtToken: string;
        AWS_BEARER_TOKEN_BEDROCK: string;
        AIRBRAKE_PROJECT_KEY: string;
        modelName: string;
        tokensIn: number;
      };
      response: { headers: Record<string, string>; url: string };
      metadata: Record<string, unknown>;
      [levelSymbol]: string;
    };

    assert.equal(redacted.config.apiKey, "[REDACTED]");
    assert.equal(redacted.config.bearerToken, "[REDACTED]");
    assert.equal(redacted.config.session_token, "[REDACTED]");
    assert.equal(redacted.config.jwtToken, "[REDACTED]");
    assert.equal(redacted.config.AWS_BEARER_TOKEN_BEDROCK, "[REDACTED]");
    assert.equal(redacted.config.AIRBRAKE_PROJECT_KEY, "[REDACTED]");
    assert.equal(redacted.config.modelName, "gpt-test");
    assert.equal(redacted.config.tokensIn, 42);
    assert.equal(redacted.response.headers["api-key"], "[REDACTED]");
    assert.equal(redacted.response.headers.authorization, "[REDACTED]");
    assert.equal(
      redacted.message.includes("sk-envsecret12345"),
      false
    );
    assert.equal(
      redacted.message.includes("sk-requestsecret12345"),
      false
    );
    assert.equal(
      redacted.response.url.includes("AIzaSyExampleSecretKey1234567890"),
      false
    );
    assert.match(redacted.message, /\[REDACTED\]/);
    assert.equal(redacted.message.includes("correct horse"), false);
    assert.equal(redacted.message.includes("abc,def"), false);
    assert.equal(redacted.message.includes("air brake project"), false);
    assert.equal(redacted.message.includes("bedrock token value"), false);
    assert.match(redacted.response.url, /key=\[REDACTED\]&model=ok/);
    assert.equal(redacted.metadata.visible, "ok");
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        redacted.metadata,
        "hiddenApiKey"
      ),
      false
    );
    assert.equal(redacted[levelSymbol], "error");
    assert.equal(
      Object.prototype.propertyIsEnumerable.call(redacted, levelSymbol),
      true
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(redacted.metadata, hiddenSymbol),
      false
    );
  });

  it("initializes an Airbrake transport when Airbrake env vars are present", () => {
    const originalProjectId = process.env.AIRBRAKE_PROJECT_ID;
    const originalProjectKey = process.env.AIRBRAKE_PROJECT_KEY;
    const originalIgnored = process.env.AIRBRAKE_IGNORED_ERRORS;
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.AIRBRAKE_PROJECT_ID = "123";
    process.env.AIRBRAKE_PROJECT_KEY = "project-key";
    process.env.AIRBRAKE_IGNORED_ERRORS = "skip, ignore";
    process.env.NODE_ENV = "test";
    const initLogger = Reflect.get(PolicySynthAgentBase, "initLogger") as
      | (() => import("winston").Logger)
      | undefined;

    try {
      assert.ok(initLogger);
      const logger = initLogger.call(PolicySynthAgentBase);
      const airbrakeTransport = logger.transports.find(
        (transport) => transport instanceof AirbrakeTransport
      ) as AirbrakeTransport | undefined;

      assert.ok(airbrakeTransport);
      const notifier = Reflect.get(airbrakeTransport, "notifier") as {
        close?: () => void;
      };
      notifier.close?.();
      assert.deepEqual(Reflect.get(airbrakeTransport, "ignoredErrorMessages"), [
        "skip",
        "ignore",
      ]);
    } finally {
      if (originalProjectId === undefined) {
        delete process.env.AIRBRAKE_PROJECT_ID;
      } else {
        process.env.AIRBRAKE_PROJECT_ID = originalProjectId;
      }
      if (originalProjectKey === undefined) {
        delete process.env.AIRBRAKE_PROJECT_KEY;
      } else {
        process.env.AIRBRAKE_PROJECT_KEY = originalProjectKey;
      }
      if (originalIgnored === undefined) {
        delete process.env.AIRBRAKE_IGNORED_ERRORS;
      } else {
        process.env.AIRBRAKE_IGNORED_ERRORS = originalIgnored;
      }
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = originalNodeEnv;
      }
    }
  });
});
