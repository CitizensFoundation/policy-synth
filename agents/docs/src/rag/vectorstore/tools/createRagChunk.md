# PsRagChunkVectorStore

This class is responsible for managing RAG (Retrieval-Augmented Generation) chunk vectors in a storage system.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| addSchema  | -                 | Promise<void> | Initializes or updates the schema in the database for storing RAG chunks. |

## Example

```typescript
// Example usage of PsRagChunkVectorStore
import { PsRagChunkVectorStore } from '@policysynth/agents/rag/vectorstore/tools/ragChunk.js';

async function run() {
    const store = new PsRagChunkVectorStore();
    await store.addSchema();
    process.exit(0);
}

run();
```