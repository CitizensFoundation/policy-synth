import ioredis from 'ioredis';
import fs from 'fs/promises';

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || 'redis://localhost:6379'
);

const saveMemory = async (): Promise<void> => {
  const output = await redis.get('st_mem:1:id');
  const memory = JSON.parse(output!);

  console.log('output', JSON.stringify(memory, null, 2));

  // Save memory data to local file
  await fs.writeFile('currentMemory.json', JSON.stringify(memory, null, 2));
  console.log('Memory data has been saved to currentMemory.json');
  process.exit(0);
};

saveMemory().catch(console.error);
