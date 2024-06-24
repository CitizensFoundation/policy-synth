# exportSearchQueries

This file is responsible for generating an HTML document that outlines the problem statement, sub-problems, and associated search queries from a given memory data file. It reads memory data from a JSON file, formats it, and then writes an HTML file that visualizes the problem statement, sub-problems, entities, and their search queries.

## Properties

No properties are directly defined in this module.

## Methods

| Name                 | Parameters                                      | Return Type | Description                                                                 |
|----------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| formatElo            | elo: number \| undefined                        | number      | Formats the ELO rating by flooring it. If undefined, returns -1.            |
| formatSearchQueries  | searchQueries: PsSearchQueries \| undefined | string      | Formats the search queries into an HTML string. If undefined, returns an empty string. |

## Example

```typescript
import fs from "fs";
import process from "process";
import path from "path";
import { PsSmarterCrowdsourcingMemoryData } from "@policysynth/agents/solutions/tools/old/exportSearchQueries.js";

let filePath = process.argv[2] || "currentMemory.json";

if (!path.isAbsolute(filePath)) {
  filePath = path.join(process.cwd(), filePath);
}

console.log(`Reading memory from ${filePath}`);

const memoryData = fs.readFileSync(filePath, "utf-8");
const memory = JSON.parse(memoryData) as PsSmarterCrowdsourcingMemoryData;

// Example usage of formatElo and formatSearchQueries
const eloRating = formatElo(memory.eloRating);
const searchQueriesHtml = formatSearchQueries(memory.problemStatement.searchQueries);

console.log(eloRating);
console.log(searchQueriesHtml);
```