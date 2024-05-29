# CreateRootCausesSearchQueriesProcessor

The `CreateRootCausesSearchQueriesProcessor` class is responsible for generating, refining, and ranking search queries to identify root causes based on a problem statement and a search query type. It extends the `BaseProblemSolvingAgent` class.

## Properties

| Name                   | Type                              | Description                                                                 |
|------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| generateInLanguage     | string \| undefined               | The language in which to generate search queries. Defaults to "Icelandic".  |
| rootCauseWebPageTypesArray | PSRootCauseWebPageTypes[]     | An array of predefined root cause web page types.                           |

## Methods

| Name                   | Parameters                                                                 | Return Type | Description                                                                 |
|------------------------|---------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderCreatePrompt     | searchResultType: PSRootCauseWebPageTypes                                  | Promise<any[]> | Generates a prompt for creating search queries.                             |
| renderRefinePrompt     | searchResultType: PSRootCauseWebPageTypes, searchResultsToRefine: string[] | Promise<any[]> | Generates a prompt for refining search queries.                             |
| renderRankPrompt       | searchResultType: PSRootCauseWebPageTypes, searchResultsToRank: string[]   | Promise<any[]> | Generates a prompt for ranking search queries.                              |
| createRootCauseSearchQueries | None                                                                | Promise<void> | Creates root cause search queries for each type in `rootCauseWebPageTypesArray`. |
| process                | None                                                                      | Promise<void> | Main processing function to create root cause search queries.               |

## Example

```typescript
import { CreateRootCausesSearchQueriesProcessor } from '@policysynth/agents/problems/create/createRootCauseSearchQueries.js';

const processor = new CreateRootCausesSearchQueriesProcessor();
processor.process();
```

## Types

```typescript
type PSRootCauseWebPageTypes = 
  | "caseStudies"
  | "economicRootCause"
  | "scientificRootCause"
  | "culturalRootCause"
  | "socialRootCause"
  | "environmentalRootCause"
  | "legalRootCause"
  | "technologicalRootCause"
  | "geopoliticalRootCause"
  | "historicalRootCause"
  | "ethicalRootCause";
```