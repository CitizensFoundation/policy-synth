# SearchWebForEvidenceProcessor

The `SearchWebForEvidenceProcessor` class extends the `SearchWebProcessor` class and is responsible for searching the web for evidence related to policies within sub-problems. It manages search queries, rate limits, and the storage of search results.

## Properties

| Name           | Type   | Description                                           |
|----------------|--------|-------------------------------------------------------|
| searchCounter  | number | Counter for the number of search queries performed.   |

## Methods

| Name          | Parameters                                  | Return Type | Description                                                                                   |
|---------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| searchWeb     | policy: PSPolicy, subProblemIndex: number, policyIndex: number | Promise<void> | Performs web searches for evidence based on the given policy, sub-problem index, and policy index. |
| process       | -                                           | Promise<void> | Orchestrates the process of searching the web for evidence across all sub-problems and policies. |

## Examples

```typescript
// Example usage of the SearchWebForEvidenceProcessor
const searchProcessor = new SearchWebForEvidenceProcessor();
await searchProcessor.process();
```

**Note:** The `PSPolicy` type and other related types are not defined in the provided code snippet. To generate complete documentation, these types should be provided. Additionally, the `logger`, `memory`, `seenUrls`, and `lastPopulationIndex` members are used within the methods but are not defined in the provided code snippet. They are likely inherited from the `SearchWebProcessor` or `BaseProcessor` classes.