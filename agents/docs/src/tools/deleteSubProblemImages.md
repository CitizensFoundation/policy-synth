# deleteSubProblemImages

This script is designed to delete the image URL of the fifth sub-problem (index 4) in a project's memory data stored in Redis. It retrieves the project ID from the command line arguments, fetches the corresponding memory data from Redis, updates the memory data by removing the image URL of the specified sub-problem, and then saves the updated memory data back to Redis.

## Methods

| Name         | Parameters | Return Type | Description                                                                                   |
|--------------|------------|-------------|-----------------------------------------------------------------------------------------------|
| loadProject  |            | Promise<void> | Main function that loads the project's memory data, updates it, and saves it back to Redis. |

## Example

```javascript
// Example usage to delete sub problem image
import '@policysynth/agents/tools/deleteSubProblemImages.js';

// Assuming the script is executed with a project ID as an argument
// node deleteSubProblemImages.js <projectId>
```

Note: This script requires a project ID to be passed as a command-line argument. It utilizes the `ioredis` package for Redis operations and the `fs/promises` module, although the latter is not used in the provided code snippet.