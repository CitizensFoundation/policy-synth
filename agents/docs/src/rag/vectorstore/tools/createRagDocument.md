# PsRagDocumentVectorStore

This class is responsible for managing the vector storage for RAG documents.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| addSchema  | none              | Promise<void> | Adds schema to the vector store |

## Example

```typescript
import { PsRagDocumentVectorStore } from '@policysynth/agents/rag/vectorstore/tools/ragDocument.js';

async function run() {
    const store = new PsRagDocumentVectorStore();
    await store.addSchema();
    process.exit(0);
}

run();
```