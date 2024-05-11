# CreateRootCausesSearchQueriesProcessor

This class extends `BaseProblemSolvingAgent` to create, refine, and rank search queries for identifying root causes based on a problem statement.

## Properties

| Name                          | Type                                  | Description               |
|-------------------------------|---------------------------------------|---------------------------|
| rootCauseWebPageTypesArray    | PSRootCauseWebPageTypes[]             | Static array of predefined types of web pages related to root causes. |

## Methods

| Name                        | Parameters                                                                 | Return Type | Description                                                                 |
|-----------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderCreatePrompt          | searchResultType: PSRootCauseWebPageTypes                                 | Promise     | Generates a prompt for creating search queries based on a search result type. |
| renderRefinePrompt          | searchResultType: PSRootCauseWebPageTypes, searchResultsToRefine: string[] | Promise     | Generates a prompt for refining search queries.                             |
| renderRankPrompt            | searchResultType: PSRootCauseWebPageTypes, searchResultsToRank: string[]   | Promise     | Generates a prompt for ranking search queries.                              |
| createRootCauseSearchQueries| -                                                                        | Promise     | Manages the creation, refinement, and ranking of search queries.            |
| process                     | -                                                                        | Promise     | Initiates the process of creating root cause search queries.                |

## Example

```typescript
import { CreateRootCausesSearchQueriesProcessor } from '@policysynth/agents/problems/create/createRootCauseSearchQueries.js';

const processor = new CreateRootCausesSearchQueriesProcessor();

// Example usage to start the process
processor.process().then(() => {
  console.log("Processing complete.");
}).catch(error => {
  console.error("Error during processing:", error);
});
```