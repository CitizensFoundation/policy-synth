# PsParallelValidationAgent

A validation agent that runs multiple validation agents in parallel and aggregates their results. This agent is useful when you want to validate an input using several independent validation strategies and combine their outcomes.

**File:** `@policysynth/agents/validations/parallelAgent.js`

## Properties

| Name    | Type                              | Description                                      |
|---------|-----------------------------------|--------------------------------------------------|
| agents  | PsBaseValidationAgent[]           | The array of validation agents to run in parallel.|

## Constructor

```typescript
constructor(
  name: string,
  options: PsBaseValidationAgentOptions = {},
  agents: PsBaseValidationAgent[],
)
```

- **name**: `string`  
  The name of the parallel validation agent.

- **options**: `PsBaseValidationAgentOptions` (optional)  
  Configuration options for the agent.

- **agents**: `PsBaseValidationAgent[]`  
  The list of validation agents to execute in parallel.

## Methods

| Name              | Parameters                                   | Return Type                | Description                                                                                 |
|-------------------|----------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------|
| execute           | none                                         | Promise<PsValidationAgentResult> | Executes all child agents in parallel, aggregates their results, and returns the combined result. |
| aggregateResults  | results: PsValidationAgentResult[]           | PsValidationAgentResult    | Aggregates the results from all parallel agents into a single validation result.             |

### execute

Runs all the child validation agents in parallel, aggregates their results, and returns a single `PsValidationAgentResult`. The `nextAgent` property is set from the options if provided.

#### Returns

- `Promise<PsValidationAgentResult>`: The aggregated validation result.

### aggregateResults

Aggregates the results from all parallel agents. If any agent returns `isValid: false`, the overall result is invalid. All validation errors are combined.

#### Parameters

- **results**: `PsValidationAgentResult[]`  
  The results from each parallel agent.

#### Returns

- `PsValidationAgentResult`: The aggregated result.

## Example

```typescript
import { PsParallelValidationAgent } from '@policysynth/agents/validations/parallelAgent.js';
import { PsBaseValidationAgent } from '@policysynth/agents/validations/baseValidationAgent.js';

// Example: Two simple validation agents
class AlwaysValidAgent extends PsBaseValidationAgent {
  async execute() {
    return { isValid: true, validationErrors: [] };
  }
}

class AlwaysInvalidAgent extends PsBaseValidationAgent {
  async execute() {
    return { isValid: false, validationErrors: ['Invalid input'] };
  }
}

const agent1 = new AlwaysValidAgent('ValidAgent');
const agent2 = new AlwaysInvalidAgent('InvalidAgent');

const parallelAgent = new PsParallelValidationAgent(
  'ParallelAgent',
  {},
  [agent1, agent2]
);

parallelAgent.execute().then(result => {
  console.log(result.isValid); // false
  console.log(result.validationErrors); // ['Invalid input']
});
```

---

**Summary:**  
`PsParallelValidationAgent` is a composite validation agent that executes multiple validation agents in parallel and aggregates their results, making it easy to combine several validation strategies in a single step.