# PsGoogleSheetsConnector

A connector class for integrating with Google Sheets as part of the PolicySynth agent framework. This class enables agents to read, write, and manage Google Sheets using a Google Service Account. It extends `PsBaseSheetConnector` and provides methods for common spreadsheet operations such as reading data, updating ranges, formatting cells, and managing sheets.

**File:** `@policysynth/agents/connectors/sheets/googleSheetsConnector.js`

---

## Properties

| Name         | Type                        | Description                                                                                 |
|--------------|-----------------------------|---------------------------------------------------------------------------------------------|
| client       | `JWT`                       | Authenticated Google JWT client for API access.                                             |
| sheets       | `sheets_v4.Sheets`          | Google Sheets API client instance.                                                          |

---

## Static Properties

| Name                                         | Type                                   | Description                                                                                 |
|-----------------------------------------------|----------------------------------------|---------------------------------------------------------------------------------------------|
| GOOGLE_SHEETS_CONNECTOR_CLASS_BASE_ID         | `string`                               | Unique base ID for the Google Sheets connector class.                                       |
| GOOGLE_SHEETS_CONNECTOR_VERSION               | `number`                               | Version number of the connector class.                                                      |
| getConnectorClass                            | `PsAgentConnectorClassCreationAttributes` | Connector class definition, including configuration and structured questions.               |

---

## Constructor

```typescript
constructor(
  connector: PsAgentConnectorAttributes,
  connectorClass: PsAgentConnectorClassAttributes,
  agent: PsAgent,
  memory?: PsAgentMemoryData,
  startProgress?: number,
  endProgress?: number
)
```

- **Description:**  
  Initializes the connector, authenticates with Google using the provided Service Account credentials, and sets up the Sheets API client.

- **Parameters:**
  - `connector`: Connector instance attributes.
  - `connectorClass`: Connector class attributes.
  - `agent`: The agent instance using this connector.
  - `memory`: (Optional) Agent memory data.
  - `startProgress`: (Optional) Progress start value.
  - `endProgress`: (Optional) Progress end value.

- **Throws:**  
  Errors if credentials are missing or invalid.

---

## Methods

| Name                       | Parameters                                                                 | Return Type         | Description                                                                                 |
|----------------------------|----------------------------------------------------------------------------|---------------------|---------------------------------------------------------------------------------------------|
| getSheet                   | none                                                                       | `Promise<string[][]>` | Retrieves all values from the first sheet (range `A1:ZZ`).                                  |
| addSheetIfNotExists        | `sheetName: string`                                                        | `Promise<void>`     | Adds a new sheet with the given name if it does not already exist.                          |
| createNewSheet             | `sheetName: string`                                                        | `Promise<void>`     | Creates a new sheet with the specified name.                                                |
| formatCells                | `range: string, format: sheets_v4.Schema$CellFormat`                       | `Promise<void>`     | Applies formatting to a specified cell range.                                               |
| updateSheet                | `data: string[][]`                                                         | `Promise<void>`     | Updates the entire sheet starting from cell `A1` with the provided data.                    |
| getRange                   | `range: string`                                                            | `Promise<string[][]>` | Retrieves values from a specified range.                                                    |
| updateRange                | `range: string, data: string[][]`                                          | `Promise<void>`     | Updates a specified range with the provided data.                                           |
| clearRange                 | `range: string`                                                            | `Promise<void>`     | Clears all values in the specified range.                                                   |
| static getExtraConfigurationQuestions | none                                                           | `YpStructuredQuestionData[]` | Returns extra configuration questions required for this connector.                          |

---

## Example

```typescript
import { PsGoogleSheetsConnector } from '@policysynth/agents/connectors/sheets/googleSheetsConnector.js';

// Example instantiation (assuming you have the required objects)
const connector = /* PsAgentConnectorAttributes */;
const connectorClass = /* PsAgentConnectorClassAttributes */;
const agent = /* PsAgent */;
const memory = undefined;

const sheetsConnector = new PsGoogleSheetsConnector(connector, connectorClass, agent, memory);

// Read all data from the first sheet
const data = await sheetsConnector.getSheet();

// Add a new sheet if it doesn't exist
await sheetsConnector.addSheetIfNotExists('Summary');

// Update a range with new data
await sheetsConnector.updateRange('B2:D5', [
  ['Name', 'Score', 'Status'],
  ['Alice', '95', 'Pass'],
  ['Bob', '88', 'Pass'],
]);

// Format the header row
await sheetsConnector.formatCells('A1:E1', {
  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
  textFormat: { bold: true }
});

// Clear a range
await sheetsConnector.clearRange('A2:E100');
```

---

## Structured Configuration Questions

The connector requires the following configuration fields (used for setup in the UI or API):

- **Name** (`name`): Text field, required.
- **Description** (`description`): Text area, optional.
- **Spreadsheet ID** (`googleSheetsId`): Text field, required.
- **ServiceAccount JSON** (`credentialsJson`): Text area, required.

---

## Notes

- The connector expects a valid Google Service Account JSON for authentication.
- All methods throw errors if the spreadsheet ID is missing or if Google API calls fail.
- The class is designed to be used as part of the PolicySynth agent/connector framework and is not a standalone Google Sheets client.

---