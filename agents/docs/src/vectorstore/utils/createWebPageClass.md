# WebPageVectorStore

This class is responsible for managing the storage of web page vectors. It extends functionalities to add schemas related to web page vectors.

## Properties

No properties are documented for this class.

## Methods

| Name       | Parameters | Return Type | Description                 |
|------------|------------|-------------|-----------------------------|
| addSchema  | -          | Promise<void> | Asynchronously adds a schema for web page vectors to the store. |

## Example

```javascript
import { WebPageVectorStore } from '@policysynth/agents/vectorstore/utils/createWebPageClass.js';

async function run() {
    const store = new WebPageVectorStore();
    await store.addSchema();
}

run();
```