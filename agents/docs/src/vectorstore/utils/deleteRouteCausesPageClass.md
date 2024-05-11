# RootCauseWebPageVectorStore

This class provides methods to interact with the Root Cause Web Page Vector Store, including the ability to delete specific schemes.

## Methods

| Name          | Parameters | Return Type | Description                           |
|---------------|------------|-------------|---------------------------------------|
| deleteScheme  | -          | Promise<void> | Asynchronously deletes a scheme from the store. |

## Example

```typescript
import { RootCauseWebPageVectorStore } from '@policysynth/agents/vectorstore/utils/deleteRouteCausesPageClass.js';

async function run() {
    const store = new RootCauseWebPageVectorStore();
    await store.deleteScheme();
    process.exit(0);
}

run();
```