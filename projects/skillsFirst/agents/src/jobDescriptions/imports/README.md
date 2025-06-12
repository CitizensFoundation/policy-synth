# Job Description Sheet Import

`SheetsJobDescriptionImportAgent` loads job descriptions from Google Sheets and returns them as structured objects.

## How it works

- The agent obtains a `PsBaseSheetConnector` using `PsConnectorFactory`.
- It reads rows from the configured sheet (default tab **Sheet1**) starting at row 1.
- The first two rows are treated as headers. Data from row three onward is parsed into `JobDescription` objects.
- `importJobDescriptions()` reads from a single connector, while `importJobDescriptionsFromAllConnectors()` loops over every registered spreadsheet connector.

## Configuration

1. **Connector registration** – A Google Sheets connector (`PsGoogleSheetsConnector`) must be registered when running the agent. See `runAgents.ts` for an example.
2. **Sheet name** – Pass a sheet/tab name to the constructor if the default `Sheet1` does not match your data.
3. **Headers** – The sheet must use the same two‑row header format as produced by `SheetsJobDescriptionExportAgent` so the importer can reconstruct each field correctly.

After configuring a connector and sheet, call the import methods to load job descriptions into memory for further processing.

## Example

The snippet below assumes you have already run `runAgents.ts` once so the Google
Sheets connector is registered. It loads job descriptions from the first
registered sheet connector:

```ts
import { SheetsJobDescriptionImportAgent } from "./sheetsImport.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

async function run() {
  const agent = await PsAgent.findOne({ include: ["InputConnectors"] });
  if (!agent) throw new Error("Agent not found");

  const importAgent = new SheetsJobDescriptionImportAgent(
    agent,
    {},
    0,
    100,
    "Sheet1"
  );
  const data = await importAgent.importJobDescriptions();
  console.log(`Loaded ${data.jobDescriptions.length} from ${data.connectorName}`);
}

run().catch(console.error);
```

### Sheet Header Format

The sheet must use a two-row header. The first row contains full object paths
while the second row has short names:

| Row 1 (full path)                                           | Row 2 (short)    |
| ----------------------------------------------------------- | ---------------- |
| `agentId`                                                   | `agentId`        |
| `titleCode`                                                 | `titleCode`      |
| `degreeAnalysis.needsCollegeDegree`                         | `needsCollegeDegree` |
| `degreeAnalysis.degreeRequirementStatus.isDegreeMandatory`  | `isDegreeMandatory`  |
| `readingLevelGradeAnalysis.readabilityLevel`                | `readabilityLevel`   |

Within the overall workflow defined in `../runAgents.ts`, this import agent runs
before the analysis and export steps to populate the in-memory job descriptions.
