# RankRootCausesSearchResultsProcessor

This class extends `RankRootCausesSearchQueriesProcessor` to rank root causes search results based on their relevance to the problem statement.

## Properties

No public properties are documented.

## Methods

| Name             | Parameters                        | Return Type                     | Description |
|------------------|-----------------------------------|---------------------------------|-------------|
| voteOnPromptPair | index: number, promptPair: number[] | Promise<IEnginePairWiseVoteResults> | Asynchronously votes on a pair of prompts by comparing their relevance to the problem statement. |
| process          |                                   | Promise<void>                   | Processes the ranking of search results for each root cause type and updates the memory with ordered results. |

## Example

```typescript
// Example usage of RankRootCausesSearchResultsProcessor
import { RankRootCausesSearchResultsProcessor } from '@policysynth/agents/problems/ranking/rankRootCausesSearchResults.js';

const processor = new RankRootCausesSearchResultsProcessor();

// Example method calls
await processor.process();
```