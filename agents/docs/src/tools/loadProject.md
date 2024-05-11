# loadProject

This function loads a project's data from a local JSON file and sets it in Redis.

## Properties

No properties are defined in this module.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| loadProject | None             | Promise<void> | Loads project data from a local file and updates Redis. |

## Example

```typescript
import { loadProject } from '@policysynth/agents/tools/loadProject.js';

// Assuming process.argv[2] is set to the project ID
loadProject().catch(console.error);
```