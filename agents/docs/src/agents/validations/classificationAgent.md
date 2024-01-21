# PsClassificationAgent

`PsClassificationAgent` is a class that extends `PsBaseValidationAgent` and is responsible for classifying and routing validation tasks to appropriate agents based on the classification result.

## Properties

| Name     | Type                                  | Description                                   |
|----------|---------------------------------------|-----------------------------------------------|
| routes   | Map<string, PsValidationAgent>        | A map of classification to validation agents. |

## Methods

| Name            | Parameters                            | Return Type                     | Description                                                                                   |
|-----------------|---------------------------------------|---------------------------------|-----------------------------------------------------------------------------------------------|
| addRoute        | classification: string, agent: PsValidationAgent | void                            | Adds a route to the map with a classification as the key and a validation agent as the value. |
| performExecute  |                                       | Promise<PsValidationAgentResult> | Performs the execution of the classification and routes to the next agent based on the result.|
| afterExecute    | result: PsValidationAgentResult       | Promise<void>                   | Handles post-execution logic, such as sending a message through WebSocket if enabled.         |

## Examples

```typescript
// Example usage of PsClassificationAgent
const classificationAgent = new PsClassificationAgent("exampleAgent");

// Assuming PsValidationAgent is a valid agent class and has been imported
const someValidationAgent = new PsValidationAgent("someAgent");
classificationAgent.addRoute("someClassification", someValidationAgent);

// To execute the classification agent and process the result
classificationAgent.performExecute().then(result => {
  console.log(result);
});

// After execution, to handle any post-execution logic
classificationAgent.afterExecute(result).then(() => {
  // Post-execution logic handled here
});
```