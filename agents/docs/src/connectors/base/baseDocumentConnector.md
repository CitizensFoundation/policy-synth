# PsBaseDocumentConnector

The `PsBaseDocumentConnector` is an abstract class that extends the `PsBaseConnector`. It provides a base structure for document connectors, defining methods for retrieving and updating documents.

## Properties

This class does not define any additional properties beyond those inherited from `PsBaseConnector`.

## Methods

| Name            | Parameters       | Return Type     | Description                                      |
|-----------------|------------------|-----------------|--------------------------------------------------|
| `getDocument`   | None             | `Promise<string>` | Abstract method to retrieve a document.          |
| `updateDocument`| `doc: string`    | `Promise<void>` | Abstract method to update a document with the provided content. |

## Example

```typescript
import { PsBaseDocumentConnector } from '@policysynth/agents/connectors/base/baseDocumentConnector.js';

class MyDocumentConnector extends PsBaseDocumentConnector {
  async getDocument(): Promise<string> {
    // Implementation to retrieve the document
    return "Document content";
  }

  async updateDocument(doc: string): Promise<void> {
    // Implementation to update the document
  }
}

const myConnector = new MyDocumentConnector();
myConnector.getDocument().then(doc => console.log(doc));
myConnector.updateDocument("Updated content").then(() => console.log("Document updated"));
```

In this example, `MyDocumentConnector` extends `PsBaseDocumentConnector` and provides concrete implementations for the `getDocument` and `updateDocument` methods.