# PsClassificationAgent

A validation agent that performs classification using an LLM and routes execution to the next agent based on the classification result. Extends `PsBaseValidationAgent`.

## Properties

| Name    | Type                                      | Description                                                                 |
|---------|-------------------------------------------|-----------------------------------------------------------------------------|
| routes  | Map\<string, PsValidationAgent\>          | A map of classification labels to their corresponding next validation agent. |

## Constructor

| Parameters         | Type                          | Description                                                                 |
|--------------------|-------------------------------|-----------------------------------------------------------------------------|
| name               | string                        | The name of the agent.                                                      |
| options (optional) | PsBaseValidationAgentOptions   | Configuration options for the agent.                                        |

## Methods

| Name         | Parameters                                      | Return Type                    | Description                                                                                                    |
|--------------|-------------------------------------------------|--------------------------------|----------------------------------------------------------------------------------------------------------------|
| addRoute     | classification: string, agent: PsValidationAgent| void                           | Adds a route mapping a classification label to a next agent.                                                   |
| performExecute (protected) | none                              | Promise\<PsValidationAgentResult\> | Runs the LLM classification, determines the next agent, and returns the classification result.                 |
| afterExecute (protected)   | result: PsValidationAgentResult   | Promise\<void\>                | Optionally sends the result over a websocket if streaming is enabled.                                          |

## Example

```typescript
import { PsClassificationAgent } from '@policysynth/agents/validations/classificationAgent.js';

// Assume you have some agents to route to
const agentA = ...; // implements PsValidationAgent
const agentB = ...; // implements PsValidationAgent

const classificationAgent = new PsClassificationAgent("MyClassifier", {
  // options such as agentMemory, webSocket, etc.
});

// Add routes for classification results
classificationAgent.addRoute("categoryA", agentA);
classificationAgent.addRoute("categoryB", agentB);

// To execute (typically called by the agent framework)
const result = await classificationAgent.execute("Some input to classify");

// The result will include the classification and the nextAgent (if any)
console.log(result.classification); // e.g., "categoryA"
console.log(result.nextAgent);      // agentA instance
```

## Details

- **Routing:**  
  The agent uses a map (`routes`) to determine which agent to execute next based on the classification result from the LLM.
- **LLM Classification:**  
  The `performExecute` method calls `runValidationLLM()` (inherited from `PsBaseValidationAgent`), expects a `PsClassificationAgentResult`, and sets the `nextAgent` property based on the classification.
- **WebSocket Support:**  
  If a websocket is provided in the options and streaming is enabled, `afterExecute` sends an "agentCompleted" message with the validation result.
- **Extensibility:**  
  You can add as many classification routes as needed using `addRoute`.

---

**Types Used:**

- `PsValidationAgent`: Interface for validation agents.
- `PsValidationAgentResult`: Result object for validation, including `isValid`, `validationErrors`, and optionally `nextAgent`.
- `PsClassificationAgentResult`: Extends `PsValidationAgentResult` with a `classification` property.
- `PsBaseValidationAgentOptions`: Options for configuring the agent, including websocket and streaming.
- `PsAgentCompletedWsOptions`: Structure for websocket completion messages.

---

**File:**  
`@policysynth/agents/validations/classificationAgent.js`