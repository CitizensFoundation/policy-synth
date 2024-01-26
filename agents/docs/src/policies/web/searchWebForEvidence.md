# SearchWebForEvidenceProcessor

This class extends `SearchWebProcessor` to implement the functionality for searching the web for evidence related to policies. It manages the process of generating search queries, executing these queries via a search API, and storing the results.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| searchCounter | number | Tracks the number of searches performed. |

## Methods

| Name       | Parameters                                                                 | Return Type | Description                                                                                   |
|------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| searchWeb  | policy: PSPolicy, subProblemIndex: number, policyIndex: number             | Promise<void> | Searches the web for evidence related to a specific policy and stores the results.            |
| process    |                                                                            | Promise<void> | Orchestrates the process of searching the web for evidence across all policies and subproblems. |

## Example

```javascript
// Example usage of SearchWebForEvidenceProcessor
import { SearchWebForEvidenceProcessor } from '@policysynth/agents/policies/web/searchWebForEvidence.js';

const searchProcessor = new SearchWebForEvidenceProcessor();

// Assuming existence of policy, subProblemIndex, and policyIndex variables
await searchProcessor.searchWeb(policy, subProblemIndex, policyIndex);

// To process all policies and subproblems
await searchProcessor.process();
```