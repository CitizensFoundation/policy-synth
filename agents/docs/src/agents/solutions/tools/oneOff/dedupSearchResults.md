# DeduplicateSearchProcessor

A class responsible for deduplicating search results based on a specific property across different sections of a memory object.

## Properties

| Name               | Type                                  | Description                                      |
|--------------------|---------------------------------------|--------------------------------------------------|
| memory             | IEngineInnovationMemoryData           | The memory data to process for deduplication.    |
| deduplicatedCount  | number                                | The count of deduplicated items.                 |
| totalCount         | number                                | The total count of items before deduplication.   |
| seenUrls           | Map<string, Set<string>>              | A map to track seen URLs for deduplication.      |

## Methods

| Name                          | Parameters                                  | Return Type                       | Description                                                                 |
|-------------------------------|---------------------------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| deduplicateArrayByProperty    | arr: Array<IEngineSearchResultItem>, prop: string, id: string | Array<IEngineSearchResultItem> | Deduplicates an array of search result items by a given property.           |
| deduplicateSubProblems        | searchQueryType: IEngineWebPageTypes        | void                             | Deduplicates search results within sub-problems for a given search query type. |
| deduplicateEntities           | subProblemIndex: number, searchQueryType: IEngineWebPageTypes | void                             | Deduplicates search results within entities of a sub-problem for a given search query type. |
| deduplicateProblemStatement   | searchQueryType: IEngineWebPageTypes        | void                             | Deduplicates search results within the problem statement for a given search query type. |
| process                       |                                             | void                             | Processes the deduplication for all sections of the memory object.          |

## Examples

```typescript
// Example usage of DeduplicateSearchProcessor
const memory: IEngineInnovationMemoryData = /* ... */;
const deduplicateSearchProcessor = new DeduplicateSearchProcessor(memory);
deduplicateSearchProcessor.process();
```

**Note:** The actual implementation of `IEngineInnovationMemoryData`, `IEngineSearchResultItem`, and `IEngineWebPageTypes` is not provided in the given code snippet. These should be defined elsewhere in the project.