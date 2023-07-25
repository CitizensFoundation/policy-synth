import fs from "fs";
import process from "process";
import path from "path";
import { IEngineConstants } from "../../../constants.js";
let filePath = process.argv[2] || "currentMemory.json";
if (!path.isAbsolute(filePath)) {
    filePath = path.join(process.cwd(), filePath);
}
console.log(`Reading memory from ${filePath}`);
const memoryData = fs.readFileSync(filePath, "utf-8");
const memory = JSON.parse(memoryData);
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
`;
for (let s = 0; s < Math.min(memory.subProblems.length, IEngineConstants.maxSubProblems); s++) {
    const subProblem = memory.subProblems[s];
    const solutions = subProblem.solutions.seed;
    for (const solution of solutions) {
        let pros = Array.isArray(solution.pros) ? solution.pros : [];
        let cons = Array.isArray(solution.cons) ? solution.cons : [];
        pros = pros.map((pro) => typeof pro === "string" ? pro : pro.description);
        cons = cons.map((con) => typeof con === "string" ? con : con.description);
        html += `
      <div class="card">
        <h2>Solution: ${solution.title}</h2>

        ${pros.length > 0
            ? `<h3>Pros:</h3>
              <ul>
              ${pros.map((pro) => `<li>${pro}</li>`).join("")}
              </ul>`
            : ""}

        ${cons.length > 0
            ? `<h3>Cons:</h3>
              <ul>
              ${cons.map((con) => `<li>${con}</li>`).join("")}
              </ul>`
            : ""}
      </div>
    `;
    }
}
html += `
  </body>
  </html>
`;
fs.writeFile("/tmp/pros_cons.html", html, (err) => {
    if (err)
        throw err;
    console.log("HTML file has been saved!");
    process.exit(0);
});
