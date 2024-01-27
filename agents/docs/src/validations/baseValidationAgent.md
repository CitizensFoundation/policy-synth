# PsBaseValidationAgent

This class extends `PolicySynthAgentBase` to provide base functionality for validation agents in the PolicySynth framework. It initializes with a name and options, sets up a ChatOpenAI instance for communication, and defines methods for executing the validation logic.

## Properties

| Name     | Type                              | Description                                   |
|----------|-----------------------------------|-----------------------------------------------|
| name     | string                            | The name of the validation agent.             |
| options  | PsBaseValidationAgentOptions      | Configuration options for the validation agent|

## Methods

| Name              | Parameters                        | Return Type                     | Description                                                                 |
|-------------------|-----------------------------------|---------------------------------|-----------------------------------------------------------------------------|
| constructor       | name: string, options: PsBaseValidationAgentOptions = {} | -                           | Initializes the validation agent with a name and optional configuration.    |
| nextAgent         | agent: PsValidationAgent          | void                            | Setter for the next agent in the validation chain.                          |
| renderPrompt      | -                                 | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the prompt for the language model based on system and user messages.|
| runValidationLLM  | -                                 | Promise<PsValidationAgentResult>| Runs the validation logic through a language model and returns the result.  |
| execute           | -                                 | Promise<PsValidationAgentResult>| Orchestrates the validation process, including pre and post execution steps.|
| beforeExecute     | -                                 | Promise<void>                   | Prepares the environment before executing the validation logic.             |
| performExecute    | -                                 | Promise<PsValidationAgentResult>| Directly executes the validation logic.                                     |
| afterExecute      | result: PsValidationAgentResult   | Promise<void>                   | Finalizes the execution process, including sending results over WebSocket.  |

## Example

```javascript
// Example usage of PsBaseValidationAgent
import { PsBaseValidationAgent } from '@policysynth/agents/validations/baseValidationAgent.js';

const validationAgentOptions = {
  webSocket: yourWebSocketInstance,
  systemMessage: "Your system message here",
  userMessage: "Your user message here",
  disableStreaming: false,
  // Other options as needed
};

const validationAgent = new PsBaseValidationAgent("YourAgentName", validationAgentOptions);

validationAgent.execute().then(result => {
  console.log(result);
}).catch(error => {
  console.error(error);
});
```