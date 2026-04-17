import assert from "node:assert/strict";
import { describe, it } from "node:test";

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

  it("formats numbers with the requested precision", () => {
    const agent = new TestAgentBase();

    assert.equal(agent.formatNumber(12345.678, 1), "12,345.7");
    assert.equal(agent.formatNumber(12345.678), "12,346");
  });
});
