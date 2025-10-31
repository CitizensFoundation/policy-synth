# PsGoogleDocsConnector

A connector class for integrating with Google Docs, allowing agents to read from and write to Google Docs documents. This connector supports authentication via Google Service Account credentials and provides methods for retrieving, updating, and converting Markdown to Google Docs format, including support for images and links.

**File:** `@policysynth/agents/connectors/documents/googleDocsConnector.js`

---

## Properties

| Name         | Type                                   | Description                                                                                 |
|--------------|----------------------------------------|---------------------------------------------------------------------------------------------|
| client       | `JWT`                                  | Authenticated Google JWT client for API requests.                                           |
| docs         | `docs_v1.Docs`                         | Google Docs API client instance.                                                            |

---

## Static Properties

| Name                                    | Type      | Description                                                                                 |
|------------------------------------------|-----------|---------------------------------------------------------------------------------------------|
| GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID      | `string`  | Unique base ID for the connector class.                                                     |
| GOOGLE_DOCS_CONNECTOR_VERSION            | `number`  | Version number of the connector class.                                                      |
| getConnectorClass                        | `PsAgentConnectorClassCreationAttributes` | Connector class definition with configuration and structured questions.                     |

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

- **Description:** Initializes the connector, authenticates with Google using Service Account credentials, and sets up the Google Docs API client.
- **Throws:** Error if credentials are missing or invalid.

---

## Methods

| Name                        | Parameters                                                                 | Return Type                                      | Description                                                                                       |
|-----------------------------|----------------------------------------------------------------------------|--------------------------------------------------|---------------------------------------------------------------------------------------------------|
| getDocument                 | none                                                                       | `Promise<string>`                                | Retrieves the document content as plain text from Google Docs.                                     |
| updateDocument              | `doc: string`                                                              | `Promise<void>`                                  | Updates the Google Doc with the provided plain text.                                               |
| getData                     | `documentId: string`                                                       | `Promise<docs_v1.Schema$Document>`               | Fetches the full Google Docs document object.                                                      |
| markdownToGoogleDocs        | `markdown: string`                                                         | `{ requests: docs_v1.Schema$Request[] }`         | Converts Markdown text to a series of Google Docs API requests (supports headings, images, links). |
| updateDocumentFromMarkdown  | `markdown: string`                                                         | `Promise<void>`                                  | Updates the Google Doc by converting Markdown to Google Docs format and applying the changes.      |
| extractText                 | `content: docs_v1.Schema$StructuralElement[]`                              | `string`                                         | Extracts plain text from the Google Docs document structure.                                       |
| static getExtraConfigurationQuestions | none                                                              | `YpStructuredQuestionData[]`                     | Returns extra configuration questions required for this connector.                                 |

---

## Example

```typescript
import { PsGoogleDocsConnector } from '@policysynth/agents/connectors/documents/googleDocsConnector.js';

// Example: Initialize connector (assume you have the required attributes)
const connector = /* PsAgentConnectorAttributes */;
const connectorClass = /* PsAgentConnectorClassAttributes */;
const agent = /* PsAgent */;
const memory = undefined;

const googleDocsConnector = new PsGoogleDocsConnector(
  connector,
  connectorClass,
  agent,
  memory
);

// Get document content as plain text
const text = await googleDocsConnector.getDocument();
console.log(text);

// Update document with new plain text
await googleDocsConnector.updateDocument("Hello, world!");

// Update document from Markdown (with images and links)
const markdown = `
# Title

This is a **bold** and *italic* text.

![Alt text](https://example.com/image.png)

[Link text](https://example.com)
`;

await googleDocsConnector.updateDocumentFromMarkdown(markdown);
```

---

## Structured Configuration Questions

The connector requires the following configuration fields (used for setup in UI or API):

| uniqueId         | text                | type       | required | Description                        |
|------------------|---------------------|------------|----------|------------------------------------|
| name             | Name                | textField  | true     | Name for this connector instance   |
| description      | Description         | textArea   | false    | Optional description               |
| googleDocsId     | Document ID         | textField  | true     | Google Docs document ID            |
| credentialsJson  | ServiceAccount JSON | textArea   | true     | Google Service Account credentials |

---

## Notes

- **Authentication:** Uses Google Service Account credentials (JSON) for API access.
- **Markdown Support:** The `markdownToGoogleDocs` method supports headings, bold, italic, images, and links.
- **Error Handling:** Throws descriptive errors for missing credentials, rate limits, and server errors.
- **Extensibility:** Inherits from `PsBaseDocumentConnector` for base document connector functionality.

---

## Utility Functions (Internal)

- `deepClone(obj: any): any` — Deeply clones an object or array.
- `getFieldsFromAttributes(attributes: any, prefix = ''): string` — Recursively builds a comma-separated list of attribute paths for Google Docs API field updates.

---

## See Also

- [Google Docs API Documentation](https://developers.google.com/docs/api)
- [PsBaseDocumentConnector](../base/baseDocumentConnector.js)
- [PsAgentConnectorClassAttributes](../../dbModels/agentConnectorClass.js)
- [YpStructuredQuestionData](see AllTypeDefsUsedInProject)

---