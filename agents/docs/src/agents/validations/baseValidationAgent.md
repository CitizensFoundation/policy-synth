# PsBaseValidationAgent

The `PsBaseValidationAgent` class extends the `Base` class and is responsible for handling the validation process using the OpenAI's language model. It manages the interaction with the language model, processes the responses, and communicates with a WebSocket if provided.

## Properties

| Name     | Type                             | Description                                   |
|----------|----------------------------------|-----------------------------------------------|
| name     | string                           | The name of the validation agent.             |
| options  | PsBaseValidationAgentOptions     | The options for configuring the agent.        |

## Methods

| Name                | Parameters                        | Return Type                     | Description                                                                 |
|---------------------|-----------------------------------|---------------------------------|-----------------------------------------------------------------------------|
| constructor         | name: string, options: PsBaseValidationAgentOptions = {} | - | Initializes a new instance of the PsBaseValidationAgent with the given name and options. |
| nextAgent           | agent: PsValidationAgent          | void                            | Sets the next agent in the validation chain.                                |
| renderPrompt        | -                                 | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the prompt to be sent to the language model for validation.        |
| runValidationLLM    | -                                 | Promise<PsValidationAgentResult> | Runs the validation process using the language model.                       |
| execute             | -                                 | Promise<PsValidationAgentResult> | Executes the validation process and handles the result.                     |
| beforeExecute       | -                                 | Promise<void>                   | Performs any actions required before executing the validation process.       |
| performExecute      | -                                 | Promise<PsValidationAgentResult> | Performs the actual execution of the validation process.                    |
| afterExecute        | result: PsValidationAgentResult   | Promise<void>                   | Performs any actions required after executing the validation process.       |

## Examples

```typescript
// Example usage of the PsBaseValidationAgent
const validationAgentOptions = {
  webSocket: /* WebSocket instance */,
  disableStreaming: false,
  systemMessage: "System message content",
  userMessage: "User message content",
  streamingCallbacks: [/* array of streaming callback functions */]
};

const validationAgent = new PsBaseValidationAgent("MyValidationAgent", validationAgentOptions);

// Set the next agent if needed
validationAgent.nextAgent = /* another PsValidationAgent instance */;

// Execute the validation process
validationAgent.execute().then(result => {
  console.log(result);
}).catch(error => {
  console.error(error);
});
```

Please note that the actual types for `PsBaseValidationAgentOptions`, `PsValidationAgent`, `PsValidationAgentResult`, `SystemMessage`, `HumanMessage`, `PsAgentStartWsOptions`, and `PsAgentCompletedWsOptions` are not provided in the given code snippet. These should be defined elsewhere in the codebase.