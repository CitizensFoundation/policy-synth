# RedisProjectMemoryManager

This class is responsible for managing project memory data in a Redis database. It connects to Redis, retrieves and updates project memory data based on a given project ID.

## Properties

No public properties are documented for this class.

## Methods

| Name         | Parameters            | Return Type | Description                                      |
|--------------|-----------------------|-------------|--------------------------------------------------|
| loadProject  | -                     | Promise<void> | Loads the project data, updates sub problem elo ratings, and saves the updated data back to Redis. |

## Examples

```typescript
import ioredis from 'ioredis';

// Assuming environment variable REDIS_MEMORY_URL is set or defaulting to 'redis://localhost:6379'
const redis = new ioredis.default();

// Example usage of the RedisProjectMemoryManager
const projectId = 'your_project_id_here';

const loadProject = async (): Promise<void> => {
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as IEngineInnovationMemoryData;

    // Update eloRating for specific subProblems
    memory.subProblems[11].eloRating = 1080;
    memory.subProblems[18].eloRating = 1070;

    // Reorder sub problems by eloRating
    memory.subProblems.sort((a, b) => {
      return b.eloRating! - a.eloRating!;
    });

    // Save the updated memory back to Redis
    await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
  } else {
    console.log('No project id provided - modify sub problem elo scores');
  }
};

loadProject().catch(console.error);
```

Please note that the actual class name `RedisProjectMemoryManager` is inferred as it is not explicitly defined in the provided code snippet. The example assumes that the environment variable `REDIS_MEMORY_URL` is set, otherwise it defaults to connecting to Redis at 'redis://localhost:6379'. The `projectId` should be replaced with the actual project ID when using this code.