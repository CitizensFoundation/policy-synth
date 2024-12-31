# PsGoogleDocsConnector

The `PsGoogleDocsConnector` class is a connector for Google Docs, allowing interaction with Google Docs documents through the Google Docs API. It extends the `PsBaseDocumentConnector` class and provides methods to retrieve and update Google Docs documents.

## Properties

| Name                          | Type                        | Description                                                                 |
|-------------------------------|-----------------------------|-----------------------------------------------------------------------------|
| GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID | string                      | Static constant representing the base ID for the Google Docs connector class. |
| GOOGLE_DOCS_CONNECTOR_VERSION | number                      | Static constant representing the version of the Google Docs connector.       |
| getConnectorClass            | PsAgentConnectorClassCreationAttributes | Static property defining the connector class attributes.                     |
| client                       | JWT                          | JWT client for authenticating with Google APIs.                              |
| docs                         | docs_v1.Docs                 | Google Docs API instance for interacting with documents.                     |

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

googleDocsConnector.getDocument().then((content) => {
  console.log("Document Content:", content);
}).catch((error) => {
  console.error("Error fetching document:", error);
});

const markdownContent = "# Title\n\nThis is a sample document.";
googleDocsConnector.updateDocumentFromMarkdown(markdownContent).then(() => {
  console.log("Document updated successfully.");
}).catch((error) => {
  console.error("Error updating document:", error);
});
```

This class provides a robust interface for interacting with Google Docs, including methods for retrieving and updating document content, as well as converting Markdown to Google Docs format.