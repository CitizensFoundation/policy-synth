# exportSearchQueries

This module reads a JSON file containing memory data for an engine innovation project, formats this data into HTML, and writes the HTML to a file. It showcases the problem statement, sub-problems, and entities associated with each sub-problem, including their search queries, elo ratings, and effects.

## Properties

No properties are documented as this script does not define a class or object structure with properties.

## Methods

| Name                | Parameters                                      | Return Type | Description                                                                 |
|---------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| formatElo           | elo: number \| undefined                        | number      | Formats an ELO rating by flooring it. If undefined, returns -1.             |
| formatSearchQueries | searchQueries: IEngineSearchQueries \| undefined | string      | Formats search queries into an HTML string. If undefined, returns an empty string. |

## Example

```javascript
// Example usage of exportSearchQueries
import { IEngineInnovationMemoryData } from '@policysynth/agents/solutions/tools/old/exportSearchQueries.js';

const memoryData = fs.readFileSync("/path/to/currentMemory.json", "utf-8");
const memory = JSON.parse(memoryData) as IEngineInnovationMemoryData;

// Format ELO
const formattedElo = formatElo(memory.subProblems[0].eloRating);

// Format Search Queries
const formattedSearchQueries = formatSearchQueries(memory.problemStatement.searchQueries);

console.log(formattedElo, formattedSearchQueries);
```