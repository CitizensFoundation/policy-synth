import { SheetsJobDescriptionImportAgent } from "./sheetsImport.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

async function run() {
  // Assume `runAgents.ts` has already registered a Google Sheets connector
  // for this agent in the database.
  const agent = await PsAgent.findOne({ include: ["InputConnectors"] });
  if (!agent) {
    throw new Error("Agent not found");
  }

  const memory: any = {};
  const importAgent = new SheetsJobDescriptionImportAgent(
    agent,
    memory,
    0,
    100,
    "Sheet1"
  );

  const result = await importAgent.importJobDescriptions();
  console.log(
    `Imported ${result.jobDescriptions.length} job descriptions from ${result.connectorName}`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
