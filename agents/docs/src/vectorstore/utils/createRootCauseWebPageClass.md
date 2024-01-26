# RootCauseWebPageVectorStore

This class is responsible for managing the storage and retrieval of root cause web page vectors.

## Properties

No properties documented.

## Methods

| Name       | Parameters | Return Type | Description                                 |
|------------|------------|-------------|---------------------------------------------|
| addSchema  | -          | Promise<void> | Asynchronously adds the schema to the store. |

## Example

```javascript
import {RootCauseWebPageVectorStore} from '@policysynth/agents/vectorstore/utils/createRootCauseWebPageClass.js';

async function run() {
    const store = new RootCauseWebPageVectorStore();
    await store.addSchema();
}

run();
```