# PsClassificationAgent

The `PsClassificationAgent` class extends the `PsBaseValidationAgent` and is responsible for classifying input and routing it to the appropriate validation agent based on the classification result.

## Properties

| Name   | Type                              | Description                                      |
|--------|-----------------------------------|--------------------------------------------------|
| routes | Map<string, PsValidationAgent>    | A map that holds classification routes to agents.|

## Constructor

### PsClassificationAgent

Creates an instance of `PsClassificationAgent`.

```typescript
constructor(
  name: string,
  options: PsBaseValidationAgentOptions = {}
)
```

| Parameter | Type                          | Description                                      |
|-----------|-------------------------------|--------------------------------------------------|
| name      | string                        | The name of the classification agent.            |
| options   | PsBaseValidationAgentOptions  | Optional configuration options for the agent.    |

## Methods

### addRoute

Adds a route for a specific classification to a validation agent.

```typescript
addRoute(classification: string, agent: PsValidationAgent): void
```

| Parameter      | Type                | Description                                      |
|----------------|---------------------|--------------------------------------------------|
| classification | string              | The classification string to route.              |
| agent          | PsValidationAgent   | The validation agent to route to.                |

### performExecute

Executes the classification and routes to the appropriate validation agent.

```typescript
protected async performExecute(): Promise<PsValidationAgentResult>
```

| Return Type                | Description                                      |
|----------------------------|--------------------------------------------------|
| Promise<PsValidationAgentResult> | The result of the validation execution.         |

### afterExecute

Handles actions after the execution of the validation, such as sending messages via WebSocket.

```typescript
protected afterExecute(result: PsValidationAgentResult): Promise<void>
```

| Parameter | Type                        | Description                                      |
|-----------|-----------------------------|--------------------------------------------------|
| result    | PsValidationAgentResult     | The result of the validation execution.          |

| Return Type                | Description                                      |
|----------------------------|--------------------------------------------------|
| Promise<void>              | A promise that resolves when the action is complete. |

## Example

```typescript
import { PsClassificationAgent } from '@policysynth/agents/validations/classificationAgent.js';
import { PsValidationAgent } from '@policysynth/agents/validations/baseValidationAgent.js';

const classificationAgent = new PsClassificationAgent('ExampleClassificationAgent');

const exampleValidationAgent: PsValidationAgent = {
  name: 'ExampleValidationAgent',
  async execute(input: string): Promise<PsValidationAgentResult> {
    // Example validation logic
    return { isValid: true };
  }
};

classificationAgent.addRoute('exampleClassification', exampleValidationAgent);

classificationAgent.performExecute().then(result => {
  console.log(result);
});
```

This example demonstrates how to create an instance of `PsClassificationAgent`, add a route to a validation agent, and execute the classification agent.