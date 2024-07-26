import ioredis from 'ioredis';
import fs from 'fs/promises';

const redis = new ioredis(
  process.env.REDIS_AGENT_URL || 'redis://localhost:6379'
);

// Get project id from params
const projectId = process.argv[2];

const loadProject = async (): Promise<void> => {
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as PsSmarterCrowdsourcingMemoryData;

    memory.subProblems[11].eloRating = 1080;
    memory.subProblems[18].eloRating = 1070;

    // Reorder sub problems by eloRating
    memory.subProblems.sort((a, b) => {
      return b.eloRating! - a.eloRating!;
    });

    await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
    process.exit(0);
  } else {
    console.log('No project id provided - modify sub problem elo scores');
    process.exit(1);
  }
};

loadProject().catch(console.error);
