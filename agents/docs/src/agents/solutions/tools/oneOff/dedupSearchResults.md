# DeduplicateSearchProcessor

This class is responsible for deduplicating search results based on a specific property across different sections of a memory data structure related to search queries. It maintains counts of total and deduplicated items and uses a map to track seen URLs.

## Properties

| Name               | Type                                  | Description                                       |
|--------------------|---------------------------------------|---------------------------------------------------|
| memory             | IEngineInnovationMemoryData           | The memory data structure to be processed.        |
| deduplicatedCount  | number                                | The count of deduplicated items.                  |
| totalCount         | number                                | The total count of items before deduplication.    |
| seenUrls           | Map<string, Set<string>>              | A map to track seen URLs for deduplication.       |

## Methods

| Name                          | Parameters                            | Return Type                       | Description                                                                 |
|-------------------------------|---------------------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| deduplicateArrayByProperty    | arr: Array<IEngineSearchResultItem>, prop: string, id: string | Array<IEngineSearchResultItem> | Deduplicates an array of search result items by a given property.           |
| deduplicateSubProblems        | searchQueryType: IEngineWebPageTypes | void                             | Deduplicates search results for sub-problems based on a search query type.  |
| deduplicateEntities           | subProblemIndex: number, searchQueryType: IEngineWebPageTypes  | void                             | Deduplicates search results for entities within a sub-problem.              |
| deduplicateProblemStatement   | searchQueryType: IEngineWebPageTypes | void                             | Deduplicates search results for the problem statement.                      |
| process                       |                                       | void                             | Processes the deduplication for all sections of the memory data structure.  |

## Examples

```typescript
// Example usage of DeduplicateSearchProcessor
const memory: IEngineInnovationMemoryData = /* ... obtain memory data ... */;
const deduplicateProcessor = new DeduplicateSearchProcessor(memory);
deduplicateProcessor.process();
```