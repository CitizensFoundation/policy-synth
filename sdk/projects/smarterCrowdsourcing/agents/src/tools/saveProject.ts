import ioredis from 'ioredis';
import fs from 'fs/promises';

const redis = new ioredis(
  process.env.REDIS_AGENT_URL || 'redis://localhost:6379'
);


// Get project id from params
const projectId = process.argv[2];

const saveProject = async (): Promise<void> => {
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!);

    console.log('output', JSON.stringify(memory, null, 2));

    // Save memory data to local file
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
