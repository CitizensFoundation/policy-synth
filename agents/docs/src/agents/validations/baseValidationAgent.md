# PsBaseValidationAgent

The `PsBaseValidationAgent` class extends the `PolicySynthAgentBase` class and is responsible for handling the validation of messages using a language model. It integrates with a WebSocket for streaming responses and can chain to a next agent for further processing.

## Properties

| Name     | Type                              | Description                                   |
|----------|-----------------------------------|-----------------------------------------------|
| name     | string                            | The name of the validation agent.             |
| options  | PsBaseValidationAgentOptions      | Configuration options for the validation agent. |

## Methods

| Name              | Parameters                        | Return Type                     | Description                                                                 |
|-------------------|-----------------------------------|---------------------------------|-----------------------------------------------------------------------------|
| constructor       | name: string, options: PsBaseValidationAgentOptions = {} | - | Initializes a new instance of the `PsBaseValidationAgent` class with a name and optional configuration options. |
| nextAgent         | agent: PsValidationAgent          | -                               | Sets the next agent to be used after the current validation agent.          |
| renderPrompt      | -                                 | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the prompt to be sent to the language model for validation.        |
| runValidationLLM  | -                                 | Promise<PsValidationAgentResult> | Calls the language model to perform validation and returns the result.      |
| execute           | -                                 | Promise<PsValidationAgentResult> | Executes the validation process and returns the result.                     |
| beforeExecute     | -                                 | Promise<void>                   | Performs any actions required before executing the validation agent.        |
| performExecute    | -                                 | Promise<PsValidationAgentResult> | Performs the actual execution of the validation agent.                      |
| afterExecute      | result: PsValidationAgentResult   | Promise<void>                   | Performs any actions required after executing the validation agent.         |

## Examples

```typescript
// Example usage of the PsBaseValidationAgent
const validationAgentOptions = {
  webSocket: someWebSocketInstance,
  systemMessage: "System message content",
  userMessage: "User message content",
  disableStreaming: false,
  streamingCallbacks: [/* array of streaming callback functions */],
  nextAgent: someNextValidationAgentInstance
};

const validationAgent = new PsBaseValidationAgent("MyValidationAgent", validationAgentOptions);

// Set the next agent if needed
validationAgent.nextAgent = someOtherValidationAgentInstance;

// Execute the validation agent
validationAgent.execute().then(result => {
  console.log(result);
});
```

Please note that the actual implementation of `PsBaseValidationAgentOptions`, `PsValidationAgent`, `PsValidationAgentResult`, `PsAgentStartWsOptions`, `PsAgentCompletedWsOptions`, and other related types or interfaces are not provided in the given code snippet. These should be defined elsewhere in the codebase for the above example to work correctly.