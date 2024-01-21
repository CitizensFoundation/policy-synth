# IEngineInnovationMemoryData

This class represents the data structure for the engine innovation memory data associated with a project.

## Properties

| Name          | Type                      | Description                                       |
|---------------|---------------------------|---------------------------------------------------|
| subProblems   | SubProblem[]              | An array of sub-problems related to the project.  |

## Methods

No methods are documented for this type.

## Examples

```typescript
// Example usage of IEngineInnovationMemoryData
const currentProject: IEngineInnovationMemoryData = {
  subProblems: [
    // ... array of SubProblem instances
  ]
};
```

# Queue

A class from the "bullmq" package that represents a robust queue system based on Redis.

## Properties

No properties are documented for this type.

## Methods

No methods are documented for this type.

## Examples

```typescript
// Example usage of Queue from "bullmq"
import { Queue } from "bullmq";

const myQueue = new Queue('myQueueName', {
  connection: redisClient
});
```

# ioredis

A robust, performance-focused, and full-featured Redis client for Node.js.

## Properties

No properties are documented for this type.

## Methods

No methods are documented for this type.

## Examples

```typescript
// Example usage of ioredis
import ioredis from "ioredis";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);
```

# main

The main function of the script, responsible for trimming the memory data of a project.

## Properties

No properties are documented for this function.

## Methods

No methods are documented for this function.

## Examples

```typescript
// Example usage of the main function
main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

Please note that the provided TypeScript file does not define a class or interface explicitly named `IEngineInnovationMemoryData` or `SubProblem`. The documentation assumes these types are defined elsewhere in the codebase. If these types are part of the provided code, please include their definitions for accurate documentation.