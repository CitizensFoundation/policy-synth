import ioredis from 'ioredis';
import fs from 'fs/promises';

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || 'redis://localhost:6379'
);

// Get project id from params
const projectId = process.argv[2];


const loadProject = async (): Promise<void> => {
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as IEngineInnovationMemoryData;
    memory.subProblems[5].title = "Election-related Violence";
    memory.subProblems[5].description = "Election-related violence is a strategic tool utilized by authoritarians. Recognizing and understanding this form of electoral manipulation is essential.";
    memory.subProblems[5].whyIsSubProblemImportant = "Gaining insight into the occurrence and implications of election-related violence is vital to ensuring free, fair elections and preserving democratic norms.";

    memory.subProblems[6].title = "Democracy and the Role of Journalism";
    memory.subProblems[6].description = "Analyzing the role of journalism in democratic societies offers valuable insights into its effectiveness and potential for safeguarding democratic values.";
    memory.subProblems[6].whyIsSubProblemImportant = "Journalism plays an integral role in disseminating information and upholding democratic principles, thus comprehending its impact is crucial.";

    await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
    process.exit(0);
  } else {
    console.log('No project id provided');
    process.exit(1);
  }
};

loadProject().catch(console.error);
