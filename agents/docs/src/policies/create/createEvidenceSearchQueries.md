# CreateEvidenceSearchQueriesProcessor

This class extends `BaseProblemSolvingAgent` to create, refine, and rank evidence search queries for policy proposals based on various types of evidence.

## Properties

| Name                          | Type                                  | Description                                       |
|-------------------------------|---------------------------------------|---------------------------------------------------|
| evidenceWebPageTypesArray     | PSEvidenceWebPageTypes[]              | Static array of evidence types for web pages.     |

## Methods

| Name                        | Parameters                                                                                   | Return Type | Description                                                                 |
|-----------------------------|----------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| filterPolicyParameters      | policy: PSPolicy                                                                             | Omit<PSPolicy, "imageUrl" | "imagePrompt" | "solutionIndex"> | Filters out specific parameters from a policy object.                       |
| renderCreatePrompt          | subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes          | Promise<Message[]> | Generates a prompt for creating search queries.                             |
| renderRefinePrompt          | subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRefine: string[] | Promise<Message[]> | Generates a prompt for refining search queries.                             |
| renderRankPrompt            | subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRank: string[]     | Promise<Message[]> | Generates a prompt for ranking search queries.                              |
| lastPopulationIndex         | subProblemIndex: number                                                                      | number       | Returns the last index of the population for a given sub-problem.           |
| createEvidenceSearchQueries | policy: PSPolicy, subProblemIndex: number, policyIndex: number                               | Promise<void> | Creates, refines, and ranks evidence search queries for a given policy.     |
| process                     | -                                                                                            | Promise<void> | Processes the creation of evidence search queries for all subproblems.      |

## Example

```typescript
import { CreateEvidenceSearchQueriesProcessor } from '@policysynth/agents/policies/create/createEvidenceSearchQueries.js';

// Example usage of CreateEvidenceSearchQueriesProcessor
const processor = new CreateEvidenceSearchQueriesProcessor();

// Example of creating evidence search queries for a policy
processor.process().then(() => {
  console.log("Finished processing evidence search queries.");
});
```