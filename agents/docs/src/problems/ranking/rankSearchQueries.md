# RankSearchQueriesProcessor

This class extends `BasePairwiseRankingsProcessor` to rank search queries related to problem statements, sub-problems, and entities based on their relevance.

## Properties

No public properties are documented.

## Methods

| Name                  | Parameters                                                                                                                                                                                                 | Return Type                        | Description                                                                                                           |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| renderProblemDetail   | additionalData: { subProblemIndex: number, currentEntity?: IEngineAffectedEntity, searchQueryType?: IEngineWebPageTypes, searchQueryTarget: "problemStatement" \| "subProblem" \| "entity" }             | string                             | Renders detailed information about the problem, sub-problem, or entity based on the provided search query target.     |
| voteOnPromptPair      | index: number, promptPair: number[], additionalData: { currentEntity?: IEngineAffectedEntity, searchQueryType?: IEngineWebPageTypes, subProblemIndex: number, searchQueryTarget: "problemStatement" \| "subProblem" \| "entity" } | Promise<IEnginePairWiseVoteResults> | Processes the voting on a pair of prompts and returns the results.                                                   |
| processSubProblems    | -                                                                                                                                                                                                          | Promise<void>                      | Processes and ranks search queries for all sub-problems.                                                              |
| getQueryIndex         | searchQueryType: IEngineWebPageTypes                                                                                                                                                                       | number                             | Returns an index based on the search query type.                                                                      |
| processEntities       | subProblemIndex: number                                                                                                                                                                                    | Promise<void>                      | Processes and ranks search queries for entities within a specific sub-problem.                                        |
| process               | -                                                                                                                                                                                                          | Promise<void>                      | Main method to process and rank search queries for problem statements, sub-problems, and entities.                    |

## Example

```typescript
import { RankSearchQueriesProcessor } from '@policysynth/agents/problems/ranking/rankSearchQueries.js';

// Example usage of RankSearchQueriesProcessor
const processor = new RankSearchQueriesProcessor();

// Example of processing all sub-problems
processor.processSubProblems().then(() => {
  console.log("Sub-problems processed and ranked.");
});

// Example of processing main problem statement
processor.process().then(() => {
  console.log("Main problem statement processed and ranked.");
});
```