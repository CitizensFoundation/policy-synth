# RootCauseWebPageVectorStore

This class is responsible for managing and querying vector data related to web page root causes. It provides functionality to test queries against the stored vector data.

## Properties

No public properties are documented for this class.

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| testQuery  | None       | Promise<void> | Executes a test query against the vector store. |

## Example

```javascript
import { RootCauseWebPageVectorStore } from '@policysynth/agents/vectorstore/utils/rootCauseWebPage.js';

const store = new RootCauseWebPageVectorStore();
await store.testQuery();
```