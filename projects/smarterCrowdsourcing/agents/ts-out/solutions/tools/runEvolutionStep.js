import { Queue, QueueEvents } from "bullmq";
import ioredis from "ioredis";
const myQueue = new Queue("agent-solutions");
const redis = new ioredis(process.env.REDIS_AGENT_URL || "redis://localhost:6379");
const queueEvents = new QueueEvents("agent-solutions");
const projectId = process.argv[2];
if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const getInnovationData = async () => {
        const output = await redis.get(redisKey);
        const memory = JSON.parse(output);
        return memory;
    };
    const stages = [
        "evolve-create-population",
        "evolve-reap-population",
        "create-pros-cons",
        "rank-pros-cons",
        "rank-solutions",
        "create-solution-images",
        "group-solutions"
    ];
    const runStages = async (startStage = stages[0]) => {
        const startIndex = stages.indexOf(startStage);
        if (startIndex === -1) {
            throw new Error(`Invalid start stage: ${startStage}`);
        }
        for (let i = startIndex; i < stages.length; i++) {
            const stage = stages[i];
            console.log(`Running stage: ${stage}`);
            // Get the current memory
            const memory = await getInnovationData();
            // Update the current stage
            memory.currentStage = stage;
            await redis.set(redisKey, JSON.stringify(memory));
            // Add the job to the queue
            console.log("Adding job to queue");
            const job = await myQueue.add("agent-innovation", { groupId: projectId, communityId: projectId, domainId: 1 }, { removeOnComplete: true, removeOnFail: true });
            try {
                // Wait until the job is finished
                console.log(`Waiting for job ${job.id} to finish...`);
                const result = await job.waitUntilFinished(queueEvents);
                console.log(`Job ${job.id} finished with result: ${result}`);
            }
            catch (error) {
                console.log(`Job ${job.id} failed with error: ${error}`);
                process.exit(1);
            }
        }
    };
    const startStage = process.argv[3] || stages[0];
    runStages(startStage)
        .then(() => {
        console.log("All stages completed successfully.");
        process.exit(0);
    })
        .catch((error) => {
        console.error(`Error running stages: ${error}`);
        process.exit(1);
    });
}
else {
    console.log("Usage: npm runEvolutionStep <projectId>");
    process.exit(0);
}
//# sourceMappingURL=runEvolutionStep.js.map