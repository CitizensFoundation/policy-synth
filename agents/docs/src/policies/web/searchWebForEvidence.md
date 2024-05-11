# SearchWebForEvidenceProcessor

This class extends `SearchWebProcessor` to implement the functionality of searching the web for evidence related to policies. It manages the search queries, handles API rate limits, and logs the progress and results of the searches.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| searchCounter | number | Counter for the number of searches performed. |

## Methods

| Name       | Parameters                                             | Return Type | Description |
|------------|--------------------------------------------------------|-------------|-------------|
| searchWeb  | policy: PSPolicy, subProblemIndex: number, policyIndex: number | Promise<void> | Performs web searches based on the evidence search queries associated with a policy, handles API rate limits, and logs the search progress. |
| process    | -                                                      | Promise<void> | Orchestrates the web search process for all policies across all subproblems, manages URL deduplication, and logs the overall progress. |

## Example

```typescript
import { SearchWebForEvidenceProcessor } from '@policysynth/agents/policies/web/searchWebForEvidence.js';

const searchProcessor = new SearchWebForEvidenceProcessor();
await searchProcessor.process();
```