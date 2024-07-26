import ioredis from 'ioredis';
const redis = new ioredis(process.env.REDIS_AGENT_URL || 'redis://localhost:6379');
// Get project id from params
const projectId = process.argv[2];
const subProblemIndex = 0;
const generationIndex = 22;
const title = "Enhancing Public Faith Through Accountability and Transparency in Government";
const loadProject = async () => {
    if (projectId) {
        const output = await redis.get(`st_mem:${projectId}:id`);
        const memory = JSON.parse(output);
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
    }
    else {
        console.log('No project id provided - delete solution image');
        process.exit(1);
    }
};
loadProject().catch(console.error);
//# sourceMappingURL=deleteSolutionImage.js.map