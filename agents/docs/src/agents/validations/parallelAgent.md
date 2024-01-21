# PsParallelValidationAgent

`PsParallelValidationAgent` is a class that extends `PsBaseValidationAgent` to perform parallel execution of multiple validation agents. It aggregates the results of each agent to determine the overall validation result.

## Properties

| Name     | Type                         | Description                                   |
|----------|------------------------------|-----------------------------------------------|
| agents   | PsBaseValidationAgent[]      | An array of `PsBaseValidationAgent` instances to be executed in parallel. |

## Methods

| Name              | Parameters                  | Return Type                 | Description                                                                 |
|-------------------|-----------------------------|-----------------------------|-----------------------------------------------------------------------------|
| execute           | -                           | Promise<PsValidationAgentResult> | Executes all agents in parallel and aggregates their results.                |
| aggregateResults  | results: PsValidationAgentResult[] | PsValidationAgentResult     | Aggregates the results of all executed agents into a single result object.  |

## Examples

```typescript
// Example usage of PsParallelValidationAgent
import { PsBaseValidationAgent, PsValidationAgentResult } from "./baseValidationAgent.js";

// Define custom agents extending PsBaseValidationAgent
class CustomAgent1 extends PsBaseValidationAgent {
  // Implementation of CustomAgent1
}

class CustomAgent2 extends PsBaseValidationAgent {
  // Implementation of CustomAgent2
}

// Instantiate custom agents
const agent1 = new CustomAgent1("Agent1");
const agent2 = new CustomAgent2("Agent2");

// Create a PsParallelValidationAgent with the custom agents
const parallelAgent = new PsParallelValidationAgent("ParallelAgent", {}, [agent1, agent2]);

// Execute the parallel agent
parallelAgent.execute().then((result: PsValidationAgentResult) => {
  console.log("Parallel Agent Result:", result);
});
```

Note: The `PsBaseValidationAgentOptions` and `PsValidationAgentResult` types are assumed to be defined in the `baseValidationAgent.js` module, and their detailed structures are not provided here. The `execute` method logs the aggregated results to the console and assigns the `nextAgent` from the options to the aggregated result before returning it. The `aggregateResults` method is private and is used internally to combine the results from all agents.