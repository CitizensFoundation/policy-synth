# PsGoogleSheetsConnector

The `PsGoogleSheetsConnector` class is a connector for interacting with Google Sheets. It extends the `PsBaseSheetConnector` and provides methods to perform various operations on Google Sheets such as reading, updating, and formatting cells.

## Properties

| Name    | Type               | Description                                      |
|---------|--------------------|--------------------------------------------------|
| client  | JWT                | JWT client for authentication with Google APIs.  |
| sheets  | sheets_v4.Sheets   | Instance of Google Sheets API.                   |

## Static Properties

| Name                                      | Type                                      | Description                                                                 |
|-------------------------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| GOOGLE_SHEETS_CONNECTOR_CLASS_BASE_ID     | string                                    | Base ID for the Google Sheets connector class.                              |
| GOOGLE_SHEETS_CONNECTOR_VERSION           | number                                    | Version number of the Google Sheets connector.                              |
| getConnectorClass                         | PsAgentConnectorClassCreationAttributes   | Configuration attributes for the connector class.                           |

## Constructor

### PsGoogleSheetsConnector

Creates an instance of `PsGoogleSheetsConnector`.

#### Parameters

- `connector`: `PsAgentConnectorAttributes` - Attributes of the connector.
- `connectorClass`: `PsAgentConnectorClassAttributes` - Attributes of the connector class.
- `agent`: `PsAgent` - The agent associated with the connector.
- `memory`: `PsAgentMemoryData | undefined` - Optional memory data for the agent.
- `startProgress`: `number` - Starting progress percentage (default is 0).
- `endProgress`: `number` - Ending progress percentage (default is 100).

## Methods

| Name                     | Parameters                                                                 | Return Type       | Description                                                                 |
|--------------------------|----------------------------------------------------------------------------|-------------------|-----------------------------------------------------------------------------|
| `getSheet`               | -                                                                          | `Promise<string[][]>` | Retrieves all cells from the first sheet of the spreadsheet.                |
| `addSheetIfNotExists`    | `sheetName: string`                                                        | `Promise<void>`   | Adds a new sheet with the specified name if it does not already exist.      |
| `createNewSheet`         | `sheetName: string`                                                        | `Promise<void>`   | Creates a new sheet with the specified name.                                |
| `formatCells`            | `range: string, format: sheets_v4.Schema$CellFormat`                       | `Promise<void>`   | Formats cells in the specified range with the given format.                 |
| `updateSheet`            | `data: string[][]`                                                         | `Promise<void>`   | Updates the entire sheet starting from cell A1 with the provided data.      |
| `getRange`               | `range: string`                                                            | `Promise<string[][]>` | Retrieves data from the specified range of the spreadsheet.                 |
| `updateRange`            | `range: string, data: string[][]`                                          | `Promise<void>`   | Updates the specified range of the spreadsheet with the provided data.      |
| `getExtraConfigurationQuestions` | -                                                                  | `YpStructuredQuestionData[]` | Returns additional configuration questions for the connector.               |

## Example

```typescript
import { PsGoogleSheetsConnector } from '@policysynth/agents/connectors/sheets/googleSheetsConnector.js';

// Example usage of PsGoogleSheetsConnector
const connector = new PsGoogleSheetsConnector(connectorAttributes, connectorClassAttributes, agent, memory);
await connector.getSheet();
await connector.addSheetIfNotExists("NewSheet");
await connector.createNewSheet("AnotherSheet");
await connector.formatCells("A1:Z1", { textFormat: { bold: true } });
await connector.updateSheet([["Header1", "Header2"], ["Value1", "Value2"]]);
const rangeData = await connector.getRange("A1:B2");
await connector.updateRange("A1:B2", [["Updated1", "Updated2"]]);
```