# PsRagDocumentVectorStore

The `PsRagDocumentVectorStore` class is responsible for managing the vector store for RAG (Retrieval-Augmented Generation) documents. This class provides methods to add schemas and manage the vector store effectively.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| addSchema  | -                 | Promise<void> | Adds the schema to the vector store. |

## Example

```typescript
import { PsRagDocumentVectorStore } from "../ragDocument.js";

async function run() {
    const store = new PsRagDocumentVectorStore();
    await store.addSchema();
    process.exit(0);
}

run();
```

In this example, an instance of `PsRagDocumentVectorStore` is created, and the `addSchema` method is called to add the schema to the vector store. The process exits once the schema is added successfully.