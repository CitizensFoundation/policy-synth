# PsBaseValidationAgent

The `PsBaseValidationAgent` class is a foundational agent for running validation logic using LLMs (Large Language Models) within the PolicySynth agent framework. It extends `PolicySynthSimpleAgentBase` and provides a structure for executing validation tasks, handling streaming via WebSockets, and chaining to subsequent agents.

## Properties

| Name                | Type                              | Description                                                                                 |
|---------------------|-----------------------------------|---------------------------------------------------------------------------------------------|
| name                | `string`                          | The name of the validation agent.                                                           |
| options             | `PsBaseValidationAgentOptions`     | Configuration options for the agent, including messages, callbacks, and WebSocket settings. |
| maxModelTokensOut   | `number`                          | Maximum number of tokens the model can output (default: 4096).                              |
| modelTemperature    | `number`                          | Temperature setting for the model (default: 0.0, deterministic output).                     |

## Constructor

```typescript
constructor(name: string, options: PsBaseValidationAgentOptions = {})
```

- **name**: The name of the agent.
- **options**: Optional configuration for the agent, including system/user messages, streaming callbacks, and WebSocket.

Initializes the agent, sets up streaming callbacks if a WebSocket is provided and streaming is enabled.

## Methods

| Name                | Parameters                                      | Return Type                    | Description                                                                                      |
|---------------------|------------------------------------------------|--------------------------------|--------------------------------------------------------------------------------------------------|
| set nextAgent       | agent: PsValidationAgent                        | void                           | Sets the next agent to be executed after this one.                                               |
| renderPrompt        | none                                            | `Promise<PsModelMessage[]>`    | Renders the prompt for the LLM using system and user messages from options.                      |
| runValidationLLM    | none                                            | `Promise<PsValidationAgentResult>` | Calls the LLM with the rendered prompt and returns the validation result.                        |
| execute             | none                                            | `Promise<PsValidationAgentResult>` | Orchestrates the validation process: runs before/after hooks, executes validation, handles errors.|
| beforeExecute       | none                                            | `Promise<void>`                | Sends an "agentStart" message via WebSocket if streaming is enabled.                             |
| performExecute      | none                                            | `Promise<PsValidationAgentResult>` | Performs the core validation logic (calls `runValidationLLM`).                                   |
| afterExecute        | result: PsValidationAgentResult                 | `Promise<void>`                | Sends an "agentCompleted" message via WebSocket if streaming is enabled.                         |

### Method Details

#### set nextAgent

Sets the next agent to be executed after this one.

```typescript
set nextAgent(agent: PsValidationAgent): void
```

#### renderPrompt

Renders the prompt for the LLM using the system and user messages from the options.

```typescript
protected async renderPrompt(): Promise<PsModelMessage[]>
```

#### runValidationLLM

Calls the LLM with the rendered prompt and returns the validation result.

```typescript
async runValidationLLM(): Promise<PsValidationAgentResult>
```

#### execute

Orchestrates the validation process, including before/after hooks, error handling, and chaining to the next agent.

```typescript
async execute(): Promise<PsValidationAgentResult>
```

#### beforeExecute

Sends an "agentStart" message via WebSocket if streaming is enabled.

```typescript
protected beforeExecute(): Promise<void>
```

#### performExecute

Performs the core validation logic by calling `runValidationLLM`.

```typescript
protected async performExecute(): Promise<PsValidationAgentResult>
```

#### afterExecute

Sends an "agentCompleted" message via WebSocket if streaming is enabled.

```typescript
protected afterExecute(result: PsValidationAgentResult): Promise<void>
```

## Example

```typescript
import { PsBaseValidationAgent } from '@policysynth/agents/validations/baseValidationAgent.js';

const options = {
  systemMessage: "You are a validation agent.",
  userMessage: "Please validate the following input.",
  webSocket: myWebSocketInstance, // Optional: for streaming
};

const validationAgent = new PsBaseValidationAgent("InputValidator", options);

validationAgent.execute().then(result => {
  if (result.isValid) {
    console.log("Validation passed!");
  } else {
    console.error("Validation failed:", result.validationErrors);
  }
});
```

## Notes

- **Streaming Support**: If a WebSocket is provided and streaming is enabled, the agent will send token streams and status updates over the socket.
- **Chaining**: The agent supports chaining to a `nextAgent` for multi-step validation processes.
- **Error Handling**: System errors are caught and reported as validation errors.
- **Prompt Construction**: Requires both `systemMessage` and `userMessage` in options to construct the LLM prompt.

---

**File:** `@policysynth/agents/validations/baseValidationAgent.js`