# addCustomUrls

This function adds custom search URLs to specific subProblems within a project's memory in Redis.

## Methods

| Name         | Parameters | Return Type | Description                                                                 |
|--------------|------------|-------------|-----------------------------------------------------------------------------|
| addCustomUrls |            | Promise<void> | Adds custom search URLs to the memory of a specified project in Redis. |

## Example

```typescript
import { addCustomUrls } from '@policysynth/agents/tools/addCustomSearchUrls.js';

// Assuming the project ID is provided as a command line argument
addCustomUrls().catch(console.error);
```