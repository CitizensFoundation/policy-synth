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
