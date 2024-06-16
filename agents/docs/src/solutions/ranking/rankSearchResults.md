# RankSearchResultsProcessor

This class processes and ranks search results related to problem statements, sub-problems, and entities using pairwise ranking.

## Properties

| Name                | Type                        | Description                                   |
|---------------------|-----------------------------|-----------------------------------------------|
| subProblemIndex     | number                      | Index of the current sub-problem.             |
| entitiesIndex       | number                      | Index of the current entity.                  |
| currentEntity       | PsAffectedEntity       | The current entity being processed.           |
| searchResultType    | PsWebPageTypes         | Type of the search result being processed.    |
| searchResultTarget  | PsWebPageTargets       | Target of the search result being processed.  |

## Methods

| Name                 | Parameters                                      | Return Type                  | Description                                                                 |
|----------------------|-------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| renderProblemDetail  |                                                 | string                       | Renders detailed information based on the current search result target.     |
| voteOnPromptPair     | subProblemIndex: number, promptPair: number[]   | Promise<PsPairWiseVoteResults> | Votes on a pair of prompts to determine their relevance.                    |
| processSubProblems   | searchResultType: PsWebPageTypes           | Promise<void>                | Processes and ranks search results for all sub-problems.                    |
| processEntities      | subProblemIndex: number, searchResultType: PsWebPageTypes | Promise<void>                | Processes and ranks search results for entities within a sub-problem.       |
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