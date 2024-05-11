# RankProsConsProcessor

This class extends `BasePairwiseRankingsProcessor` to specifically handle the ranking of pros and cons associated with different solution components within a problem-solving context.

## Properties

No public properties are documented for this class.

## Methods

| Name                    | Parameters                                                                                      | Return Type                        | Description                                                                 |
|-------------------------|-------------------------------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------|
| voteOnPromptPair        | subProblemIndex: number, promptPair: number[], additionalData: { solution: string; prosOrCons: "pros" \| "cons"; subProblemIndex: number; } | Promise<IEnginePairWiseVoteResults> | Processes a pair of prompts (pros or cons) and determines which is more relevant or important. |
| convertProsConsToObjects| prosCons: string[]                                                                              | IEngineProCon[]                    | Converts an array of pros or cons strings into an array of IEngineProCon objects. |
| process                 | -                                                                                               | Promise<void>                      | Orchestrates the overall process of ranking pros and cons for all subproblems. |
| processSubProblem       | subProblem: IEngineSubProblem, subProblemIndex: number                                          | Promise<void>                      | Handles the ranking of pros and cons for a specific subproblem. |
| renderSolution          | solution: IEngineSolution                                                                       | string                             | Generates a formatted string representation of a solution component. |

## Example

```typescript
import { RankProsConsProcessor } from '@policysynth/agents/solutions/ranking/rankProsCons.js';

// Example instantiation and usage
const rankProcessor = new RankProsConsProcessor();

// Example method usage
rankProcessor.process().then(() => {
  console.log("Completed processing all sub problems for pros and cons ranking.");
}).catch(error => {
  console.error("Error during processing:", error);
});
```