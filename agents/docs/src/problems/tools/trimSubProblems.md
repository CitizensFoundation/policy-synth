# trimSubProblems.js

This script is designed to trim the `subProblems` array of a project stored in Redis to a specified new length. It requires a project ID and the new length as command-line arguments.

## Methods

| Name  | Parameters | Return Type | Description |
|-------|------------|-------------|-------------|
| main  | None       | Promise<void> | The main function that executes the trimming process. |

## Example

```typescript
import { PsBaseMemoryData } from '@policysynth/agents/problems/tools/trimSubProblems.js';

// Assuming the environment is properly set up with REDIS_MEMORY_URL
// and the necessary project ID and new length are passed as command-line arguments:
// node trimSubProblems.js <projectId> <newLength>

// This script will trim the subProblems of the specified project to the new length.
```