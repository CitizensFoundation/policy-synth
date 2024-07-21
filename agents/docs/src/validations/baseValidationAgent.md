# PsBaseValidationAgent

The `PsBaseValidationAgent` class extends the `PolicySynthSimpleAgentBase` and is designed to handle validation tasks using a language model (LLM). It supports streaming responses via WebSocket and can chain multiple validation agents.

## Properties

| Name               | Type                          | Description                                                                 |
|--------------------|-------------------------------|-----------------------------------------------------------------------------|
| name               | string                        | The name of the validation agent.                                           |
| options            | PsBaseValidationAgentOptions  | Configuration options for the validation agent.                             |
| maxModelTokensOut  | number                        | Maximum number of tokens the model can output. Default is 4096.             |
| modelTemperature   | number                        | Temperature setting for the model. Default is 0.0.                          |

## Methods

| Name             | Parameters                          | Return Type                | Description                                                                 |
|------------------|-------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| constructor      | name: string, options: PsBaseValidationAgentOptions = {} | void                       | Initializes the validation agent with a name and options.                   |
| set nextAgent    | agent: PsValidationAgent            | void                       | Sets the next agent in the validation chain.                                |
| renderPrompt     |                                     | Promise<string[]>          | Renders the prompt for the LLM based on system and user messages.           |
| runValidationLLM |                                     | Promise<PsValidationAgentResult> | Runs the validation using the LLM and returns the result.                   |
| execute          |                                     | Promise<PsValidationAgentResult> | Executes the validation process, handling pre and post execution steps.     |
| beforeExecute    |                                     | Promise<void>               | Prepares the agent for execution, including sending WebSocket messages.     |
| performExecute   |                                     | Promise<PsValidationAgentResult> | Performs the main validation logic by calling the LLM.                      |
| afterExecute     | result: PsValidationAgentResult     | Promise<void>               | Finalizes the execution, including sending WebSocket messages.              |

## Example

```typescript
import { PsBaseValidationAgent } from '@policysynth/agents/validations/baseValidationAgent.js';

const options: PsBaseValidationAgentOptions = {
  systemMessage: "System message example",
  userMessage: "User message example",
  webSocket: new WebSocket("ws://example.com"),
  disableStreaming: false,
};

const validationAgent = new PsBaseValidationAgent("ExampleAgent", options);

validationAgent.execute().then(result => {
  console.log(result);
}).catch(error => {
  console.error(error);
});
```

This example demonstrates how to create and use the `PsBaseValidationAgent` with a WebSocket for streaming responses. The agent is configured with system and user messages and then executed to perform validation.