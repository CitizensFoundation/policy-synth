import ioredis from 'ioredis';
const redis = new ioredis(process.env.REDIS_AGENT_URL || 'redis://localhost:6379');
// Get project id from params
const projectId = process.argv[2];
const loadProject = async () => {
    if (projectId) {
        const output = await redis.get(`st_mem:${projectId}:id`);
        const memory = JSON.parse(output);
        memory.subProblems[4].imageUrl = undefined;
        await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
        process.exit(0);
    }
    else {
        console.log('No project id provided - delete sub problem image');
        process.exit(1);
    }
};
loadProject().catch(console.error);
//# sourceMappingURL=deleteSubProblemImages.js.map