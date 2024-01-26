# PsClassificationAgent

This class extends `PsBaseValidationAgent` to implement a classification-based routing mechanism for validation agents. It allows the addition of routes based on classification results and performs execution based on the classified route.

## Properties

| Name    | Type                                      | Description                                   |
|---------|-------------------------------------------|-----------------------------------------------|
| routes  | Map<string, PsValidationAgent>            | A map of classification routes to agents.     |

## Methods

| Name            | Parameters                                 | Return Type                     | Description                                                                 |
|-----------------|--------------------------------------------|---------------------------------|-----------------------------------------------------------------------------|
| constructor     | name: string, options: PsBaseValidationAgentOptions = {} | void                            | Initializes a new instance of the PsClassificationAgent with the given name and options. |
| addRoute        | classification: string, agent: PsValidationAgent | void                            | Adds a new route to the agent based on the classification.                   |
| performExecute  |                                            | Promise<PsValidationAgentResult> | Performs the execution of the agent based on the classification result and routes the execution to the next agent. |
| afterExecute    | result: PsValidationAgentResult           | Promise<void>                   | Performs actions after the execution of the agent, such as sending a message over WebSocket if configured. |

## Example

```javascript
// Example usage of PsClassificationAgent
import { PsClassificationAgent } from '@policysynth/agents/validations/classificationAgent.js';
import { PsValidationAgent, PsValidationAgentResult } from './baseValidationAgent.js'; // Assuming these are defined elsewhere

const classificationAgent = new PsClassificationAgent("ExampleAgent");

// Assuming `agentA` and `agentB` are instances of classes that extend PsValidationAgent
classificationAgent.addRoute("classificationA", agentA);
classificationAgent.addRoute("classificationB", agentB);

// To execute the classification agent and route to the next agent based on classification
classificationAgent.execute().then((result) => {
  console.log(result);
});
```