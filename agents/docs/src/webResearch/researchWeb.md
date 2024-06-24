# ResearchWeb

This class extends the `SearchWebProcessor` to perform web searches based on given queries.

## Properties

No public properties are documented.

## Methods

| Name    | Parameters                  | Return Type            | Description                             |
|---------|-----------------------------|------------------------|-----------------------------------------|
| search  | searchQueries: string[]     | Promise<SearchResult[]>| Performs web searches and returns the results. |

## Example

```typescript
import { ResearchWeb } from '@policysynth/agents/webResearch/researchWeb.js';
import { PsSmarterCrowdsourcingMemoryData } from 'path/to/PsSmarterCrowdsourcingMemoryData';

const memoryData: PsSmarterCrowdsourcingMemoryData = /* Initialize memory data */;
const researchWeb = new ResearchWeb(memoryData);

const searchQueries = ["policy synthesis", "AI research"];
researchWeb.search(searchQueries).then(results => {
  console.log(results);
});
```