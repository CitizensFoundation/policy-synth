# modifySubProblemEloScores

This script modifies the Elo scores of specific sub-problems within a project's memory data stored in Redis and reorders the sub-problems based on their new Elo ratings.

## Methods

| Name         | Parameters | Return Type | Description                                                                 |
|--------------|------------|-------------|-----------------------------------------------------------------------------|
| loadProject  |            | Promise<void> | Modifies the Elo scores of specific sub-problems and reorders them. |

## Example

```typescript
import { PsBaseMemoryData } from '@policysynth/agents/types';

// Example usage of modifySubProblemEloScores
import '@policysynth/agents/tools/modifySubProblemEloScors.js';

const projectId = 'your_project_id_here';

(async () => {
  await loadProject(projectId);
})();
```