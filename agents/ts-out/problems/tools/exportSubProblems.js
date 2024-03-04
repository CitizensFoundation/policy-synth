import ioredis from "ioredis";
import fs from "fs/promises";
const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const main = async () => {
    const projectId = process.argv[2];
    const outFilePath = process.argv[3];
    if (projectId) {
        const redisKey = `st_mem:${projectId}:id`;
        const currentProject = JSON.parse(await redis.get(redisKey) || "");
        let outCsvFile = `Description,Title,"Why important","Elo Rating","Search type"`;
        // trim this.memory.subProblems with newLength
        currentProject.subProblems.forEach((subProblem) => {
            outCsvFile += `\n"${subProblem.description}","${subProblem.title}","${subProblem.whyIsSubProblemImportant}","${subProblem.eloRating}","${subProblem.fromSearchType}"`;
        });
        await fs.writeFile(outFilePath, outCsvFile);
        console.log("Sub problems exported successfully");
        process.exit(0);
    }
    else {
        console.error("Project id is required");
        process.exit(1);
    }
};
main().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=exportSubProblems.js.map