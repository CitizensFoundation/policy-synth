import { Queue } from "bullmq";
import ioredis from "ioredis";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const deleteALl = false;
const setNewStage = true;
const addJob = false;
const myQueue = new Queue("agent-innovation");
if (deleteALl) {
    await myQueue.drain();
    await myQueue.clean(0, 10000, "active");
    await myQueue.clean(0, 10000, "failed");
    await myQueue.clean(0, 10000, "completed");
    await myQueue.clean(0, 10000, "wait");
    await myQueue.clean(0, 10000, "delayed");
    await myQueue.obliterate();
    //await redis.del("st_mem:1:id");
}
if (setNewStage) {
    const output = await redis.get("st_mem:1:id");
    const memory = JSON.parse(output);
    //memory.currentStage = "create-sub-problems";
    //memory.currentStage = "rank-sub-problems";
    //memory.currentStage = "create-entities";
    //memory.currentStage = "rank-entities";
    //memory.currentStage = "create-search-queries";
    //memory.currentStage = "rank-search-queries";
    //memory.currentStage = "web-search";
    //memory.currentStage = "rank-search-results";
    //memory.currentStage = "web-get-pages";
    //memory.currentStage = "create-seed-solutions";
    //memory.currentStage = "create-pros-cons";
    //memory.currentStage = "rank-pros-cons";
    //memory.currentStage = "rank-solutions";
    //Repeat for each GA generation
    //memory.currentStage = "evolve-create-population";
    //memory.currentStage = "create-pros-cons";
    memory.currentStage = "rank-pros-cons";
    //memory.currentStage = "rank-solutions";
    await redis.set("st_mem:1:id", JSON.stringify(memory));
}
if (addJob || setNewStage) {
    console.log("Adding job to queue");
    await myQueue.add("agent-innovation", {
        groupId: 1,
        communityId: 1,
        domainId: 1,
        initialProblemStatement: "Liberal democracies are grappling with an overarching issue of declining effectiveness and stability, which is leading to widespread citizen dissatisfaction and threatening the fundamental principles of democratic governance.",
    }, { removeOnComplete: true, removeOnFail: true });
    console.log("After adding job to queue");
}
process.exit(0);
