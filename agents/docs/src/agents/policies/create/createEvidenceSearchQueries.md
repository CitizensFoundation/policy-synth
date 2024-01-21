# CreateEvidenceSearchQueriesProcessor

The `CreateEvidenceSearchQueriesProcessor` class extends the `BaseProcessor` class and is responsible for generating, refining, and ranking search queries based on a given problem statement and policy proposal. It utilizes a set of guidelines to ensure the search queries are high quality and evidence-focused.

## Properties

| Name                             | Type                                             | Description                                                                 |
|----------------------------------|--------------------------------------------------|-----------------------------------------------------------------------------|
| evidenceWebPageTypesArray        | `PSEvidenceWebPageTypes[]`                       | An array of evidence web page types used to categorize search queries.      |

## Methods

| Name                         | Parameters                                      | Return Type | Description                                                                                   |
|------------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| filterPolicyParameters       | policy: `PSPolicy`                              | `Omit<PSPolicy, "imageUrl" | "imagePrompt" | "solutionIndex">` | Filters out certain properties from a policy object.                                          |
| renderCreatePrompt           | subProblemIndex: `number`, policy: `PSPolicy`, searchResultType: `PSEvidenceWebPageTypes` | `Promise<SystemMessage[] | HumanMessage[]>` | Generates a prompt for creating search queries.                                               |
| renderRefinePrompt           | subProblemIndex: `number`, policy: `PSPolicy`, searchResultType: `PSEvidenceWebPageTypes`, searchResultsToRefine: `string[]` | `Promise<SystemMessage[] | HumanMessage[]>` | Generates a prompt for refining search queries.                                               |
| renderRankPrompt             | subProblemIndex: `number`, policy: `PSPolicy`, searchResultType: `PSEvidenceWebPageTypes`, searchResultsToRank: `string[]` | `Promise<SystemMessage[] | HumanMessage[]>` | Generates a prompt for ranking search queries.                                                |
| lastPopulationIndex          | subProblemIndex: `number`                       | `number`    | Retrieves the last population index for a given sub-problem.                                   |
| createEvidenceSearchQueries  | policy: `PSPolicy`, subProblemIndex: `number`, policyIndex: `number` | `Promise<void>` | Creates, refines, and ranks evidence search queries for a given policy.                       |
| process                      | -                                               | `Promise<void>` | Orchestrates the creation of evidence search queries for all subproblems.                      |

## Examples

```typescript
// Example usage of CreateEvidenceSearchQueriesProcessor
const processor = new CreateEvidenceSearchQueriesProcessor();
await processor.process();
```

Note: The `PSPolicy`, `PSEvidenceWebPageTypes`, and other custom types used in the parameters and return types are not defined in the provided code snippet and should be defined elsewhere in the codebase.