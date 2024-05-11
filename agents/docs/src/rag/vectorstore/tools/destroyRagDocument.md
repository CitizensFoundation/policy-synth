# PsRagDocumentVectorStore

This class provides methods to interact with the RAG document vector storage, including operations to delete the storage scheme.

## Methods

| Name         | Parameters | Return Type | Description                           |
|--------------|------------|-------------|---------------------------------------|
| deleteScheme | none       | Promise<void> | Asynchronously deletes the storage scheme. |

## Example

```typescript
import { PsRagDocumentVectorStore } from '@policysynth/agents/rag/vectorstore/tools/destroyRagDocument.js';

async function run() {
    const store = new PsRagDocumentVectorStore();
    await store.deleteScheme();
    process.exit(0);
}

run();
```