# CreateEntitiesProcessor

This class extends `BaseProlemSolvingAgent` to process and create entities affected by complex problem statements and subproblems.

## Properties

No properties are documented as public for external interaction.

## Methods

| Name                  | Parameters                                  | Return Type                        | Description                                                                 |
|-----------------------|---------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| renderRefinePrompt    | subProblemIndex: number, results: IEngineAffectedEntity[] | Promise<SystemMessage[] \| HumanMessage[]> | Generates messages for refining the entities affected by a subproblem.      |
| renderCreatePrompt    | subProblemIndex: number                     | Promise<SystemMessage[] \| HumanMessage[]> | Generates messages for creating entities affected by a subproblem.          |
| createEntities        |                                             | Promise<void>                     | Processes subproblems to create and refine entities.                        |
| process               |                                             | Promise<void>                     | Initiates the entity creation process for all subproblems.                  |

## Example

```typescript
// Example usage of CreateEntitiesProcessor
import { CreateEntitiesProcessor } from '@policysynth/agents/problems/create/createEntities.js';
import { IEngineConstants } from '@policysynth/agents/constants.js';

const processor = new CreateEntitiesProcessor();

// Assuming IEngineConstants and other required setups are already configured
processor.process().then(() => {
  console.log("Entities creation and refinement process completed.");
});
```