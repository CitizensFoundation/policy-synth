# deleteSubProblemImages

This script is designed to delete the image URL of the fifth sub-problem (index 4) in a project's memory data stored in Redis. It retrieves the project ID from the command line arguments, fetches the corresponding memory data from Redis, updates the memory data by removing the image URL of the specified sub-problem, and then saves the updated memory data back to Redis.

## Methods

| Name         | Parameters | Return Type | Description                                                                                   |
|--------------|------------|-------------|-----------------------------------------------------------------------------------------------|
| loadProject  |            | Promise<void> | Fetches the project's memory data from Redis, updates it, and saves the changes back to Redis. |

## Example

```typescript
import { deleteSubProblemImages } from '@policysynth/agents/tools/deleteSubProblemImages.js';

// Assuming the project ID is passed as a command line argument
const projectId = process.argv[2];

deleteSubProblemImages.loadProject(projectId).catch(console.error);
```