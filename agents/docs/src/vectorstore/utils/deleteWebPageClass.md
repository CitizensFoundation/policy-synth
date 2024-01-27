# deleteWebPageClass

This file provides a utility function to delete a scheme from a `WebPageVectorStore` instance.

## Methods

| Name | Parameters | Return Type | Description |
|------|------------|-------------|-------------|
| run  | None       | Promise<void> | Deletes a scheme from the `WebPageVectorStore`. |

## Example

```javascript
// Example usage of deleteWebPageClass
import { WebPageVectorStore } from '@policysynth/agents/vectorstore/webPage.js';

async function run() {
    const store = new WebPageVectorStore();
    await store.deleteScheme();
}

run();
```