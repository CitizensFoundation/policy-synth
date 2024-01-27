# RankSearchResultsProcessor

This class extends `BasePairwiseRankingsProcessor` to rank search results based on their relevance to a given problem statement, sub-problems, and entities within those sub-problems. It utilizes a language model to assess the relevance of pairs of search results and ranks them accordingly.

## Properties

| Name                | Type                                  | Description |
|---------------------|---------------------------------------|-------------|
| subProblemIndex     | number                                | Index of the current sub-problem being processed. |
| entitiesIndex       | number                                | Index of the current entity being processed within a sub-problem. |
| currentEntity       | IEngineAffectedEntity                 | The current entity being processed for ranking. |
| searchResultType    | IEngineWebPageTypes                   | The type of search result being processed (e.g., general, scientific). |
| searchResultTarget  | IEngineWebPageTargets                 | The target of the search result being processed (e.g., problemStatement, subProblem, entity). |

## Methods

| Name                  | Parameters                                             | Return Type                     | Description |
|-----------------------|--------------------------------------------------------|---------------------------------|-------------|
| renderProblemDetail   |                                                        | string                          | Renders the detail of the current problem, sub-problem, or entity being processed. |
| voteOnPromptPair      | subProblemIndex: number, promptPair: number[]          | Promise<IEnginePairWiseVoteResults> | Votes on a pair of prompts to determine which is more relevant to the problem at hand. |
| processSubProblems    | searchResultType: IEngineWebPageTypes                  | Promise<void>                   | Processes and ranks the search results for all sub-problems. |
| processEntities       | subProblemIndex: number, searchResultType: IEngineWebPageTypes | Promise<void>                   | Processes and ranks the search results for all entities within a sub-problem. |
| process               |                                                        | Promise<void>                   | Main method to start the ranking process for all components: problem statement, sub-problems, and entities. |

## Example

```javascript
// Example usage of RankSearchResultsProcessor
import { RankSearchResultsProcessor } from '@policysynth/agents/solutions/ranking/rankSearchResults.js';

const rankProcessor = new RankSearchResultsProcessor();

// Assuming setup and initialization steps are done, to start the process:
await rankProcessor.process();
```