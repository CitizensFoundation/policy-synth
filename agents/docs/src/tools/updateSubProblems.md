# updateSubProblems

This script updates specific sub-problems within a project's memory data in Redis based on the provided project ID. It modifies the titles, descriptions, and importance explanations of certain sub-problems to reflect updated understandings or focuses.

## Methods

| Name         | Parameters | Return Type | Description                                                                 |
|--------------|------------|-------------|-----------------------------------------------------------------------------|
| loadProject  |            | Promise<void> | Updates sub-problems in a project's memory data if a project ID is provided. |

## Example

```javascript
// Example usage of updateSubProblems
import '@policysynth/agents/tools/updateSubProblems.js';

// Assuming the environment is correctly set up with REDIS_MEMORY_URL and the project ID is passed as a command-line argument
// Run the script with:
// node updateSubProblems.js <project_id>

// This will update the specified sub-problems within the project's memory data in Redis.
```