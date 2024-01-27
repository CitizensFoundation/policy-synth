# WebPageVectorStore

This class is responsible for managing and querying vector data related to web pages.

## Properties

No properties documented.

## Methods

| Name       | Parameters | Return Type | Description                                 |
|------------|------------|-------------|---------------------------------------------|
| testQuery  | None       | Promise<void> | Executes a test query against the vector store. |

## Example

```javascript
// Example usage of WebPageVectorStore
import { WebPageVectorStore } from '@policysynth/agents/vectorstore/utils/webPage.js';

const store = new WebPageVectorStore();
await store.testQuery();
```