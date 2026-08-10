import assert from "node:assert/strict";
import { describe, it } from "node:test";

const SIMPLE_AGENT_ENV_KEYS = [
  "AI_MODEL_API_KEY",
  "AI_MODEL_NAME",
  "AI_MODEL_PROVIDER",
  "AI_MODEL_TYPE",
  "AI_MODEL_SIZE",
] as const;

const { PolicySynthSimpleAgentBase } = await import(
  "../../base/simpleAgent.js"
);
const { PsAiModelType } = await import("../../aiModelTypes.js");

describe("PolicySynthSimpleAgentBase", () => {
  it("pins legacy v1 accounting so flat env-price cost tracking stays correct", () => {
    const originals = new Map<string, string | undefined>(
      SIMPLE_AGENT_ENV_KEYS.map((key) => [key, process.env[key]])
    );

    process.env.AI_MODEL_API_KEY = "claude-simple-key";
    process.env.AI_MODEL_NAME = "claude-sonnet-4-20250514";
    process.env.AI_MODEL_PROVIDER = "anthropic";
    process.env.AI_MODEL_TYPE = "text";
    process.env.AI_MODEL_SIZE = "medium";

    try {
      const agent = new PolicySynthSimpleAgentBase();
      const model = agent.models.get(PsAiModelType.Text);

      assert.ok(model);
      // updateMemoryStages prices tokensIn flat via PS_MODEL_IN_COST_USD,
      // which is only correct under the v1 blended token encoding.
      assert.equal(model.config.accountingVersion, 1);
    } finally {
      for (const [key, value] of originals) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  });
});
