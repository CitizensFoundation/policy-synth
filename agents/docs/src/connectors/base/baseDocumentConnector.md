# PsBaseDocumentConnector

The `PsBaseDocumentConnector` is an abstract class that extends the `PsBaseConnector`. It provides a base structure for connectors that interact with documents, offering methods to retrieve and update document content.

## Properties

This class does not define any additional properties beyond those inherited from `PsBaseConnector`.

## Methods

| Name                        | Parameters                  | Return Type     | Description                                      |
|-----------------------------|-----------------------------|-----------------|--------------------------------------------------|
| `getDocument`               | None                        | `Promise<string>` | Abstract method to retrieve the document content as a string. |
| `updateDocument`            | `doc: string`               | `Promise<void>` | Abstract method to update the document with the provided string content. |
| `updateDocumentFromMarkdown`| `markdown: string`          | `Promise<void>` | Abstract method to update the document using the provided markdown content. |

## Example

```typescript
import { PsBaseDocumentConnector } from '@policysynth/agents/connectors/base/baseDocumentConnector.js';

class MyDocumentConnector extends PsBaseDocumentConnector {
  async getDocument(): Promise<string> {
    // Implementation to retrieve document content
  }

  async updateDocument(doc: string): Promise<void> {
    // Implementation to update document content
  }

  async updateDocumentFromMarkdown(markdown: string): Promise<void> {
    // Implementation to update document from markdown
  }
}
```

In this example, `MyDocumentConnector` extends `PsBaseDocumentConnector` and provides concrete implementations for the abstract methods to interact with document content.