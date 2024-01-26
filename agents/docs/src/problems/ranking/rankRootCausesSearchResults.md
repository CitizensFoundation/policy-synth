# RankRootCausesSearchResultsProcessor

This class extends `RankRootCausesSearchQueriesProcessor` to rank root causes search results based on their relevance to the problem statement.

## Methods

| Name             | Parameters                          | Return Type                     | Description                                                                 |
|------------------|-------------------------------------|---------------------------------|-----------------------------------------------------------------------------|
| voteOnPromptPair | index: number, promptPair: number[] | Promise<IEnginePairWiseVoteResults> | Ranks a pair of search results based on their relevance to the problem statement. |
| process          |                                     | Promise<void>                   | Processes and ranks all root causes search results.                         |

## Example

```typescript
import { RankRootCausesSearchResultsProcessor } from '@policysynth/agents/problems/ranking/rankRootCausesSearchResults.js';

const rankRootCausesSearchResultsProcessor = new RankRootCausesSearchResultsProcessor();

// Assuming necessary setup and initialization steps have been performed
await rankRootCausesSearchResultsProcessor.process();
```