# CreateEvidenceSearchQueriesProcessor

This class extends `BaseProblemSolvingAgent` to process and create evidence search queries for policy proposals. It utilizes various prompts to generate, refine, and rank search queries based on the policy's details and the type of evidence needed.

## Properties

| Name                          | Type                                  | Description |
|-------------------------------|---------------------------------------|-------------|
| evidenceWebPageTypesArray     | PSEvidenceWebPageTypes[]              | Static array containing types of evidence web page queries. |

## Methods

| Name                      | Parameters                                                                 | Return Type                                              | Description |
|---------------------------|----------------------------------------------------------------------------|----------------------------------------------------------|-------------|
| filterPolicyParameters    | policy: PSPolicy                                                           | Omit<PSPolicy, "imageUrl" | "imagePrompt" | "solutionIndex"> | Filters out certain parameters from a policy object. |
| renderCreatePrompt        | subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes | Promise<[SystemMessage, HumanMessage]>                   | Generates a prompt for creating search queries based on a policy and its sub-problem. |
| renderRefinePrompt        | subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRefine: string[] | Promise<[SystemMessage, HumanMessage]>                   | Generates a prompt for refining search queries based on a policy, its sub-problem, and initial search results. |
| renderRankPrompt          | subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRank: string[] | Promise<[SystemMessage, HumanMessage]>                   | Generates a prompt for ranking search queries based on a policy, its sub-problem, and search results to refine. |
| lastPopulationIndex       | subProblemIndex: number                                                     | number                                                    | Returns the last population index for a given sub-problem. |
| createEvidenceSearchQueries | policy: PSPolicy, subProblemIndex: number, policyIndex: number             | Promise<void>                                            | Creates, refines, and ranks evidence search queries for a given policy. |
| process                   |                                                                            | Promise<void>                                            | Processes the creation of evidence search queries for all sub-problems and policies. |

## Example

```javascript
// Example usage of CreateEvidenceSearchQueriesProcessor
import { CreateEvidenceSearchQueriesProcessor } from '@policysynth/agents/policies/create/createEvidenceSearchQueries.js';

const processor = new CreateEvidenceSearchQueriesProcessor();

// Assuming existence of a policy object and a subProblemIndex
processor.createEvidenceSearchQueries(policy, subProblemIndex, policyIndex).then(() => {
  console.log("Evidence search queries created and processed.");
});
```