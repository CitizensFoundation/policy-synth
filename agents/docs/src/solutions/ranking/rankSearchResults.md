# RankSearchResultsProcessor

This class processes and ranks search results related to problem statements, sub-problems, and entities using pairwise ranking.

## Properties

| Name                | Type                        | Description                                   |
|---------------------|-----------------------------|-----------------------------------------------|
| subProblemIndex     | number                      | Index of the current sub-problem.             |
| entitiesIndex       | number                      | Index of the current entity.                  |
| currentEntity       | IEngineAffectedEntity       | The current entity being processed.           |
| searchResultType    | IEngineWebPageTypes         | Type of the search result being processed.    |
| searchResultTarget  | IEngineWebPageTargets       | Target of the search result being processed.  |

## Methods

| Name                 | Parameters                                      | Return Type                  | Description                                                                 |
|----------------------|-------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| renderProblemDetail  |                                                 | string                       | Renders detailed information based on the current search result target.     |
| voteOnPromptPair     | subProblemIndex: number, promptPair: number[]   | Promise<IEnginePairWiseVoteResults> | Votes on a pair of prompts to determine their relevance.                    |
| processSubProblems   | searchResultType: IEngineWebPageTypes           | Promise<void>                | Processes and ranks search results for all sub-problems.                    |
| processEntities      | subProblemIndex: number, searchResultType: IEngineWebPageTypes | Promise<void>                | Processes and ranks search results for entities within a sub-problem.       |
| process              |                                                 | Promise<void>                | Main method to process and rank search results for problem statements, sub-problems, and entities. |

## Example

```typescript
import { RankSearchResultsProcessor } from '@policysynth/agents/solutions/ranking/rankSearchResults.js';

const processor = new RankSearchResultsProcessor();

// Example usage to process and rank search results
processor.process().then(() => {
  console.log("Processing and ranking of search results completed.");
});
```