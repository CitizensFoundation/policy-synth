# CreateEntitiesProcessor

This class extends `BaseProblemSolvingAgent` to handle the creation and refinement of entities affected by complex problem statements and subproblems.

## Properties

No public properties are documented for this class.

## Methods

| Name                  | Parameters                                  | Return Type | Description                                                                 |
|-----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderRefinePrompt    | subProblemIndex: number, results: PsAffectedEntity[] | Promise<SystemMessage[] \| HumanMessage[]> | Generates messages for refining previously identified entities.             |
| renderCreatePrompt    | subProblemIndex: number                     | Promise<SystemMessage[] \| HumanMessage[]> | Generates messages for the initial creation of entities based on subproblems. |
| createEntities        |                                             | Promise<void> | Manages the creation and optional refinement of entities for all subproblems. |
| process               |                                             | Promise<void> | Orchestrates the overall process of entity creation and logs the process.    |

## Example

```typescript
// Example usage of CreateEntitiesProcessor
import { CreateEntitiesProcessor } from '@policysynth/agents/problems/create/createEntities.js';

const processor = new CreateEntitiesProcessor();

// Assuming necessary setup and context are provided
processor.process().then(() => {
  console.log("Entity processing complete.");
}).catch(error => {
  console.error("An error occurred during entity processing:", error);
});
```