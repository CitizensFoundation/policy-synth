# CountWebEvidenceProcessor

The `CountWebEvidenceProcessor` class extends the `BaseProcessor` and is responsible for counting all web evidence related to a given policy. It utilizes the `EvidenceWebPageVectorStore` to retrieve web pages and count various metrics such as the total number of web pages, the number of refined web pages, and the counts of evidence and recommendations within those pages.

## Properties

| Name                          | Type                                  | Description                                           |
|-------------------------------|---------------------------------------|-------------------------------------------------------|
| evidenceWebPageVectorStore    | EvidenceWebPageVectorStore            | Instance of EvidenceWebPageVectorStore.               |

## Methods

| Name       | Parameters                                  | Return Type | Description                                             |
|------------|---------------------------------------------|-------------|---------------------------------------------------------|
| countAll   | policy: PSPolicy, subProblemIndex: number   | Promise<void> | Counts all web evidence for a given policy and sub-problem index. |
| process    |                                             | Promise<void> | Processes the counting of web evidence.                |

## Examples

```typescript
// Example usage of CountWebEvidenceProcessor
const projectId = "some_project_id";
const memory: IEngineInnovationMemoryData | undefined = await getMemoryData(projectId);
if (memory) {
  const countsProcessor = new CountWebEvidenceProcessor({} as any, memory);
  await countsProcessor.process();
}
```

Please note that the example assumes the existence of a function `getMemoryData` which retrieves the memory data for a given project ID, and that the `projectId` and `memory` variables are appropriately set.