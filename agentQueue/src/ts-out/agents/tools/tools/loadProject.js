import ioredis from 'ioredis';
import fs from 'fs/promises';
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || 'redis://localhost:6379');
// Get project id from params
const projectId = process.argv[2];
const loadProject = async () => {
    if (projectId) {
        const fileName = `currentProject${projectId}.json`;
        // Load memory data from local file
        const fileData = await fs.readFile(fileName, 'utf-8');
        const memoryData = JSON.parse(fileData);
        // Set data back to Redis
        await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memoryData));
        console.log(`Project data has been loaded from ${fileName}`);
        process.exit(0);
    }
    else {
        console.log('No project id provided');
        process.exit(1);
    }
};
loadProject().catch(console.error);
