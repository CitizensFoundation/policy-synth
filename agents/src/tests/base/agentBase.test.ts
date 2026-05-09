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
