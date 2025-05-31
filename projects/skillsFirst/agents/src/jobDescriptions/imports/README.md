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
