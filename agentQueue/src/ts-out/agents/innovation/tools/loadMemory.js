import ioredis from 'ioredis';
import fs from 'fs/promises';
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || 'redis://localhost:6379');
const loadMemory = async () => {
    // Load memory data from local file
    const fileData = await fs.readFile('currentMemory.json', 'utf-8');
    const memoryData = JSON.parse(fileData);
    // Set data back to Redis
    await redis.set('st_mem:1:id', JSON.stringify(memoryData));
    console.log('Memory data has been loaded from currentMemory.json');
    process.exit(0);
};
loadMemory().catch(console.error);
