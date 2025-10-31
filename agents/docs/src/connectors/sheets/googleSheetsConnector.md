# PsGoogleSheetsConnector

A connector class for integrating with Google Sheets as part of the PolicySynth agent framework. This class enables agents to read, write, and manage Google Sheets using a Google Service Account. It extends `PsBaseSheetConnector` and provides methods for common spreadsheet operations such as reading data, updating ranges, formatting cells, and managing sheets.

**File:** `@policysynth/agents/connectors/sheets/googleSheetsConnector.js`

---

## Properties

| Name         | Type                | Description                                                                                 |
|--------------|---------------------|---------------------------------------------------------------------------------------------|
| client       | `JWT`               | Authenticated Google JWT client for API requests.                                            |
| sheets       | `sheets_v4.Sheets`  | Google Sheets API client instance.                                                           |

---

## Static Properties

| Name                                         | Type      | Description                                                                                 |
|-----------------------------------------------|-----------|---------------------------------------------------------------------------------------------|
| GOOGLE_SHEETS_CONNECTOR_CLASS_BASE_ID         | `string`  | Unique base ID for the Google Sheets connector class.                                        |
| GOOGLE_SHEETS_CONNECTOR_VERSION               | `number`  | Version number of the connector class.                                                      |
| getConnectorClass                            | `PsAgentConnectorClassCreationAttributes` | Connector class definition and configuration for registration.                              |

---

## Constructor

```typescript
constructor(
  connector: PsAgentConnectorAttributes,
  connectorClass: PsAgentConnectorClassAttributes,
  agent: PsAgent,
  memory: PsAgentMemoryData | undefined = undefined,
  startProgress: number = 0,
  endProgress: number = 100
)
```

- **Description:** Initializes the connector, authenticates with Google using the provided Service Account credentials, and sets up the Sheets API client.
- **Throws:** Error if credentials are missing or invalid.

---

## Methods

| Name                       | Parameters                                                                 | Return Type         | Description                                                                                      |
|----------------------------|----------------------------------------------------------------------------|---------------------|--------------------------------------------------------------------------------------------------|
| `getSheet`                 | none                                                                       | `Promise<string[][]>` | Retrieves all cell values from the first sheet (range `A1:ZZ`).                                  |
| `addSheetIfNotExists`      | `sheetName: string`                                                        | `Promise<void>`     | Adds a new sheet with the given name if it does not already exist.                               |
| `createNewSheet`           | `sheetName: string`                                                        | `Promise<void>`     | Creates a new sheet with the specified name.                                                     |
| `formatCells`              | `range: string, format: sheets_v4.Schema$CellFormat`                       | `Promise<void>`     | Applies formatting to a specified cell range (assumes first sheet, can be adjusted as needed).   |
| `updateSheet`              | `data: string[][]`                                                         | `Promise<void>`     | Updates the entire sheet starting from cell `A1` with the provided data.                         |
| `getRange`                 | `range: string`                                                            | `Promise<string[][]>` | Retrieves values from a specified range in the sheet.                                            |
| `updateRange`              | `range: string, data: string[][]`                                          | `Promise<void>`     | Updates a specified range in the sheet with the provided data.                                   |
| `clearRange`               | `range: string`                                                            | `Promise<void>`     | Clears all values in the specified range.                                                        |
| `getExtraConfigurationQuestions` (static) | none                                                        | `YpStructuredQuestionData[]` | Returns extra configuration questions required for this connector (Spreadsheet ID, credentials).  |

---

## Example

```typescript
import { PsGoogleSheetsConnector } from '@policysynth/agents/connectors/sheets/googleSheetsConnector.js';

// Example instantiation (assuming you have the required objects)
const connector = /* PsAgentConnectorAttributes */;
const connectorClass = /* PsAgentConnectorClassAttributes */;
const agent = /* PsAgent */;
const memory = undefined;

const sheetsConnector = new PsGoogleSheetsConnector(
  connector,
  connectorClass,
  agent,
  memory
);

// Read all data from the first sheet
const data = await sheetsConnector.getSheet();

// Add a new sheet if it doesn't exist
await sheetsConnector.addSheetIfNotExists('Summary');

// Update a specific range
await sheetsConnector.updateRange('B2:D5', [
  ['Header1', 'Header2', 'Header3'],
  ['Value1', 'Value2', 'Value3'],
]);

// Format the first row
await sheetsConnector.formatCells('A1:E1', {
  backgroundColor: { red: 1, green: 0.9, blue: 0.6 },
  textFormat: { bold: true }
});

// Clear a range
await sheetsConnector.clearRange('A2:Z100');
```

---

## Configuration Questions

When configuring this connector, the following fields are required:

- **Name** (`textField`, required)
- **Description** (`textArea`, optional)
- **Spreadsheet ID** (`textField`, required)
- **ServiceAccount JSON** (`textArea`, required)

---

## Notes

- The connector expects a valid Google Service Account JSON for authentication.
- All methods will throw errors if the required configuration (such as Spreadsheet ID) is missing.
- The class is designed to be used as part of the PolicySynth agent/connector framework and may rely on base class methods and logging.

---