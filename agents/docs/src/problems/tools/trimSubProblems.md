# trimSubProblems.js

This script is used to trim the subProblems array of a project stored in Redis to a specified new length. It requires a project ID and the new length as command-line arguments.

## Properties

No properties are directly defined in this script.

## Methods

| Name   | Parameters        | Return Type | Description                                       |
|--------|-------------------|-------------|---------------------------------------------------|
| main   | None              | Promise<void> | The main function that executes the trimming process. |

## Example

```typescript
import { main } from '@policysynth/agents/problems/tools/trimSubProblems.js';

// Example usage to trim subProblems
main().catch(err => {
  console.error(err);
  process.exit(1);
});
```