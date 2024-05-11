# CreateProsConsProcessor

This class extends `BaseProblemSolvingAgent` to specifically handle the creation and refinement of pros and cons for solutions to subproblems.

## Properties

No properties are directly defined in this class.

## Methods

| Name                  | Parameters                                                                 | Return Type            | Description                                                                 |
|-----------------------|----------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| renderCurrentSolution | solution: IEngineSolution                                                  | string                 | Renders the current solution details into a formatted string.               |
| renderRefinePrompt    | prosOrCons: string, results: string[], subProblemIndex: number, solution: IEngineSolution | Promise<SystemMessage[]> | Generates messages for refining pros or cons of a solution.                 |
| renderCreatePrompt    | prosOrCons: string, subProblemIndex: number, solution: IEngineSolution     | Promise<SystemMessage[]> | Generates messages for creating pros or cons of a solution.                 |
| createProsCons        | -                                                                          | Promise<void>          | Processes all subproblems to create or refine pros and cons for solutions.  |
| process               | -                                                                          | Promise<void>          | Overrides the base class process method to handle pros and cons creation.   |

## Example

```typescript
// Example usage of CreateProsConsProcessor
import { CreateProsConsProcessor } from '@policysynth/agents/solutions/create/createProsCons.js';

const processor = new CreateProsConsProcessor();
processor.process().then(() => {
  console.log('Processing complete.');
}).catch(error => {
  console.error('Error during processing:', error);
});
```