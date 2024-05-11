# PsClassificationAgent

`PsClassificationAgent` extends `PsBaseValidationAgent` to handle classification-based routing of validation agents.

## Properties

| Name     | Type                             | Description                                   |
|----------|----------------------------------|-----------------------------------------------|
| routes   | Map<string, PsValidationAgent>   | Stores classification routes to validation agents. |

## Methods

| Name            | Parameters                              | Return Type                     | Description |
|-----------------|----------------------------------------|---------------------------------|-------------|
| constructor     | name: string, options: PsBaseValidationAgentOptions | void                            | Initializes a new instance of `PsClassificationAgent` with a name and optional settings. |
| addRoute        | classification: string, agent: PsValidationAgent | void                            | Adds a route to the agent map for a specific classification. |
| performExecute  | -                                      | Promise<PsValidationAgentResult> | Executes the validation logic, determines the classification, and routes to the appropriate agent. |
| afterExecute    | result: PsValidationAgentResult        | Promise<void>                   | Handles post-execution logic, potentially sending results over a WebSocket if configured. |

## Example

```typescript
import { PsClassificationAgent, PsValidationAgent, PsBaseValidationAgentOptions, PsValidationAgentResult } from '@policysynth/agents/validations/classificationAgent.js';

// Example initialization and usage
const options: PsBaseValidationAgentOptions = {
  webSocket: new WebSocket('ws://example.com'),
  disableStreaming: false
};

const classificationAgent = new PsClassificationAgent("ExampleAgent", options);

// Adding routes
classificationAgent.addRoute("error", new PsValidationAgent("ErrorAgent"));
classificationAgent.addRoute("success", new PsValidationAgent("SuccessAgent"));

// Execute the agent
classificationAgent.performExecute().then(result => {
  console.log("Validation Result:", result);
});
```