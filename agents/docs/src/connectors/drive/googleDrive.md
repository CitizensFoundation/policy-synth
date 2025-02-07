# PsGoogleDriveConnector

The `PsGoogleDriveConnector` class is a connector for interacting with Google Drive. It extends the `PsBaseDriveConnector` and provides methods to list, get, create, update, and delete files in Google Drive using the Google Drive API.

## Properties

| Name     | Type                | Description                                      |
|----------|---------------------|--------------------------------------------------|
| client   | JWT                 | The JWT client used for authentication.          |
| drive    | drive_v3.Drive      | The Google Drive API client.                     |

## Static Properties

| Name                                      | Type   | Description                                                                 |
|-------------------------------------------|--------|-----------------------------------------------------------------------------|
| GOOGLE_DRIVE_CONNECTOR_CLASS_BASE_ID      | string | The unique base ID for the Google Drive connector class.                    |
| GOOGLE_DRIVE_CONNECTOR_VERSION            | number | The version of the Google Drive connector.                                  |
| getConnectorClass                         | object | Configuration for the connector class, including questions for setup.       |

## Constructor

The constructor initializes the Google Drive connector with the necessary credentials and sets up the Google Drive API client.

### Parameters

- `connector`: `PsAgentConnectorAttributes` - The connector attributes.
- `connectorClass`: `PsAgentConnectorClassAttributes` - The connector class attributes.
- `agent`: `PsAgent` - The agent associated with the connector.
- `memory`: `PsAgentMemoryData | undefined` - Optional memory data for the agent.
- `startProgress`: `number` - The starting progress percentage (default is 0).
- `endProgress`: `number` - The ending progress percentage (default is 100).

## Methods

| Name                               | Parameters                                                                 | Return Type | Description                                                                 |
|------------------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| `getExtraConfigurationQuestions`   | -                                                                          | `YpStructuredQuestionData[]` | Returns extra configuration questions for the connector.                    |
| `list`                             | -                                                                          | `Promise<any[]>` | Lists files in Google Drive, retrieving the first 10 files.                 |
| `get`                              | `fileId: string`                                                           | `Promise<any>` | Gets a file's metadata from Google Drive by fileId.                         |
| `post`                             | `data: any`                                                                | `Promise<any>` | Creates (uploads) a new file to Google Drive.                               |
| `put`                              | `fileId: string, data: any`                                                | `Promise<any>` | Updates an existing file on Google Drive.                                   |
| `delete`                           | `fileId: string`                                                           | `Promise<void>` | Deletes a file from Google Drive.                                           |

## Example

```typescript
import { PsGoogleDriveConnector } from '@policysynth/agents/connectors/drive/googleDrive.js';

// Example usage of PsGoogleDriveConnector
const connector = new PsGoogleDriveConnector(connectorAttributes, connectorClassAttributes, agent);
await connector.list();
await connector.get('fileId');
await connector.post({ name: 'NewFile' });
await connector.put('fileId', { name: 'UpdatedFile' });
await connector.delete('fileId');
```

This class provides a structured way to interact with Google Drive, handling authentication and API requests to manage files within a Google Drive account.