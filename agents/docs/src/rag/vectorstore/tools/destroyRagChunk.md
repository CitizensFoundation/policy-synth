# PsRagChunkVectorStore

The `PsRagChunkVectorStore` class is responsible for managing the vector store for RAG (Retrieval-Augmented Generation) chunks. This class provides methods to interact with the underlying vector store, including creating, deleting, and managing the schema.

## Methods

| Name         | Parameters        | Return Type | Description                                      |
|--------------|-------------------|-------------|--------------------------------------------------|
| deleteScheme | None              | Promise<void> | Deletes the schema from the vector store.        |

## Example

```typescript
import { PsRagChunkVectorStore } from "../ragChunk.js";

async function run() {
    const store = new PsRagChunkVectorStore();
    await store.deleteScheme();
    process.exit(0);
}

run();
```

In this example, an instance of `PsRagChunkVectorStore` is created, and the `deleteScheme` method is called to delete the schema from the vector store. After the schema is deleted, the process exits with a status code of 0.