# loadProject

This function is designed to load project data from a local file and set it back to Redis based on the project ID provided as a command-line argument.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| loadProject | - | Promise<void> | Loads project data from a local file and updates Redis with the loaded data. Exits the process upon completion or error. |

## Example

```javascript
// Example usage of loadProject
import '@policysynth/agents/tools/loadProject.js';

// Assuming the process is called with a project ID as an argument
// node loadProject.js <projectId>

// This will attempt to load the project data from a file named `currentProject<projectId>.json`
// and update the corresponding data in Redis.
```