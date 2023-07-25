import ioredis from "ioredis";
import { IEngineConstants } from "../../../constants.js";
import fs from "fs";
import process from "process";
import path from "path";

const maxFullDetailSolutions = 10;

let filePath = process.argv[2] || "currentMemory.json";

if (!path.isAbsolute(filePath)) {
  filePath = path.join(process.cwd(), filePath);
}

console.log(`Reading memory from ${filePath}`);

const memoryData = fs.readFileSync(filePath, "utf-8");
const memory = JSON.parse(memoryData) as IEngineInnovationMemoryData;

const formatElo = (elo: number | undefined) => Math.floor(elo || -1);

let html = `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Problem and Solutions</title>
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
            `<li>${result.title} - <a href="${
              //@ts-ignore
              result.url || result.link
            }">${
              //@ts-ignore
              result.url || result.link
            }</a></li>`
        )
        .join("")}
    </ul>
`;

for (
  let s = 0;
  s < Math.min(memory.subProblems.length, IEngineConstants.maxSubProblems);
  s++
) {
  const subProblem = memory.subProblems[s];
  const solutions = subProblem.solutions.populations[0];

  html += `
    <div class="card">
      <h2>Sub Problem: ${subProblem.title} (${formatElo(subProblem.eloRating)})</h2>
      <p>${subProblem.description}</p>
      <h3>Solutions:</h3>
  `;

  for (let i = 0; i < solutions.length; i++) {
    let solution = solutions[i];

    let pros = solution.pros;
    let cons = solution.cons;

    //@ts-ignore
    if (solution.pros && Array.isArray(solution.pros.pros)) {
      //@ts-ignore
      pros = solution.pros.pros.map((pro) => { return {description: pro }});
      console.log(pros);
    } else if (!solution.pros || !Array.isArray(solution.pros)) {
      pros = [];
    }
    //@ts-ignore
    if (solution.cons && Array.isArray(solution.cons.cons)) {
      //@ts-ignore
      cons = solution.cons.cons.map((con) => {return { description: con}});
    } else if (!solution.cons || !Array.isArray(solution.cons)) {
      cons = [];
    }


    if (i < maxFullDetailSolutions) {
      html += `
        <div class="card">
          <h3>${solution.title} (${formatElo(solution.eloRating)})</h3>
          <p>${solution.description}</p>
          ${
            Array.isArray(pros) && pros.length > 0
              ? `<h4>Pros:</h4>
                <ul>
                ${(pros as IEngineProCon[])
                  .slice(0, IEngineConstants.maxTopProsConsUsedForRanking)
                  .map(
                    (pro) =>
                      `<li>${pro.description} (${formatElo(pro.eloRating)})</li>`
                  )
                  .join("")}
                </ul>`
              : "<h4>No pros</h4>"
          }

          ${
            Array.isArray(cons) && cons.length > 0
              ? `<h4>Cons:</h4>
                <ul>
                ${(cons as IEngineProCon[])
                  .slice(0, IEngineConstants.maxTopProsConsUsedForRanking)
                  .map(
                    (con) =>
                      `<li>${con.description} (${formatElo(con.eloRating)})</li>`
                  )
                  .join("")}
                </ul>`
              : "<h4>No cons</h4>"
          }
                  </div>
      `;
    } else {
      html += `<h4>${solution.title} (${formatElo(solution.eloRating)})</h4>`;
    }
  }

  html += `</div>`;
}

html += `
  </body>
  </html>
`;

fs.writeFile("/tmp/problem_solutions2.html", html, (err) => {
  if (err) throw err;
  console.log("HTML file has been saved!");
  process.exit(0);
});
