# CreateRootCausesSearchQueriesProcessor

This class extends `BaseProblemSolvingAgent` to create, refine, and rank search queries for identifying root causes based on a problem statement.

## Properties

| Name                          | Type                                      | Description |
|-------------------------------|-------------------------------------------|-------------|
| rootCauseWebPageTypesArray    | PSRootCauseWebPageTypes[]                 | Static array containing types of web pages related to root causes. |

## Methods

| Name                        | Parameters                                                              | Return Type | Description |
|-----------------------------|-------------------------------------------------------------------------|-------------|-------------|
| renderCreatePrompt          | searchResultType: PSRootCauseWebPageTypes                               | Promise     | Generates a prompt for creating high quality search queries. |
| renderRefinePrompt          | searchResultType: PSRootCauseWebPageTypes, searchResultsToRefine: string[] | Promise     | Generates a prompt for refining search queries. |
| renderRankPrompt            | searchResultType: PSRootCauseWebPageTypes, searchResultsToRank: string[] | Promise     | Generates a prompt for ranking search queries. |
| createRootCauseSearchQueries |                                                                         | Promise     | Creates, refines, and ranks search queries for root causes. |
| process                     |                                                                         | Promise     | Processes the creation of root cause search queries. |

## Example

```javascript
// Example usage of CreateRootCausesSearchQueriesProcessor
import { CreateRootCausesSearchQueriesProcessor } from '@policysynth/agents/problems/create/createRootCauseSearchQueries.js';

const processor = new CreateRootCausesSearchQueriesProcessor();

(async () => {
  await processor.process();
})();
```