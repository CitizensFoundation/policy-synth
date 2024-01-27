# addCustomSearchUrls

This script is designed to add custom search URLs to specific sub-problems within a project's memory data in Redis. It retrieves the project's memory data using a project ID, modifies the memory data by adding custom URLs to specified sub-problems, and then updates the project's memory data in Redis.

## Methods

| Name          | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| addCustomUrls |            | Promise<void> | Main function that adds custom search URLs to the project's memory data in Redis. It exits the process with code 0 on success and code 1 if no project ID is provided. |

## Example

```javascript
// Example usage of addCustomSearchUrls
import { addCustomSearchUrls } from '@policysynth/agents/tools/addCustomSearchUrls.js';

// Assuming process.argv[2] contains the project ID
addCustomSearchUrls().catch(console.error);
```