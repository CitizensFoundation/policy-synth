# updateSubProblems

This script updates specific sub-problems within a project's memory data in Redis based on the provided project ID. It modifies titles, descriptions, and importance explanations for predefined sub-problems related to election integrity and democracy.

## Methods

| Name       | Parameters | Return Type | Description                                                                 |
|------------|------------|-------------|-----------------------------------------------------------------------------|
| loadProject | None       | Promise<void> | Updates sub-problems in a project's memory data stored in Redis. Exits the process upon completion or error. |

## Example

```typescript
import { PsBaseMemoryData } from '@policysynth/agents/types';

// Example usage of updateSubProblems
import { loadProject } from '@policysynth/agents/tools/updateSubProblems.js';

(async () => {
  await loadProject();
})();
```