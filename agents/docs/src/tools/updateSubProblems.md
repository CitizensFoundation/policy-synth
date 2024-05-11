# loadProject

This function updates specific sub-problems within a project's memory data stored in Redis.

## Properties

No properties are directly defined within this function.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| loadProject | None             | Promise<void> | Updates sub-problems in the project's memory data based on the provided project ID. If no project ID is provided, it logs an error and exits the process. |

## Example

```typescript
import { loadProject } from '@policysynth/agents/tools/updateSubProblems.js';

// Assuming the environment and project ID are correctly set,
// this example will update specific sub-problems in the project's memory data.
loadProject().catch(console.error);
```