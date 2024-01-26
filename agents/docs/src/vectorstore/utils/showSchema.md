# WebPageVectorStore

This class is responsible for managing the storage and retrieval of web page vectors.

## Methods

| Name        | Parameters | Return Type | Description                           |
|-------------|------------|-------------|---------------------------------------|
| showScheme  | -          | Promise<void> | Displays the schema of the web page vector store. |

## Example

```javascript
import { WebPageVectorStore } from '@policysynth/agents/vectorstore/webPage.js';

async function run() {
    const store = new WebPageVectorStore();
    await store.showScheme();
}

run();
```