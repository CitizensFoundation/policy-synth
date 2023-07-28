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
    //memory.currentStage = "create-sub-problem-images";
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
    //memory.currentStage = "create-solution-images";
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
        customInstructions: {
            rankSolutions: `
          1. Assess the solutions based on their practicality and feasibility in the real world.
          2. Prefer solutions that are simple and focused, avoiding overly comprehensive frameworks.
          3. Take into account whether a solution seems compelling enough to convince politicians and governments to implement it
        `,
            createSolutions: `
          1. Make sure solution titles are descriptive, engaging, and informative.
          2. Keep solutions titles to a maximum of 9 words. Do not use abbreviations except for acronyms. Be specific in your word choice to better represent the solution.
          3. Ensure solutions are straightforward, easy to understand, and their titles reflect the main components or methods of the solution.
          4. Avoid comprehensive frameworks for solutions. Opt for simpler structures that include a few key attributes.
          5. Do not generate bland general titles for solutions. Make sure the titles are specific and unique.
          6. Remember that the main facilitator for implementation will be civil society working with governments.
          7. Frame solutions with the intention of convincing politicians and governments to put them into action. The titles should indicate the benefits or results of implementing the solution, making it more appealing for the target audience.
          8. If the solution involves a unique or innovative approach, make sure to highlight that in the title. This will make the solution stand out and grab attention.
          `,
        },
    }, { removeOnComplete: true, removeOnFail: true });
    console.log("After adding job to queue");
}
process.exit(0);
