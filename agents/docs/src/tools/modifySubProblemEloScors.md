# loadProject

This function loads a project from Redis, modifies the Elo scores of specific sub-problems, and then saves the updated project back to Redis.

## Properties

No properties are defined in this function.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| loadProject | None             | Promise<void> | Loads a project, modifies sub-problems' Elo scores, and saves the changes. |

## Example

```typescript
import { loadProject } from '@policysynth/agents/tools/modifySubProblemEloScors.js';

// Assuming the environment variable REDIS_MEMORY_URL is set, or Redis is running on localhost:6379
// Run the function with a project ID provided as a command line argument
loadProject().catch(console.error);
```