# DeleteEvidenceWebPageClass

This class provides a method to delete evidence web page data from the vector store.

## Properties

No properties are defined for this class.

## Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| run  | None       | Promise<void> | Deletes evidence web page data from the vector store. |

## Example

```javascript
// Example usage of DeleteEvidenceWebPageClass
import { EvidenceWebPageVectorStore } from '@policysynth/agents/vectorstore/utils/evidenceWebPage.js';

async function run() {
    const store = new EvidenceWebPageVectorStore();
    await store.deleteScheme();
}

run();
```