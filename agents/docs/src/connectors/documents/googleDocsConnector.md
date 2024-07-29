# PsGoogleDocsConnector

The `PsGoogleDocsConnector` class is a connector for Google Docs, allowing interaction with Google Docs through the Google Docs API. It extends the `PsBaseDocumentConnector` class and provides methods to get and update documents.

## Properties

| Name          | Type                | Description                                      |
|---------------|---------------------|--------------------------------------------------|
| client        | JWT                 | JWT client for authentication with Google APIs.  |
| docs          | docs_v1.Docs        | Google Docs API instance.                        |

## Static Properties

| Name                                | Type                                      | Description                                      |
|-------------------------------------|-------------------------------------------|--------------------------------------------------|
| GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID | string                                    | Base ID for the Google Docs connector class.     |
| GOOGLE_DOCS_CONNECTOR_VERSION       | number                                    | Version of the Google Docs connector class.      |
| getConnectorClass                   | PsAgentConnectorClassCreationAttributes   | Configuration for the Google Docs connector class.|

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

| Name           | Type                                | Description                                                                 |
|----------------|-------------------------------------|-----------------------------------------------------------------------------|
| connector      | PsAgentConnectorAttributes          | Attributes of the agent connector.                                          |
| connectorClass | PsAgentConnectorClassAttributes     | Attributes of the agent connector class.                                    |
| agent          | PsAgent                             | The agent associated with this connector.                                   |
| memory         | PsAgentMemoryData \| undefined      | Memory data for the agent.                                                  |
| startProgress  | number                              | Initial progress value. Default is 0.                                       |
| endProgress    | number                              | Final progress value. Default is 100.                                       |

## Methods

### getDocument

```typescript
async getDocument(): Promise<string>
```

Fetches the content of the Google Doc specified by the `googleDocsId` configuration.

### updateDocument

```typescript
async updateDocument(doc: string): Promise<void>
```

Updates the content of the Google Doc specified by the `googleDocsId` configuration.

### getData

```typescript
async getData(documentId: string): Promise<docs_v1.Schema$Document>
```

Fetches the data of the Google Doc specified by the `documentId`.

### extractText

```typescript
extractText(content: docs_v1.Schema$StructuralElement[]): string
```

Extracts text from the structural elements of a Google Doc.

### getExtraConfigurationQuestions

```typescript
static getExtraConfigurationQuestions(): YpStructuredQuestionData[]
```

Returns additional configuration questions required for the Google Docs connector.

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
  // ...agent attributes
};

const googleDocsConnector = new PsGoogleDocsConnector(
  connectorAttributes,
  connectorClassAttributes,
  agent
);

googleDocsConnector.getDocument().then((docContent) => {
  console.log("Document Content:", docContent);
});

googleDocsConnector.updateDocument("New content for the document").then(() => {
  console.log("Document updated successfully.");
});
```

This documentation provides an overview of the `PsGoogleDocsConnector` class, its properties, methods, and an example of how to use it.