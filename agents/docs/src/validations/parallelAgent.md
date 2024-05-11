# PsParallelValidationAgent

`PsParallelValidationAgent` extends `PsBaseValidationAgent` to execute multiple validation agents in parallel and aggregate their results.

## Properties

| Name   | Type                        | Description                                   |
|--------|-----------------------------|-----------------------------------------------|
| agents | PsBaseValidationAgent[]     | An array of `PsBaseValidationAgent` instances to be executed in parallel. |

## Methods

| Name             | Parameters | Return Type                 | Description |
|------------------|------------|-----------------------------|-------------|
| constructor      | name: string, options: PsBaseValidationAgentOptions = {}, agents: PsBaseValidationAgent[] | None | Initializes a new instance of `PsParallelValidationAgent` with the specified name, options, and agents. |
| execute          | None       | Promise<PsValidationAgentResult> | Executes all agents in parallel, aggregates their results, and returns the aggregated result. |
| aggregateResults | results: PsValidationAgentResult[] | PsValidationAgentResult | Aggregates the results from all executed agents into a single result. |

## Example

```typescript
import { PsParallelValidationAgent, PsBaseValidationAgentOptions, PsValidationAgentResult } from '@policysynth/agents/validations/parallelAgent.js';

// Example usage of PsParallelValidationAgent
const agent1 = new PsBaseValidationAgent("Agent1");
const agent2 = new PsBaseValidationAgent("Agent2");
const parallelAgent = new PsParallelValidationAgent("ParallelAgent", {}, [agent1, agent2]);

parallelAgent.execute().then(result => {
  console.log(`Is Valid: ${result.isValid}`);
  console.log(`Validation Errors: ${result.validationErrors.join(", ")}`);
});
```