# DeduplicateSearchProcessor

This class is responsible for deduplicating search results based on specific properties to avoid processing duplicate data across different parts of a search problem.

## Properties

| Name              | Type                          | Description                                   |
|-------------------|-------------------------------|-----------------------------------------------|
| memory            | PsBaseMemoryData              | Memory data structure used for processing.    |
| deduplicatedCount | number                        | Counter for the number of deduplicated items. |
| totalCount        | number                        | Total count of items before deduplication.    |
| seenUrls          | Map<string, Set<string>>      | Tracks URLs that have been seen to avoid duplicates. |

## Methods

| Name                          | Parameters                                             | Return Type                     | Description                                                                 |
|-------------------------------|--------------------------------------------------------|---------------------------------|-----------------------------------------------------------------------------|
| deduplicateArrayByProperty    | arr: Array<IEngineSearchResultItem>, prop: string, id: string | Array<IEngineSearchResultItem> | Deduplicates an array of search result items based on a specified property. |
| deduplicateSubProblems        | searchQueryType: IEngineWebPageTypes                   | void                            | Deduplicates all sub-problems for a given search query type.                |
| deduplicateEntities           | subProblemIndex: number, searchQueryType: IEngineWebPageTypes | void                            | Deduplicates entities within a sub-problem for a given search query type.   |
| deduplicateProblemStatement   | searchQueryType: IEngineWebPageTypes                   | void                            | Deduplicates the problem statement for a given search query type.           |
| process                       | None                                                   | void                            | Processes deduplication for all components of the problem.                  |

## Example

```typescript
import { DeduplicateSearchProcessor } from '@policysynth/agents/solutions/tools/oneOff/dedupSearchResults.js';

// Assuming `memory` is already defined as PsBaseMemoryData
const dedupper = new DeduplicateSearchProcessor(memory);
dedupper.process();
```