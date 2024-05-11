# addCustomUrls

This function adds custom search URLs to specific sub-problems in a project's memory data stored in Redis.

## Properties

No properties are defined in this function.

## Methods

| Name          | Parameters        | Return Type | Description                 |
|---------------|-------------------|-------------|-----------------------------|
| addCustomUrls | None              | Promise<void> | Adds custom search URLs to the memory data of a specified project in Redis. |

## Example

```typescript
// Example usage of addCustomUrls
import { addCustomUrls } from '@policysynth/agents/tools/addCustomSearchUrls.js';

addCustomUrls().catch(console.error);
```