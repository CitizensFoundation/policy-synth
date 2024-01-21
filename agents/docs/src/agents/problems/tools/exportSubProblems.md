# Queue

Queue is a class from the "bullmq" package that allows for robust handling of jobs and messages in a queue system backed by Redis.

## Properties

No properties are documented for the Queue class in the provided code snippet.

## Methods

No methods are documented for the Queue class in the provided code snippet.

## Examples

```typescript
// Example usage of the Queue class from "bullmq"
```

# ioredis

ioredis is a robust, performance-focused, and full-featured Redis client for Node.js.

## Properties

No properties are documented for the ioredis class in the provided code snippet.

## Methods

No methods are documented for the ioredis class in the provided code snippet.

## Examples

```typescript
// Example usage of the ioredis client
const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);
```

# IEngineInnovationMemoryData

This interface represents the structure of the memory data related to an engine innovation project.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| subProblems   | SubProblem[] | An array of sub-problems associated with the project. |

## Methods

No methods are documented for the IEngineInnovationMemoryData interface in the provided code snippet.

## Examples

```typescript
// Example usage of IEngineInnovationMemoryData
const currentProject: IEngineInnovationMemoryData = JSON.parse(await redis.get(redisKey) || "");
```

# SubProblem

This type represents the structure of a sub-problem within an engine innovation project.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| description   | string | A brief description of the sub-problem. |
| title         | string | The title of the sub-problem. |
| whyIsSubProblemImportant | string | Explanation of why the sub-problem is important. |
| eloRating     | number | The Elo rating associated with the sub-problem. |
| fromSearchType| string | The type of search from which the sub-problem originated. |

## Methods

No methods are documented for the SubProblem type in the provided code snippet.

## Examples

```typescript
// Example usage of SubProblem
currentProject.subProblems.forEach((subProblem) => {
  // Access properties of subProblem here
});
```

Please note that the provided code snippet does not include the actual definitions for `IEngineInnovationMemoryData` or `SubProblem`, so the properties listed above are inferred from the usage within the code. If these types are defined elsewhere in the codebase, the properties and types should be adjusted accordingly.