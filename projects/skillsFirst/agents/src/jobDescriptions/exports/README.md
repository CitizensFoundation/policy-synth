# Sheets Export

The `SheetsJobDescriptionExportAgent` converts analyzed job description results
into a flat array and pushes the data to Google Sheets. It expects the same
structure as the CSV export but writes two header rows, containing the full
object path and a short column name.

Typical usage is to create the agent with an existing `PsAgent` instance and
a `memory` object that already contains job descriptions. After analysis is
complete you can call `processJsonData` to push the results:

```ts
const exportAgent = new SheetsJobDescriptionExportAgent(agent, memory, 95, 100, "Sheet1");
await exportAgent.processJsonData({
  agentId: agent.id,
  jobDescriptions: memory.jobDescriptions,
});
```

The method will upload rows in chunks to avoid exceeding API limits. Adjust the
sheet name in the constructor if your spreadsheet uses a different tab.

## Constructor parameters

- `agent` – Existing `PsAgent` used for logging and configuration.
- `memory` – Object containing the job descriptions to export.
- `startProgress`/`endProgress` – Percent range shown while exporting.
- `sheetName` – Target tab name. Defaults to **Job Descriptions Analysis**.
- `chunkSize` – Number of rows written per API call (default **500**).

## Example header rows

When exported, the first two rows provide the full object path and a shorter
column name. The beginning of the sheet looks like:

```
agentId,titleCode,variant,classOfService,workWeek,bargainUnit,...
agentId,titleCode,variant,classOfService,workWeek,bargainUnit,...
...
degreeAnalysis.needsCollegeDegree,needsCollegeDegree,
```

## Troubleshooting

- **API rate limits** – Reduce `chunkSize` or wait if you encounter HTTP 429
  errors from Google Sheets.
- **Incorrect sheet name** – Ensure the `sheetName` parameter matches the tab
  in your spreadsheet.
- **Missing connector** – Verify a Google Sheets connector is registered before
  running the export agent.
