import { IEngineConstants } from "../../../../constants.js";
import { BaseProcessor } from "../../baseProcessor.js";
import { WebPageVectorStore } from "../webPage.js";
import ioredis from "ioredis";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
class ShowCounts extends BaseProcessor {
    webPageVectorStore = new WebPageVectorStore();
    async countWebPages(subProblemIndex) {
        let cursor = "";
        let webPageCount = 0;
        let solutionsCount = 0;
        while (true) {
            const results = await this.webPageVectorStore.getWebPagesForProcessing(this.memory.groupId, subProblemIndex, undefined, cursor);
            if (results.data.Get["WebPage"].length === 0)
                break;
            for (const retrievedObject of results.data.Get["WebPage"]) {
                const webPage = retrievedObject;
                const id = webPage._additional.id;
                if (!subProblemIndex && webPage.subProblemIndex) {
                    this.logger.debug(`Skipping web page ${id} as it is an entity page or sub problem page`);
                }
                else {
                    webPageCount++;
                    solutionsCount += webPage.solutionsIdentifiedInTextContext.length;
                }
            }
            cursor = results.data.Get["WebPage"].at(-1)["_additional"]["id"];
        }
        return { webPageCount, solutionsCount };
    }
    async process() {
        this.logger.info("Show counts Processor");
        super.process();
        let totalWebPages = 0;
        let totalSolutions = 0;
        const counts = await this.countWebPages(undefined);
        totalSolutions += counts.solutionsCount;
        totalWebPages += counts.webPageCount;
        this.logger.debug("+++++++++++++++++++++++++++++++++++++");
        this.logger.debug(`Problem Statement Web Page Count: ${counts.webPageCount}`);
        this.logger.debug(`Problem Statement Solutions Count: ${counts.solutionsCount}`);
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            this.logger.info(`Count sub problem ${subProblemIndex + 1}`);
            const subProblemTitle = this.memory.subProblems[subProblemIndex].title;
            const counts = await this.countWebPages(subProblemIndex);
            totalSolutions += counts.solutionsCount;
            totalWebPages += counts.webPageCount;
            this.logger.debug("--------------------------------------");
            this.logger.debug(`${subProblemTitle} Web Page Count: ${counts.webPageCount}`);
            this.logger.debug(`${subProblemTitle} Solutions Count: ${counts.solutionsCount}`);
        });
        await Promise.all(subProblemsPromises);
        this.logger.debug("============================");
        this.logger.debug(`Total Web Page Count: ${totalWebPages}`);
        this.logger.debug(`Total Solutions Count: ${totalSolutions}`);
        this.logger.info("Finished counting all solutions");
    }
}
async function run() {
    const projectId = process.argv[2];
    if (projectId) {
        const output = await redis.get(`st_mem:${projectId}:id`);
        const memory = JSON.parse(output);
        const counts = new ShowCounts({}, memory);
        await counts.process();
        process.exit(0);
    }
    else {
        console.log("No project id provided");
        process.exit(1);
    }
}
run();
