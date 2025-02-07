# PsGoogleDocsConnector

The `PsGoogleDocsConnector` class is a connector for Google Docs, allowing interaction with Google Docs documents through the Google Docs API. It extends the `PsBaseDocumentConnector` class and provides methods to retrieve, update, and manipulate Google Docs documents.

## Properties

| Name                          | Type                              | Description                                                                 |
|-------------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID | string                            | A static constant representing the base ID for the Google Docs connector class. |
| GOOGLE_DOCS_CONNECTOR_VERSION | number                            | A static constant representing the version of the Google Docs connector.    |
| getConnectorClass             | PsAgentConnectorClassCreationAttributes | Static property defining the connector class attributes for Google Docs.    |
| client                        | JWT                               | An instance of the JWT client for authentication with Google APIs.          |
| docs                          | docs_v1.Docs                      | An instance of the Google Docs API client.                                  |

## Methods

| Name                          | Parameters                                                                 | Return Type                          | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|--------------------------------------|-----------------------------------------------------------------------------|
| constructor                   | connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory?: PsAgentMemoryData, startProgress?: number, endProgress?: number | void                                 | Initializes a new instance of the `PsGoogleDocsConnector` class.            |
| getDocument                   | -                                                                          | Promise<string>                      | Retrieves the content of a Google Docs document as a string.                |
| updateDocument                | doc: string                                                                | Promise<void>                        | Updates the content of a Google Docs document with the provided string.     |
| getData                       | documentId: string                                                         | Promise<docs_v1.Schema$Document>     | Retrieves the data of a Google Docs document by its ID.                     |
| markdownToGoogleDocs          | markdown: string                                                           | { requests: docs_v1.Schema$Request[] } | Converts Markdown content to Google Docs API requests.                      |
| updateDocumentFromMarkdown    | markdown: string                                                           | Promise<void>                        | Updates a Google Docs document with content converted from Markdown.        |
| extractText                   | content: docs_v1.Schema$StructuralElement[]                                | string                               | Extracts text content from Google Docs structural elements.                 |
| getExtraConfigurationQuestions| -                                                                          | YpStructuredQuestionData[]           | Returns additional configuration questions for the connector.               |

## Example

```typescript
import { PsGoogleDocsConnector } from '@policysynth/agents/connectors/documents/googleDocsConnector.js';

// Example usage of PsGoogleDocsConnector
const connectorAttributes = { /* ... */ };
const connectorClassAttributes = { /* ... */ };
const agent = { /* ... */ };

const googleDocsConnector = new PsGoogleDocsConnector(connectorAttributes, connectorClassAttributes, agent);

async function updateGoogleDoc() {
  try {
    const documentContent = await googleDocsConnector.getDocument();
    console.log("Document Content:", documentContent);

    const newContent = "Updated content for the document.";
    await googleDocsConnector.updateDocument(newContent);
    console.log("Document updated successfully.");
  } catch (error) {
    console.error("Error:", error);
  }
}

updateGoogleDoc();
```

This class provides a robust interface for interacting with Google Docs, including methods for retrieving and updating document content, as well as converting Markdown to Google Docs format. It handles authentication using a Google Service Account and manages API requests to Google Docs.