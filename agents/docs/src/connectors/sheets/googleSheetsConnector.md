# PsGoogleSheetsConnector

The `PsGoogleSheetsConnector` class is a connector for Google Sheets, allowing interaction with Google Sheets through the Google Sheets API. It extends the `PsBaseSheetConnector` class and provides methods to read and update data in Google Sheets.

## Properties

| Name          | Type                | Description                                      |
|---------------|---------------------|--------------------------------------------------|
| client        | JWT                 | JWT client for Google Sheets API authentication. |
| sheets        | sheets_v4.Sheets    | Google Sheets API instance.                      |

## Static Properties

| Name                                | Type                                      | Description                                      |
|-------------------------------------|-------------------------------------------|--------------------------------------------------|
| GOOGLE_SHEETS_CONNECTOR_CLASS_BASE_ID | string                                    | Base ID for the Google Sheets connector class.   |
| GOOGLE_SHEETS_CONNECTOR_VERSION     | number                                    | Version of the Google Sheets connector.          |
| getConnectorClass                   | PsAgentConnectorClassCreationAttributes   | Configuration for the Google Sheets connector class. |

## Constructor

### PsGoogleSheetsConnector

Creates an instance of `PsGoogleSheetsConnector`.

#### Parameters

| Name            | Type                              | Description                                                                 |
|-----------------|-----------------------------------|-----------------------------------------------------------------------------|
| connector       | PsAgentConnectorAttributes        | Connector attributes.                                                       |
| connectorClass  | PsAgentConnectorClassAttributes   | Connector class attributes.                                                 |
| agent           | PsAgent                           | Agent instance.                                                             |
| memory          | PsAgentMemoryData \| undefined    | Optional memory data.                                                       |
| startProgress   | number                            | Optional start progress value (default is 0).                               |
| endProgress     | number                            | Optional end progress value (default is 100).                               |

## Methods

### getSheet

Fetches all data from the first sheet of the Google Spreadsheet.

#### Returns

| Type          | Description                                      |
|---------------|--------------------------------------------------|
| Promise<string[][]> | A promise that resolves to a 2D array of strings representing the sheet data. |

### updateSheet

Updates the entire sheet with the provided data.

#### Parameters

| Name | Type          | Description                                      |
|------|---------------|--------------------------------------------------|
| data | string[][]    | 2D array of strings representing the data to update. |

#### Returns

| Type          | Description                                      |
|---------------|--------------------------------------------------|
| Promise<void> | A promise that resolves when the update is complete. |

### getRange

Fetches data from a specific range in the Google Spreadsheet.

#### Parameters

| Name  | Type   | Description                                      |
|-------|--------|--------------------------------------------------|
| range | string | The range to fetch data from (e.g., 'A1:B10').   |

#### Returns

| Type          | Description                                      |
|---------------|--------------------------------------------------|
| Promise<string[][]> | A promise that resolves to a 2D array of strings representing the range data. |

### updateRange

Updates a specific range in the Google Spreadsheet with the provided data.

#### Parameters

| Name | Type          | Description                                      |
|------|---------------|--------------------------------------------------|
| range | string       | The range to update (e.g., 'A1:B10').            |
| data  | string[][]   | 2D array of strings representing the data to update. |

#### Returns

| Type          | Description                                      |
|---------------|--------------------------------------------------|
| Promise<void> | A promise that resolves when the update is complete. |

### getExtraConfigurationQuestions

Returns additional configuration questions for the Google Sheets connector.

#### Returns

| Type          | Description                                      |
|---------------|--------------------------------------------------|
| YpStructuredQuestionData[] | An array of structured question data for extra configuration. |

## Example

```typescript
import { PsGoogleSheetsConnector } from '@policysynth/agents/connectors/sheets/googleSheetsConnector.js';

// Example usage of PsGoogleSheetsConnector
const connectorAttributes = { /* ... */ };
const connectorClassAttributes = { /* ... */ };
const agent = { /* ... */ };
const memory = undefined;

const googleSheetsConnector = new PsGoogleSheetsConnector(
  connectorAttributes,
  connectorClassAttributes,
  agent,
  memory
);

googleSheetsConnector.getSheet().then(data => {
  console.log(data);
}).catch(error => {
  console.error(error);
});
```

This documentation provides a detailed overview of the `PsGoogleSheetsConnector` class, including its properties, methods, and an example of how to use it.