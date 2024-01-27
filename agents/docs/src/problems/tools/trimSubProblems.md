# trimSubProblems

This script is designed to trim the `subProblems` array of a project stored in Redis to a specified new length. It requires a project ID and the new length as command-line arguments.

## Methods

| Name  | Parameters | Return Type | Description |
|-------|------------|-------------|-------------|
| main  | None       | Promise<void> | The main function of the script. It trims the `subProblems` array of a specified project to a new length. |

## Example

```
// Example usage of trimSubProblems
import { main } from '@policysynth/agents/problems/tools/trimSubProblems.js';

// Command line execution
// node trimSubProblems.js <projectId> <newLength>

// Assuming the projectId is "123" and the newLength is "5", the command would be:
// node trimSubProblems.js 123 5
```