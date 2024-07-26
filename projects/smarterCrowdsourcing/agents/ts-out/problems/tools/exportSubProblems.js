import ioredis from "ioredis";
import fs from "fs/promises";
const redis = new ioredis(process.env.REDIS_AGENT_URL || "redis://localhost:6379");
const main = async () => {
    const projectId = process.argv[2];
    const outFilePath = process.argv[3];
    if (projectId) {
        const redisKey = `st_mem:${projectId}:id`;
        const currentProject = JSON.parse((await redis.get(redisKey)) || "");
        let outCsvFile = `Title,Description,"Why important","Elo Rating","Search type","Published","URL"`;
        // trim this.memory.subProblems with newLength
        currentProject.subProblems.forEach((subProblem) => {
            outCsvFile += `\n"${subProblem.title}","${subProblem.description}","${subProblem.whyIsSubProblemImportant}","${subProblem.eloRating}","${subProblem.fromSearchType ? subProblem.fromSearchType : "gpt-4"}","${subProblem.yearPublished ? subProblem.yearPublished : "n/a"}","${subProblem.fromUrl}"`;
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
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=exportSubProblems.js.map