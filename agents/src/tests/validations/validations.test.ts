import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = "test";
process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";

const [
  { PsAgentOrchestrator },
  { PsBaseValidationAgent },
  { PsClassificationAgent },
  { PsParallelValidationAgent },
] = await Promise.all([
  import("../../validations/agentOrchestrator.js"),
  import("../../validations/baseValidationAgent.js"),
  import("../../validations/classificationAgent.js"),
  import("../../validations/parallelAgent.js"),
]);

class MockWebSocket {
  sent: unknown[] = [];

  send(message: string) {
    this.sent.push(JSON.parse(message));
  }
}

class StubValidationAgent extends PsBaseValidationAgent {
  nextResult: PsValidationAgentResult | undefined = { isValid: true };
  shouldThrow = false;
  renderedMessages: PsModelMessage[] | undefined;

  exposeRenderPrompt() {
    return this.renderPrompt();
  }

  override async callLLM(
    _stage: string,
    messages: PsModelMessage[],
    _parseJson?: boolean,
    _tokenOutEstimate?: number,
    _streamingCallbacks?: Function
  ) {
    this.renderedMessages = messages;
    return this.nextResult;
  }

  protected override async performExecute(): Promise<PsValidationAgentResult> {
    if (this.shouldThrow) {
      throw new Error("perform failed");
    }
    return super.performExecute();
  }
}

class StubClassificationAgent extends PsClassificationAgent {
  nextClassification: PsClassificationAgentResult = {
    isValid: true,
    classification: "default",
  };

  override async callLLM(
    _stage: string,
    _messages: PsModelMessage[],
    _parseJson?: boolean,
    _tokenOutEstimate?: number,
    _streamingCallbacks?: Function
  ) {
    return this.nextClassification;
  }
}

const createValidationOptions = (
  overrides: Partial<PsBaseValidationAgentOptions> = {}
): PsBaseValidationAgentOptions => ({
  systemMessage: "System prompt",
  userMessage: "User prompt",
  ...overrides,
});

describe("PsBaseValidationAgent", () => {
  it("renders prompts, streams websocket events, and returns LLM results", async () => {
    const webSocket = new MockWebSocket();
    const agent = new StubValidationAgent(
      "Base",
      createValidationOptions({ webSocket, hasNoStreaming: true })
    );
    const nextAgent = {
      name: "Next",
      execute: async () => ({ isValid: true }),
    } satisfies PsValidationAgent;
    agent.nextAgent = nextAgent;
    agent.nextResult = { isValid: true };

    assert.equal(agent.options.streamingCallbacks?.length, 1);
    agent.options.streamingCallbacks[0].handleLLMNewToken("token");

    const result = await agent.execute();

    assert.deepEqual(agent.renderedMessages, [
      { role: "system", message: "System prompt" },
      { role: "user", message: "User prompt" },
    ]);
    assert.equal(result.nextAgent, nextAgent);
    assert.deepEqual(
      webSocket.sent.map((event) => (event as { type: string }).type),
      ["stream", "agentStart", "agentCompleted"]
    );
    assert.deepEqual(webSocket.sent[1], {
      sender: "bot",
      type: "agentStart",
      message: { name: "Base", noStreaming: true },
    });
    assert.deepEqual(webSocket.sent[2], {
      sender: "bot",
      type: "agentCompleted",
      message: {
        name: "Base",
        results: { isValid: true, lastAgent: false },
      },
    });
  });

  it("does not add websocket callbacks when streaming is disabled", () => {
    const agent = new StubValidationAgent(
      "Disabled",
      createValidationOptions({
        webSocket: new MockWebSocket(),
        disableStreaming: true,
      })
    );

    assert.equal(agent.options.streamingCallbacks, undefined);
  });

  it("surfaces missing prompt and undefined LLM response failures", async () => {
    const missingPromptAgent = new StubValidationAgent("Missing");
    await assert.rejects(
      () => missingPromptAgent.exposeRenderPrompt(),
      /System or user message is undefined/
    );

    const undefinedResponseAgent = new StubValidationAgent(
      "Undefined",
      createValidationOptions()
    );
    undefinedResponseAgent.nextResult = undefined;
    await assert.rejects(
      () => undefinedResponseAgent.runValidationLLM(),
      /LLM response is undefined/
    );
  });

  it("normalizes unexpected execution failures", async () => {
    const agent = new StubValidationAgent("Failing", createValidationOptions());
    const nextAgent = {
      name: "After failure",
      execute: async () => ({ isValid: true }),
    } satisfies PsValidationAgent;
    agent.nextAgent = nextAgent;
    agent.shouldThrow = true;

    assert.deepEqual(await agent.execute(), {
      isValid: false,
      validationErrors: ["Unkown system error in validation agent"],
      nextAgent,
    });
  });
});

describe("PsClassificationAgent", () => {
  it("routes classification results to the matching next agent", async () => {
    const webSocket = new MockWebSocket();
    const agent = new StubClassificationAgent(
      "Classifier",
      createValidationOptions({ webSocket })
    );
    const routedAgent = {
      name: "Routed",
      execute: async () => ({ isValid: true }),
    } satisfies PsValidationAgent;
    agent.addRoute("target", routedAgent);
    agent.nextClassification = {
      isValid: true,
      classification: "target",
    };

    const result = await agent.execute();

    assert.equal(result.nextAgent, routedAgent);
    assert.deepEqual(webSocket.sent.at(-1), {
      sender: "bot",
      type: "agentCompleted",
      message: {
        name: "Classifier",
        results: { isValid: true, lastAgent: false },
      },
    });
  });
});

describe("PsParallelValidationAgent", () => {
  it("aggregates validity and errors from child agents", async () => {
    const nextAgent = {
      name: "After parallel",
      execute: async () => ({ isValid: true }),
    } satisfies PsValidationAgent;
    const validAgent = new StubValidationAgent("Valid", createValidationOptions());
    validAgent.nextResult = { isValid: true };
    const invalidAgent = new StubValidationAgent(
      "Invalid",
      createValidationOptions()
    );
    invalidAgent.nextResult = {
      isValid: false,
      validationErrors: ["bad input"],
    };
    const parallel = new PsParallelValidationAgent(
      "Parallel",
      createValidationOptions({ nextAgent }),
      [validAgent, invalidAgent]
    );

    assert.deepEqual(await parallel.execute(), {
      isValid: false,
      validationErrors: ["bad input"],
      nextAgent,
    });
  });
});

describe("PsAgentOrchestrator", () => {
  it("executes a chain until it completes", async () => {
    const calls: string[] = [];
    const secondAgent = {
      name: "Second",
      execute: async (input: string) => {
        calls.push(`second:${input}`);
        return { isValid: true };
      },
    } satisfies PsValidationAgent;
    const firstAgent = {
      name: "First",
      execute: async (input: string) => {
        calls.push(`first:${input}`);
        return { isValid: true, nextAgent: secondAgent };
      },
    } satisfies PsValidationAgent;

    assert.deepEqual(await new PsAgentOrchestrator().execute(firstAgent, "input"), {
      isValid: true,
    });
    assert.deepEqual(calls, ["first:input", "second:input"]);
  });

  it("short-circuits on invalid results or validation errors", async () => {
    const invalidResult = {
      isValid: false,
      validationErrors: ["stop"],
    };
    const invalidAgent = {
      name: "Invalid",
      execute: async () => invalidResult,
    } satisfies PsValidationAgent;
    assert.equal(
      await new PsAgentOrchestrator().execute(invalidAgent, "input"),
      invalidResult
    );

    const errorsOnlyResult = {
      isValid: true,
      validationErrors: ["warning"],
    };
    const errorsOnlyAgent = {
      name: "ErrorsOnly",
      execute: async () => errorsOnlyResult,
    } satisfies PsValidationAgent;
    assert.equal(
      await new PsAgentOrchestrator().execute(errorsOnlyAgent, "input"),
      errorsOnlyResult
    );
  });
});
