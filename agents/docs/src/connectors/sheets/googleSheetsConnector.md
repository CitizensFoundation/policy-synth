# PsGoogleSheetsConnector

The `PsGoogleSheetsConnector` class is a connector for Google Sheets, extending the `PsBaseSheetConnector`. It allows interaction with Google Sheets, including reading and updating sheet data.

## Properties

| Name        | Type                | Description                                      |
|-------------|---------------------|--------------------------------------------------|
| client      | JWT                 | JWT client for Google Sheets API authentication. |
| sheets      | sheets_v4.Sheets    | Google Sheets API instance.                      |

## Static Properties

| Name                                    | Type                              | Description                                                                 |
|-----------------------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| GOOGLE_SHEETS_CONNECTOR_CLASS_BASE_ID   | string                            | Base ID for the Google Sheets connector class.                              |
| GOOGLE_SHEETS_CONNECTOR_VERSION         | number                            | Version number for the Google Sheets connector class.                       |
| getConnectorClass                       | PsConnectorClassCreationAttributes| Configuration for the Google Sheets connector class.                        |

## Constructor

### PsGoogleSheetsConnector

Creates an instance of `PsGoogleSheetsConnector`.

#### Parameters

| Name            | Type                                | Description                                                                 |
|-----------------|-------------------------------------|-----------------------------------------------------------------------------|
| connector       | PsAgentConnectorAttributes          | Connector attributes.                                                       |
| connectorClass  | PsAgentConnectorClassAttributes     | Connector class attributes.                                                 |
| agent           | PsAgent                             | Agent instance.                                                             |
| memory          | PsAgentMemoryData \| undefined      | Optional memory data.                                                       |
| startProgress   | number                              | Optional start progress value (default is 0).                               |
| endProgress     | number                              | Optional end progress value (default is 100).                               |

## Methods

### getSheet

Fetches all data from the first sheet of the Google Spreadsheet.

#### Returns

| Type          | Description                        |
|---------------|------------------------------------|
| Promise<string[][]> | 2D array of sheet data.      |

### updateSheet

Updates the entire sheet with the provided data.

#### Parameters

| Name | Type          | Description                        |
|------|---------------|------------------------------------|
| data | string[][]    | 2D array of data to update the sheet with. |

#### Returns

| Type          | Description                        |
|---------------|------------------------------------|
| Promise<void> | Resolves when the update is complete. |

### getRange

Fetches data from a specified range in the Google Spreadsheet.

#### Parameters

| Name  | Type   | Description                        |
|-------|--------|------------------------------------|
| range | string | The range to fetch data from.      |

#### Returns

| Type          | Description                        |
|---------------|------------------------------------|
| Promise<string[][]> | 2D array of data from the specified range. |

### updateRange

Updates a specified range in the Google Spreadsheet with the provided data.

#### Parameters

| Name  | Type       | Description                        |
|-------|------------|------------------------------------|
| range | string     | The range to update.               |
| data  | string[][] | 2D array of data to update the range with. |

#### Returns

| Type          | Description                        |
|---------------|------------------------------------|
| Promise<void> | Resolves when the update is complete. |

### getExtraConfigurationQuestions

Returns additional configuration questions for the Google Sheets connector.

#### Returns

| Type                        | Description                        |
|-----------------------------|------------------------------------|
| YpStructuredQuestionData[]  | Array of structured question data. |

## Example

```typescript
import { PsGoogleSheetsConnector } from '@policysynth/agents/connectors/sheets/googleSheetsConnector.js';

const connector = new PsGoogleSheetsConnector(connectorAttributes, connectorClassAttributes, agent, memory);

async function exampleUsage() {
  try {
    const sheetData = await connector.getSheet();
    console.log(sheetData);

    const rangeData = await connector.getRange('A1:B2');
    console.log(rangeData);

    await connector.updateSheet([['A1', 'B1'], ['A2', 'B2']]);
    await connector.updateRange('A1:B2', [['A1', 'B1'], ['A2', 'B2']]);
  } catch (error) {
    console.error('Error:', error);
  }
}

exampleUsage();
```