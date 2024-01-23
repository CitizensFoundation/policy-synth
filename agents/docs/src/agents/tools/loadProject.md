# RedisProjectLoader

This class is responsible for loading project data from a local file into Redis.

## Properties

No properties are documented for this script.

## Methods

| Name         | Parameters        | Return Type | Description                                      |
|--------------|-------------------|-------------|--------------------------------------------------|
| loadProject  |                   | Promise<void> | Loads project data from a file into Redis. |

## Examples

```typescript
// This script is meant to be run from the command line with a project ID argument.
// Example usage:
// node script.js projectId123

import ioredis from 'ioredis';
import fs from 'fs/promises';

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || 'redis://localhost:6379'
);

// Get project id from params
const projectId = process.argv[2];

const loadProject = async (): Promise<void> => {
  if (projectId) {
    const fileName = `currentProject${projectId}.json`;
    // Load memory data from local file
    const fileData = await fs.readFile(fileName, 'utf-8');
    const memoryData = JSON.parse(fileData);

    // Set data back to Redis
    await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memoryData));
    console.log(`Project data has been loaded from ${fileName}`);
    process.exit(0);
  } else {
    console.log('No project id provided - load project');
    process.exit(1);
  }
};

loadProject().catch(console.error);
```

Please note that the script does not define a class explicitly but is structured as a standalone script meant to be executed with Node.js. The `loadProject` function is the main method of this script.