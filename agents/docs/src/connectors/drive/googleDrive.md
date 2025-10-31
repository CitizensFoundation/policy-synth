# PsGoogleDriveConnector

A connector class for integrating with Google Drive using a Google Service Account. This class enables listing, retrieving, creating, updating, and deleting files in Google Drive, and is designed to be used as a PolicySynth Agent Connector.

**File:** `@policysynth/agents/connectors/drive/googleDrive.js`

## Properties

| Name        | Type                                   | Description                                                                                 |
|-------------|----------------------------------------|---------------------------------------------------------------------------------------------|
| client      | JWT                                    | Authenticated Google JWT client for API requests.                                           |
| drive       | drive_v3.Drive                         | Google Drive API client instance.                                                           |

## Static Properties

| Name                                              | Type      | Description                                                                                 |
|---------------------------------------------------|-----------|---------------------------------------------------------------------------------------------|
| GOOGLE_DRIVE_CONNECTOR_CLASS_BASE_ID              | string    | Unique base ID for the connector class.                                                     |
| GOOGLE_DRIVE_CONNECTOR_VERSION                    | number    | Version number of the connector class.                                                      |
| getConnectorClass                                 | PsAgentConnectorClassCreationAttributes | Connector class configuration for registration and UI.                                      |

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

- **Description:** Initializes the connector, authenticates with Google Drive using a Service Account, and sets up the Drive API client.
- **Throws:** Error if credentials are missing or invalid.

## Static Methods

| Name                           | Parameters | Return Type                  | Description                                                                                 |
|--------------------------------|------------|------------------------------|---------------------------------------------------------------------------------------------|
| getExtraConfigurationQuestions | none       | YpStructuredQuestionData[]   | Returns extra configuration questions required for this connector (ServiceAccount JSON).     |

## Instance Methods

| Name   | Parameters                                                                 | Return Type | Description                                                                                 |
|--------|----------------------------------------------------------------------------|-------------|---------------------------------------------------------------------------------------------|
| list   | none                                                                       | Promise<any[]> | Lists the first 10 files in Google Drive.                                                   |
| get    | fileId: string                                                             | Promise<any> | Retrieves metadata for a file by its ID.                                                    |
| post   | data: any                                                                  | Promise<any> | Creates (uploads) a new file to Google Drive (metadata only in this example).               |
| put    | fileId: string, data: any                                                  | Promise<any> | Updates metadata for an existing file.                                                      |
| delete | fileId: string                                                             | Promise<void> | Deletes a file from Google Drive.                                                           |

## Example

```typescript
import { PsGoogleDriveConnector } from '@policysynth/agents/connectors/drive/googleDrive.js';

// Example instantiation (assuming you have the required objects)
const connector = /* PsAgentConnectorAttributes */;
const connectorClass = /* PsAgentConnectorClassAttributes */;
const agent = /* PsAgent */;
const memory = /* PsAgentMemoryData | undefined */;

const driveConnector = new PsGoogleDriveConnector(connector, connectorClass, agent, memory);

// List files
const files = await driveConnector.list();
console.log(files);

// Get file metadata
const fileMeta = await driveConnector.get('your-file-id');
console.log(fileMeta);

// Create a new file
const newFile = await driveConnector.post({ name: 'MyFile.txt' });
console.log(newFile);

// Update a file
const updatedFile = await driveConnector.put('your-file-id', { name: 'UpdatedName.txt' });
console.log(updatedFile);

// Delete a file
await driveConnector.delete('your-file-id');
console.log('File deleted');
```

## Configuration Questions

When registering this connector, the following configuration questions are required:

- **Name** (`textField`, required)
- **Description** (`textArea`, optional)
- **ServiceAccount JSON** (`textArea`, required, 10 rows)

## Notes

- The connector expects a valid Google Service Account JSON for authentication.
- The `post` and `put` methods in this example only handle metadata; for file content uploads, additional logic is required.
- All methods log errors using the inherited logger and rethrow them.
- This connector is designed to be used within the PolicySynth agent framework and expects specific types for its constructor arguments.