# RootCauseWebPageVectorStore

This class is responsible for managing the storage and retrieval of root cause web page vectors.

## Properties

No properties are documented for this class.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| addSchema  | -                 | Promise<void> | Initializes or updates the schema in the vector store. |

## Example

```typescript
import { RootCauseWebPageVectorStore } from '@policysynth/agents/vectorstore/utils/createRootCauseWebPageClass.js';

async function run() {
    const store = new RootCauseWebPageVectorStore();
    await store.addSchema();
    process.exit(0);
}

run();
```