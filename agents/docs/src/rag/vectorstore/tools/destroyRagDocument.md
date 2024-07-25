# PsRagDocumentVectorStore

The `PsRagDocumentVectorStore` class is responsible for managing the vector store for RAG (Retrieval-Augmented Generation) documents. This class provides methods to interact with the vector store, including deleting the schema.

## Methods

| Name         | Parameters | Return Type | Description                          |
|--------------|-------------|-------------|--------------------------------------|
| deleteScheme | None        | Promise<void> | Deletes the schema from the vector store. |

## Example

```typescript
import { PsRagDocumentVectorStore } from "../ragDocument.js";

async function run() {
    const store = new PsRagDocumentVectorStore();
    await store.deleteScheme();
    process.exit(0);
}

run();
```

In this example, an instance of `PsRagDocumentVectorStore` is created, and the `deleteScheme` method is called to delete the schema from the vector store. After the schema is deleted, the process exits with a status code of 0.