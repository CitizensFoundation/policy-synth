# PsRagChunkVectorStore

The `PsRagChunkVectorStore` class is responsible for managing the vector store for RAG (Retrieval-Augmented Generation) chunks. This class provides methods to add schemas and manage the vector store effectively.

## Methods

### addSchema

```typescript
async addSchema(): Promise<void>
```

Adds the schema to the vector store. This method is asynchronous and returns a promise that resolves when the schema has been added.

## Example

```typescript
import { PsRagChunkVectorStore } from "../ragChunk.js";

async function run() {
    const store = new PsRagChunkVectorStore();
    await store.addSchema();
    process.exit(0);
}

run();
```

In this example, an instance of `PsRagChunkVectorStore` is created, and the `addSchema` method is called to add the schema to the vector store. The process exits once the schema has been added.