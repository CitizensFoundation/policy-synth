# CreateEvidenceSearchQueriesProcessor

This class extends `BaseProlemSolvingAgent` to process and create evidence search queries for policy proposals. It involves filtering policy parameters, rendering prompts for creating, refining, and ranking search queries, and managing the overall process of generating these queries based on a set of predefined evidence web page types.

## Properties

| Name                          | Type                                      | Description |
|-------------------------------|-------------------------------------------|-------------|
| evidenceWebPageTypesArray     | PSEvidenceWebPageTypes[]                  | Static array containing types of evidence web pages. |

## Methods

| Name                        | Parameters                                                                 | Return Type                                      | Description |
|-----------------------------|----------------------------------------------------------------------------|--------------------------------------------------|-------------|
| filterPolicyParameters      | policy: PSPolicy                                                           | Omit<PSPolicy, "imageUrl" \| "imagePrompt" \| "solutionIndex"> | Filters out certain parameters from the policy object. |
| renderCreatePrompt          | subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes | Promise<SystemMessage[] \| HumanMessage[]>       | Generates prompts for creating search queries. |
| renderRefinePrompt          | subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRefine: string[] | Promise<SystemMessage[] \| HumanMessage[]>       | Generates prompts for refining search queries. |
| renderRankPrompt            | subProblemIndex: number, policy: PSPolicy, searchResultType: PSEvidenceWebPageTypes, searchResultsToRank: string[] | Promise<SystemMessage[] \| HumanMessage[]>       | Generates prompts for ranking search queries. |
| lastPopulationIndex         | subProblemIndex: number                                                    | number                                            | Returns the last population index for a given sub-problem. |
| createEvidenceSearchQueries | policy: PSPolicy, subProblemIndex: number, policyIndex: number             | Promise<void>                                    | Creates, refines, and ranks evidence search queries for a policy. |
| process                     |                                                                            | Promise<void>                                    | Processes the creation of evidence search queries for all subproblems. |

## Example

```typescript
// Example usage of CreateEvidenceSearchQueriesProcessor
import { CreateEvidenceSearchQueriesProcessor } from '@policysynth/agents/policies/create/createEvidenceSearchQueries.ts';

const processor = new CreateEvidenceSearchQueriesProcessor();

// Assuming existence of a policy object and subProblemIndex
processor.createEvidenceSearchQueries(policy, subProblemIndex, policyIndex).then(() => {
  console.log('Evidence search queries created.');
});

processor.process().then(() => {
  console.log('Finished creating evidence search queries for all subproblems.');
});
```