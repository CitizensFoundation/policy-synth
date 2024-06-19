# exportSolutions

This script reads a memory JSON file, processes its contents to generate an HTML document that outlines a problem statement, its search queries and results, sub-problems, and their respective solutions with pros and cons. It formats the data into a readable format and saves the output as an HTML file.

## Properties

No properties are directly defined in this script.

## Methods

No methods are directly defined in this script.

## Example

```typescript
import fs from "fs";
import process from "process";
import path from "path";
import { PsSmarterCrowdsourcingMemoryData, PsProCon } from "@policysynth/agents/solutions/tools/old/exportSolutions.js";

let filePath = process.argv[2] || "currentMemory.json";

if (!path.isAbsolute(filePath)) {
  filePath = path.join(process.cwd(), filePath);
}

console.log(`Reading memory from ${filePath}`);

const memoryData = fs.readFileSync(filePath, "utf-8");
const memory = JSON.parse(memoryData) as PsSmarterCrowdsourcingMemoryData;

// Example usage of formatting and generating HTML content based on memory data
const formatElo = (elo: number | undefined) => Math.floor(elo || -1);

let html = `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Problem and Solution Component</title>
      <style>
        .card {
          border: 1px solid #eee;
          border-radius: 5px;
          padding: 15px;
          margin: 15px;
        }
        .card h3 {
          margin-top: 0;
        }
        .card ul {
          padding-left: 20px;
        }
      </style>
  </head>
  <body>
    <h1>${memory.problemStatement.description}</h1>
    <h2>Search Queries:</h2>
    <ul>
      ${memory.problemStatement.searchQueries.general
        .map((query) => `<li>${query}</li>`)
        .join("")}
    </ul>
    <h2>Search Results:</h2>
    <ul>
      ${memory.problemStatement.searchResults.pages.general
        .map(
          (result) =>
            `<li>${result.title} - <a href="${result.url || result.link}">${result.url || result.link}</a></li>`
        )
        .join("")}
    </ul>
    ...
`;

fs.writeFile("/tmp/problem_solutions2.html", html, (err) => {
  if (err) throw err;
  console.log("HTML file has been saved!");
  process.exit(0);
});
```