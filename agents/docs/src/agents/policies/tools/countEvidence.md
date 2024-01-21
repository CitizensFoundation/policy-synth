# CountWebEvidenceProcessor

The `CountWebEvidenceProcessor` class extends the `BaseProcessor` class and is responsible for counting all web evidence related to a policy. It utilizes the `EvidenceWebPageVectorStore` to retrieve web pages and count various metrics such as the total number of web pages, refined counts, evidence counts, and recommendation counts.

## Properties

| Name                          | Type                                  | Description                                           |
|-------------------------------|---------------------------------------|-------------------------------------------------------|
| evidenceWebPageVectorStore    | EvidenceWebPageVectorStore            | Instance of EvidenceWebPageVectorStore.               |

## Methods

| Name       | Parameters                                  | Return Type | Description                                             |
|------------|---------------------------------------------|-------------|---------------------------------------------------------|
| countAll   | policy: PSPolicy, subProblemIndex: number   | Promise<void> | Counts all web evidence for a given policy and sub-problem index. |
| process    | None                                        | Promise<void> | Processes the counting of web evidence.                |

## Examples

```typescript
// Example usage of CountWebEvidenceProcessor
const memory: IEngineInnovationMemoryData = /* ... */;
const counts = new CountWebEvidenceProcessor({} as any, memory);
await counts.process();
```

# run

A standalone async function that retrieves a project ID from the command line arguments, fetches the corresponding memory data from Redis, and then processes the counting of web evidence using an instance of `CountWebEvidenceProcessor`.

## Properties

This function does not define properties.

## Methods

This function does not define methods.

## Examples

```typescript
// Example usage of the run function
run();
```

Please note that the types `PSPolicy`, `PSEvidenceRawWebPageData`, and `IEngineInnovationMemoryData` are not defined in the provided code snippet, so you should ensure these types are defined elsewhere in your codebase for the above documentation to be accurate.