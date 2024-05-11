# PsBaseValidationAgent

This class extends `PolicySynthAgentBase` to provide validation functionalities using a language model. It manages the interaction with a WebSocket for real-time streaming and handles the execution of validation logic.

## Properties

| Name     | Type                             | Description                                   |
|----------|----------------------------------|-----------------------------------------------|
| name     | string                           | The name of the agent.                        |
| options  | PsBaseValidationAgentOptions     | Configuration options for the validation agent|

## Methods

| Name              | Parameters                        | Return Type                  | Description                                           |
|-------------------|-----------------------------------|------------------------------|-------------------------------------------------------|
| constructor       | name: string, options: PsBaseValidationAgentOptions = {} | void                        | Initializes the agent with the given name and options.|
| nextAgent         | agent: PsValidationAgent          | void                        | Setter for the next agent in the pipeline.            |
| renderPrompt      |                                   | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the prompt for the language model.           |
| runValidationLLM  |                                   | Promise<PsValidationAgentResult> | Runs the language model for validation.               |
| execute           |                                   | Promise<PsValidationAgentResult> | Executes the validation process.                      |
| beforeExecute     |                                   | Promise<void>               | Prepares the system before executing the agent.       |
| performExecute    |                                   | Promise<PsValidationAgentResult> | Performs the execution of the validation logic.       |
| afterExecute      | result: PsValidationAgentResult   | Promise<void>               | Finalizes the execution process after validation.     |

## Example

```typescript
// Example usage of PsBaseValidationAgent
import { PsBaseValidationAgent } from '@policysynth/agents/validations/baseValidationAgent.js';

const options = {
  webSocket: /* WebSocket instance */,
  systemMessage: "System initial message",
  userMessage: "User initial message",
  disableStreaming: false
};

const validationAgent = new PsBaseValidationAgent("ValidationAgent1", options);

validationAgent.execute().then(result => {
  console.log(result);
});
```