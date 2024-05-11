# importSubProblems

This function imports sub-problems into a project's memory data from a specified file and updates the Redis database.

## Parameters

| Name      | Type   | Description                                   |
|-----------|--------|-----------------------------------------------|
| projectId | string | The ID of the project.                        |
| filePath  | string | The path to the file containing sub-problems. |

## Example

```typescript
import { importSubProblems } from '@policysynth/agents/problems/tools/importSubProblems.js';

const projectId = '123';
const filePath = './data/subProblems.json';

await importSubProblems(projectId, filePath);
```

# main

This function is the entry point for the script that handles the import of sub-problems. It retrieves the project ID and file path from the command line arguments, validates them, and calls `importSubProblems`.

## Example

```typescript
import { main } from '@policysynth/agents/problems/tools/importSubProblems.js';

main();
```