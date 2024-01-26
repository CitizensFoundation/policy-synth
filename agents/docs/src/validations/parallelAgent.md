# PsParallelValidationAgent

This class extends `PsBaseValidationAgent` to execute multiple validation agents in parallel and aggregate their results.

## Properties

| Name   | Type                             | Description                                   |
|--------|----------------------------------|-----------------------------------------------|
| agents | PsBaseValidationAgent[]          | An array of `PsBaseValidationAgent` instances to be executed in parallel. |

## Methods

| Name             | Parameters | Return Type                  | Description                                                                 |
|------------------|------------|------------------------------|-----------------------------------------------------------------------------|
| execute          | -          | Promise<PsValidationAgentResult> | Executes all agents in parallel, aggregates their results, and returns the aggregated result. |
| aggregateResults | results: PsValidationAgentResult[] | PsValidationAgentResult | Aggregates the results from all executed agents into a single result. |

## Example

```javascript
import { PsParallelValidationAgent } from '@policysynth/agents/validations/parallelAgent.js';
import { PsBaseValidationAgent, PsBaseValidationAgentOptions } from './baseValidationAgent.js';

// Define custom agents extending PsBaseValidationAgent
class CustomValidationAgent extends PsBaseValidationAgent {
  async execute() {
    // Custom execution logic
    return { isValid: true, validationErrors: [] };
  }
}

// Initialize custom agents
const customAgent1 = new CustomValidationAgent("CustomAgent1");
const customAgent2 = new CustomValidationAgent("CustomAgent2");

// Initialize the parallel agent with the custom agents
const parallelAgent = new PsParallelValidationAgent("ParallelAgent", {}, [customAgent1, customAgent2]);

// Execute the parallel agent
parallelAgent.execute().then(result => {
  console.log(`Aggregated Results: ${result.isValid} ${JSON.stringify(result.validationErrors)}`);
});
```