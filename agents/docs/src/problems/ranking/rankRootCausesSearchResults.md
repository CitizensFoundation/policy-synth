# RankRootCausesSearchResultsProcessor

This class extends `RankRootCausesSearchQueriesProcessor` to rank root causes search results based on their relevance to the problem statement.

## Methods

| Name             | Parameters                        | Return Type                     | Description                                                                 |
|------------------|-----------------------------------|---------------------------------|-----------------------------------------------------------------------------|
| voteOnPromptPair | index: number, promptPair: number[] | Promise<IEnginePairWiseVoteResults> | Ranks a pair of search results based on their relevance to the problem statement. |
| process          |                                   | Promise<void>                   | Processes the ranking of root causes search results.                        |

## Example

```typescript
import { RankRootCausesSearchResultsProcessor } from '@policysynth/agents/problems/ranking/rankRootCausesSearchResults.ts';

// Initialize the processor with necessary parameters
const rankRootCausesSearchResultsProcessor = new RankRootCausesSearchResultsProcessor();

// Example usage of voteOnPromptPair method
const index = 0;
const promptPair = [1, 2];
const voteResults = await rankRootCausesSearchResultsProcessor.voteOnPromptPair(index, promptPair);
console.log(voteResults);

// Example usage of process method
await rankRootCausesSearchResultsProcessor.process();
```