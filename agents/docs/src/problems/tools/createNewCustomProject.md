# createNewCustomProject

This script is used for creating a new custom project in Redis. It checks if a project with the given ID already exists and, based on the presence of a "force" parameter, either overwrites the existing project or exits with an error message. If the project does not exist or is being forcefully overwritten, it creates a new project with a predefined structure and saves it to Redis.

## Properties

No properties are directly defined in this script.

## Methods

No methods are directly defined in this script.

## Example

```
// Example usage of createNewCustomProject
import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

// Usage: node @policysynth/agents/problems/tools/createNewCustomProject <projectId> [force]
const projectId = process.argv[2];
const force = process.argv[3];

if (projectId) {
  // Logic to create or overwrite a project in Redis
} else {
  console.log("Usage: node createNewCustomProject <projectId>");
  process.exit(1);
}
```