# RedisProjectMemoryManager

This class is responsible for managing project memory data in a Redis database. It connects to Redis, retrieves and updates project memory data based on a given project ID.

## Properties

No properties are documented for this class.

## Methods

| Name         | Parameters        | Return Type | Description                                      |
|--------------|-------------------|-------------|--------------------------------------------------|
| loadProject  |                   | Promise<void> | Loads the project data from Redis, updates it, and saves it back to Redis. |

## Examples

```typescript
import ioredis from 'ioredis';

// Assuming environment variable REDIS_MEMORY_URL is set or defaults to 'redis://localhost:6379'
const redis = new ioredis.default();

const projectId = 'your_project_id_here'; // Replace with your actual project ID

const loadProject = async (): Promise<void> => {
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as IEngineInnovationMemoryData;
    memory.subProblems[4].imageUrl = undefined;
    await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
    process.exit(0);
  } else {
    console.log('No project id provided - delete sub problem image');
    process.exit(1);
  }
};

loadProject().catch(console.error);
```

Please note that the example assumes that the `IEngineInnovationMemoryData` type is already defined in your codebase and that the Redis server is accessible through the provided URL. The `projectId` should be replaced with the actual ID of the project you wish to manage in Redis.