# modifySubProblemEloScores

This script is designed to modify the Elo scores of specific sub-problems within a project's memory data stored in Redis. It retrieves a project's memory data by its ID, updates the Elo scores for specified sub-problems, reorders the sub-problems based on their new Elo scores, and then saves the updated memory data back to Redis.

## Methods

| Name         | Parameters | Return Type | Description                                                                 |
|--------------|------------|-------------|-----------------------------------------------------------------------------|
| loadProject  |            | Promise<void> | Main function that loads a project's memory data, updates it, and saves it. |

## Example

```javascript
// Example usage of modifySubProblemEloScores
import '@policysynth/agents/tools/modifySubProblemEloScors.js';

// Assuming the environment is properly set up with REDIS_MEMORY_URL and the project ID is passed as a command-line argument
// Run the script directly with node:
// node modifySubProblemEloScors.js <projectId>
```