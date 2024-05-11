# deleteSolutionImage

This script is used to delete the image URL and image prompt from a specific solution within a project's memory data stored in Redis.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| loadProject | -                | Promise<void> | Deletes the image URL and image prompt for a specific solution in the project's memory data. |

## Example

```typescript
import { deleteSolutionImage } from '@policysynth/agents/solutions/tools/deleteSolutionImage.js';

// Example usage
deleteSolutionImage();
```