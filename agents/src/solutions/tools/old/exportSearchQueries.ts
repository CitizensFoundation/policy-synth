import ioredis from "ioredis";
import { IEngineConstants } from "../../../constants.js";
import fs from "fs";
import process from "process";
import path from "path";

interface IEngineSearchQueries {
  general: string[];
  scientific: string[];
  news: string[];
  openData: string[];
}

let filePath = process.argv[2] || "currentMemory.json";

if (!path.isAbsolute(filePath)) {
  filePath = path.join(process.cwd(), filePath);
}

console.log(`Reading memory from ${filePath}`);

const memoryData = fs.readFileSync(filePath, "utf-8");
const memory = JSON.parse(memoryData) as IEngineInnovationMemoryData;

const formatElo = (elo: number | undefined) => Math.floor(elo || -1);

const formatSearchQueries = (
  searchQueries: IEngineSearchQueries | undefined
) => {
  if (!searchQueries) {
    return "";
  } else {
    return Object.entries(searchQueries)
      .map(
        ([key, value]) =>
          `<h3>${key}:</h3><ul>${value
            .map((query: string) => `<li>${query}</li>`)
            .join("")}</ul>`
      )
      .join("");
  }
};

let html = `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Problem, Entities, and Search Queries</title>
      <style>
        .card {
          border: 1px solid #eee;
          border-radius: 5px;
          padding: 15px;
          margin: 15px;
        }
        .card h2 {
          margin-top: 0;
        }
      </style>
  </head>
  <body>
    <h1>${memory.problemStatement.description}</h1>
    ${formatSearchQueries(memory.problemStatement.searchQueries)}
`;

for (
  let s = 0;
  s < Math.min(memory.subProblems.length, IEngineConstants.maxSubProblems);
  s++
) {
  const subProblem = memory.subProblems[s];

  html += `
    <div class="card">
      <h2>Sub Problem: ${subProblem.title} (${formatElo(
    subProblem.eloRating
  )})</h2>
      <p>${subProblem.description}</p>
      ${formatSearchQueries(subProblem.searchQueries)}
      <h3>Entities:</h3>
      <ul>
        ${subProblem.entities
          .slice(0, IEngineConstants.maxTopEntitiesToSearch)
          .map(
            (entity) =>
              `<li><b>${entity.name}</b> <br> ELO: ${formatElo(
                entity.eloRating
              )} <br> Positive Effects: ${entity.positiveEffects?.join(
                ", "
              )} <br> Negative Effects: ${entity.negativeEffects?.join(
                ", "
              )} <br> <br><b>Search Queries:</b> ${formatSearchQueries(
                entity.searchQueries
              )}</li>`
          )
          .join("")}
      </ul>
    </div>
  `;
}

html += `</body></html>`;

fs.writeFile("/tmp/search_queries2.html", html, (err) => {
  if (err) throw err;
  console.log("HTML file has been saved!");
  process.exit(0);
});
