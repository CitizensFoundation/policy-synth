# saveProject

This script is designed to retrieve project data from a Redis database and save it to a local file. It uses the `ioredis` package to connect to Redis and the `fs/promises` module to handle file operations asynchronously.

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| saveProject |  | Promise<void> | Retrieves project data from Redis and saves it to a local file. If no project ID is provided, it logs an error and exits. |

## Example

```
// Example usage of saveProject
import 'dotenv/config';
import ioredis from 'ioredis';
import fs from 'fs/promises';

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || 'redis://localhost:6379'
);

const projectId = process.argv[2];

const saveProject = async (): Promise<void> => {
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!);

    console.log('output', JSON.stringify(memory, null, 2));

    const fileName = `currentProject${projectId}.json`;
    await fs.writeFile(fileName, JSON.stringify(memory, null, 2));
    console.log(`Project data has been saved to ${fileName}`);
    process.exit(0);
  } else {
    console.log('No project id provided - save project');
    process.exit(1);
  }
};

saveProject().catch(console.error);
```