# dedupSubProblems

This script is designed to deduplicate sub-problems within a project stored in Redis. It connects to a Redis instance, retrieves a project by its ID, removes any duplicate sub-problems based on their descriptions, and updates the project in Redis.

## Methods

| Name  | Parameters | Return Type | Description |
|-------|------------|-------------|-------------|
| main  | None       | Promise<void> | The main function of the script. It deduplicates sub-problems for a given project ID passed as a command-line argument. |

## Example

```typescript
import { dedupSubProblems } from '@policysynth/agents/problems/tools/dedupSubProblems.js';

// Assuming process.argv[2] is the project ID
dedupSubProblems.main().catch(err => {
  console.error(err);
  process.exit(1);
});
```