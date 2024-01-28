# deleteSolutionImage

This script is designed to delete the image URL and image prompt from a specific solution within a project's memory in Redis. It identifies the solution by its title within a specified generation of solutions for a sub-problem.

## Methods

| Name          | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| loadProject   |            | Promise<void> | Deletes the image URL and image prompt for a specific solution. |

## Example

```typescript
import ioredis from 'ioredis';
import fs from 'fs/promises';

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || 'redis://localhost:6379'
);

// Example usage of deleteSolutionImage
const projectId = 'your_project_id_here';
const subProblemIndex = 0;
const generationIndex = 22;
const title = "Enhancing Public Faith Through Accountability and Transparency in Government";

const loadProject = async (): Promise<void> => {
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as PsBaseMemoryData;

    for (let i = 0; i < memory.subProblems[subProblemIndex].solutions.populations[generationIndex].length; i++) {
      if (memory.subProblems[subProblemIndex].solutions.populations[generationIndex][i].title === title) {
        memory.subProblems[subProblemIndex].solutions.populations[generationIndex][i].imageUrl = "";
        memory.subProblems[subProblemIndex].solutions.populations[generationIndex][i].imagePrompt = "";
        console.log(`Solution image url has been deleted for ${title}`);
        break;
      }
    }
    await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
    process.exit(0);
  } else {
    console.log('No project id provided - delete solution image');
    process.exit(1);
  }
};

loadProject().catch(console.error);
```

**Note:** Replace `'your_project_id_here'` with the actual project ID you wish to modify. This script requires the `ioredis` package for Redis operations and uses async/await for asynchronous execution. Ensure that the Redis server is running and accessible at the specified URL.