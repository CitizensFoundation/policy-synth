# ResearchWeb

This class extends `SearchWebProcessor` to perform web searches based on given queries.

## Properties

No public properties are documented.

## Methods

| Name    | Parameters                | Return Type | Description                             |
|---------|---------------------------|-------------|-----------------------------------------|
| search  | searchQueries: string[]   | Promise<any> | Performs a web search based on the provided queries and returns the search results. |

## Example

```javascript
import { ResearchWeb } from '@policysynth/agents/webResearch/researchWeb.js';

async function performWebSearch() {
  const researchWeb = new ResearchWeb();
  const searchQueries = ["policy synthesis", "AI in public decision making"];
  const results = await researchWeb.search(searchQueries);
  console.log(results);
}

performWebSearch();
```