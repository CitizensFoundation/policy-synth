# EvidenceWebPageVectorStore

This class is designed to manage and interact with evidence web page vector data. It provides functionalities to query and manipulate evidence web page vectors stored in a vector store.

## Properties

No properties are documented for this class.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| testQuery  | None              | Promise<void> | Executes a test query against the evidence web page vector store. |

## Example

```javascript
// Example usage of EvidenceWebPageVectorStore
import { EvidenceWebPageVectorStore } from '@policysynth/agents/vectorstore/utils/evidenceWebPage.js';

const store = new EvidenceWebPageVectorStore();
await store.testQuery();
```