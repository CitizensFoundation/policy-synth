# EvidenceWebPageVectorStore

This class is responsible for managing the storage of evidence web page vectors. It provides functionalities to interact with the storage system, including adding schemas to organize the data.

## Properties

No properties are documented for this class.

## Methods

| Name       | Parameters | Return Type | Description                                 |
|------------|------------|-------------|---------------------------------------------|
| addSchema  | -          | Promise<void> | Asynchronously adds a schema to the store. |

## Example

```javascript
// Example usage of EvidenceWebPageVectorStore
import { EvidenceWebPageVectorStore } from '@policysynth/agents/vectorstore/utils/createEvidenceWebPageClass.js';

async function run() {
    const store = new EvidenceWebPageVectorStore();
    await store.addSchema();
}

run();
```