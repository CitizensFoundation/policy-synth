# PsRagChunkVectorStore

This class provides methods to interact with the RAG (Retrieval-Augmented Generation) chunk vector store, specifically allowing operations like deleting the storage scheme.

## Methods

| Name         | Parameters | Return Type | Description                           |
|--------------|------------|-------------|---------------------------------------|
| deleteScheme | None       | Promise<void> | Asynchronously deletes the storage scheme for the RAG chunks. |

## Example

```typescript
// Example usage of PsRagChunkVectorStore to delete a scheme
import { PsRagChunkVectorStore } from '@policysynth/agents/rag/vectorstore/ragChunk.js';

async function run() {
    const store = new PsRagChunkVectorStore();
    await store.deleteScheme();
    process.exit(0);
}

run();
```