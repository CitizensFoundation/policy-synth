# deleteSubProblemImages

This script is used to delete the image URL of the fifth sub-problem in a project's memory data stored in Redis.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| loadProject | -                | Promise<void> | Deletes the image URL of the fifth sub-problem for a given project ID stored in Redis. Exits the process depending on the success or failure of the operation. |

## Example

```typescript
import { deleteSubProblemImages } from '@policysynth/agents/tools/deleteSubProblemImages.js';

// Assuming the project ID is passed as a command line argument
deleteSubProblemImages.loadProject().catch(console.error);
```