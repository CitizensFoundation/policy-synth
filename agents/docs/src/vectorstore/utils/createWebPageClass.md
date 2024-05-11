# WebPageVectorStore

This class is responsible for managing the storage of web page vectors.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| data          | any    | Storage for the web page vectors. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| addSchema  | -                 | Promise<void> | Adds schema to the store.  |

## Example

```typescript
import { WebPageVectorStore } from '@policysynth/agents/vectorstore/utils/createWebPageClass.js';

async function run() {
    const store = new WebPageVectorStore();
    await store.addSchema();
    process.exit(0);
}

run();
```