# PsGoogleDocsConnector

The `PsGoogleDocsConnector` class is a connector for Google Docs, allowing interaction with Google Docs documents through the Google Docs API. It extends the `PsBaseDocumentConnector` class and provides methods to get and update Google Docs documents.

## Properties

| Name        | Type                | Description                                                                 |
|-------------|---------------------|-----------------------------------------------------------------------------|
| client      | JWT                 | The JWT client used for authentication with Google APIs.                    |
| docs        | docs_v1.Docs        | The Google Docs API instance.                                               |

## Static Properties

| Name                                | Type                              | Description                                                                 |
|-------------------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID | string                            | The base ID for the Google Docs connector class.                            |
| GOOGLE_DOCS_CONNECTOR_VERSION       | number                            | The version of the Google Docs connector class.                             |
| getConnectorClass                   | PsConnectorClassCreationAttributes | The configuration for the Google Docs connector class.                      |

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

### Parameters

- `connector`: `PsAgentConnectorAttributes` - The attributes of the agent connector.
- `connectorClass`: `PsAgentConnectorClassAttributes` - The attributes of the agent connector class.
- `agent`: `PsAgent` - The agent instance.
- `memory`: `PsAgentMemoryData | undefined` - The memory data for the agent (optional).
- `startProgress`: `number` - The starting progress value (default is 0).
- `endProgress`: `number` - The ending progress value (default is 100).

## Methods

### getDocument

```typescript
async getDocument(): Promise<string>
```

Fetches the content of the Google Docs document specified in the configuration.

### Returns

- `Promise<string>` - The content of the Google Docs document as a string.

### updateDocument

```typescript
async updateDocument(doc: string): Promise<void>
```

Updates the content of the Google Docs document specified in the configuration.

### Parameters

- `doc`: `string` - The new content to be updated in the Google Docs document.

### Returns

- `Promise<void>`

### getData

```typescript
private async getData(documentId: string): Promise<docs_v1.Schema$Document>
```

Fetches the data of the Google Docs document by its ID.

### Parameters

- `documentId`: `string` - The ID of the Google Docs document.

### Returns

- `Promise<docs_v1.Schema$Document>` - The data of the Google Docs document.

### extractText

```typescript
private extractText(content: docs_v1.Schema$StructuralElement[]): string
```

Extracts text content from the structural elements of a Google Docs document.

### Parameters

- `content`: `docs_v1.Schema$StructuralElement[]` - The structural elements of the Google Docs document.

### Returns

- `string` - The extracted text content.

### getExtraConfigurationQuestions

```typescript
static getExtraConfigurationQuestions(): YpStructuredQuestionData[]
```

Provides additional configuration questions for the Google Docs connector.

### Returns

- `YpStructuredQuestionData[]` - An array of structured question data for additional configuration.

## Example

```typescript
import { PsGoogleDocsConnector } from '@policysynth/agents/connectors/documents/googleDocsConnector.js';

const connectorAttributes = {
  // ...connector attributes
};

const connectorClassAttributes = {
  // ...connector class attributes
};

const agent = {
  // ...agent instance
};

const memory = {
  // ...memory data
};

const googleDocsConnector = new PsGoogleDocsConnector(
  connectorAttributes,
  connectorClassAttributes,
  agent,
  memory
);

googleDocsConnector.getDocument().then((content) => {
  console.log("Document Content:", content);
});

googleDocsConnector.updateDocument("New content for the document").then(() => {
  console.log("Document updated successfully.");
});
```

This example demonstrates how to create an instance of `PsGoogleDocsConnector`, fetch the content of a Google Docs document, and update the document with new content.