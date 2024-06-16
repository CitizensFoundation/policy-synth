import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import { PsConstants } from "../../constants.js";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
import ioredis from "ioredis";
const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
export class RemoveDuplicateWebSolutions extends BaseProblemSolvingAgent {
    webPageVectorStore = new WebPageVectorStore();
    allUrls = new Set();
    duplicateUrls = [];
    constructor(memory) {
        super(null, memory);
        this.memory = memory;
    }
    async processSubProblems() {
        const promises = [];
        for (let s = 0; s <
            Math.min(this.memory.subProblems.length, PsConstants.maxSubProblems); s++) {
            promises.push((async () => {
                this.copyEntitySolutionsToSubProblem(s);
                await this.saveMemory();
                this.memory.subProblems[s].solutionsFromSearch = await this.dedup(this.memory.subProblems[s].solutionsFromSearch);
                this.logger.info(`Finished and closed page for ${this.memory.subProblems[s].title}`);
            })());
        }
        await Promise.all(promises);
    }
    async copyEntitySolutionsToSubProblem(subProblemIndex) {
        for (let e = 0; e <
            Math.min(this.memory.subProblems[subProblemIndex].entities.length, PsConstants.maxTopEntitiesToSearch); e++) {
            this.memory.subProblems[subProblemIndex].solutionsFromSearch = [
                ...this.memory.subProblems[subProblemIndex].solutionsFromSearch,
                ...this.memory.subProblems[subProblemIndex].entities[e]
                    .solutionsFromSearch,
            ];
        }
    }
    async processProblemStatement() {
        const lengthBefore = this.memory.problemStatement.solutionsFromSearch.length;
        this.logger.info(`Deduping Web Solutions for Problem Statement for length before: ${lengthBefore}`);
        this.memory.problemStatement.solutionsFromSearch = await this.dedup(this.memory.problemStatement.solutionsFromSearch);
        const lengthAfter = this.memory.problemStatement.solutionsFromSearch.length;
        this.logger.info(`Deduping Web Solutions for Problem Statement complete for length after: ${lengthAfter} removed ${lengthBefore - lengthAfter}`);
    }
    async processAll() {
        await this.processSubProblems();
        await this.saveMemory();
        await this.processProblemStatement();
        await this.saveMemory();
    }
    async process() {
        this.logger.info("Dedup Web Solutions Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: 0.0,
            maxTokens: 4096,
            modelName: "gpt-4o",
            verbose: true,
        });
        await this.processAll();
        this.logger.info("Get Web Pages Processor Complete");
    }
}
//# sourceMappingURL=dedupWebSolutions.js.map