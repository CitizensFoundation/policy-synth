# PsParallelValidationAgent

The `PsParallelValidationAgent` class extends the `PsBaseValidationAgent` class and is designed to execute multiple validation agents in parallel. It aggregates the results from all the agents and provides a combined validation result.

## Properties

| Name    | Type                     | Description                        |
|---------|--------------------------|------------------------------------|
| agents  | PsBaseValidationAgent[]  | An array of validation agents to be executed in parallel. |

## Constructor

### `constructor(name: string, options: PsBaseValidationAgentOptions = {}, agents: PsBaseValidationAgent[])`

Creates an instance of `PsParallelValidationAgent`.

| Parameter | Type                          | Description                                      |
|-----------|-------------------------------|--------------------------------------------------|
| name      | string                        | The name of the validation agent.                |
| options   | PsBaseValidationAgentOptions  | Optional configuration options for the agent.    |
| agents    | PsBaseValidationAgent[]       | An array of validation agents to be executed.    |

## Methods

### `async execute(): Promise<PsValidationAgentResult>`

Executes all the validation agents in parallel and aggregates their results.

#### Returns

| Type                      | Description                                      |
|---------------------------|--------------------------------------------------|
| Promise<PsValidationAgentResult> | A promise that resolves to the aggregated validation result. |

### `private aggregateResults(results: PsValidationAgentResult[]): PsValidationAgentResult`

Aggregates the results from multiple validation agents.

| Parameter | Type                          | Description                                      |
|-----------|-------------------------------|--------------------------------------------------|
| results   | PsValidationAgentResult[]     | An array of validation results from the agents.  |

#### Returns

| Type                      | Description                                      |
|---------------------------|--------------------------------------------------|
| PsValidationAgentResult   | The aggregated validation result.                |

## Example

```typescript
import { PsParallelValidationAgent } from '@policysynth/agents/validations/parallelAgent.js';
import { PsBaseValidationAgent, PsValidationAgentResult } from '@policysynth/agents/baseValidationAgent.js';

class SampleValidationAgent extends PsBaseValidationAgent {
  async execute(): Promise<PsValidationAgentResult> {
    // Sample validation logic
    return { isValid: true, validationErrors: [] };
  }
}

const agent1 = new SampleValidationAgent('Agent1');
const agent2 = new SampleValidationAgent('Agent2');

const parallelAgent = new PsParallelValidationAgent('ParallelAgent', {}, [agent1, agent2]);

parallelAgent.execute().then(result => {
  console.log(result);
});
```

This example demonstrates how to create and use the `PsParallelValidationAgent` to execute multiple validation agents in parallel and aggregate their results.