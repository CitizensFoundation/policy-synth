import ioredis from 'ioredis';
import fs from 'fs/promises';

const redis = new ioredis(
  process.env.REDIS_AGENT_URL || 'redis://localhost:6379'
);

const populationIndex = 18;

const replacePopulation = async (): Promise<void> => {
  console.log('Fetching memory 1 from Redis...');
  const output = await redis.get('st_mem:1:id');
  const memoryToReplaceTo = JSON.parse(output!) as PsSmarterCrowdsourcingMemoryData;
  console.log('Memory fetched successfully.');

  console.log('Reading data from file...');
  const fileData = await fs.readFile('currentMemoryToReplaceFrom.json', 'utf-8');
  const memoryToReplaceFrom = JSON.parse(fileData) as PsSmarterCrowdsourcingMemoryData;
  console.log('File data read successfully.');

  console.log('Replacing population data...');
  for (let i = 0; i < 7; i++) {
    console.log(`Replacing population for subProblem at index ${i}...`);
    memoryToReplaceTo.subProblems[i].solutions.populations[populationIndex] =
      memoryToReplaceFrom.subProblems[i].solutions.populations[populationIndex];
    console.log(`Population for subProblem at index ${i} replaced successfully.`);
  }
  console.log('All populations replaced successfully.');

  console.log('Saving updated memory to Redis...');
  await redis.set('st_mem:1:id', JSON.stringify(memoryToReplaceTo));
  console.log('Memory saved successfully to Redis.');

  process.exit(0);
};

replacePopulation().catch(console.error);