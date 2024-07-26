import { BaseSmarterCrowdsourcingAgent } from "../../base/scBaseAgent.js";
import ioredis from "ioredis";
import { EvidenceWebPageVectorStore } from "../../vectorstore/evidenceWebPage.js";
const redis = new ioredis(process.env.REDIS_AGENT_URL || "redis://localhost:6379");
export class CountWebEvidenceAgent extends BaseSmarterCrowdsourcingAgent {
    evidenceWebPageVectorStore = new EvidenceWebPageVectorStore();
    async countAll(policy, subProblemIndex) {
        let offset = 0;
        const limit = 100;
        const logDetail = false;
        this.logger.info(`Counting all web evidence for policy ${policy.title}`);
        try {
            for (const evidenceType of this.policyEvidenceFieldTypes) {
                //this.logger.info(`Counting all web evidence for type ${evidenceType}`);
                let offset = 0;
                let refinedCount = 0;
                let totalCount = 0;
                let revidenceCount = 0;
                let reommendationCount = 0;
                const searchType = this.simplifyEvidenceType(evidenceType);
                while (true) {
                    const results = await this.evidenceWebPageVectorStore.getTopWebPagesForProcessing(this.memory.groupId, subProblemIndex, searchType, policy.title, limit, offset);
                    /*this.logger.debug(
                      `Got ${results.data.Get["EvidenceWebPage"].length} WebPage results from Weaviate`
                    );*/
                    if (results.data.Get["EvidenceWebPage"].length === 0) {
                        //this.logger.info("Exiting");
                        break;
                    }
                    let pageCounter = 0;
                    for (const retrievedObject of results.data.Get["EvidenceWebPage"]) {
                        const webPage = retrievedObject;
                        const id = webPage._additional.id;
                        if (logDetail)
                            this.logger.info(`${webPage.searchType} - ${webPage.totalScore} - ${webPage.relevanceScore} - ${webPage.mostImportantPolicyEvidenceInTextContext
                                ? "refined"
                                : "original"} -  ${webPage.url}`);
                        if (webPage.mostImportantPolicyEvidenceInTextContext) {
                            revidenceCount +=
                                webPage.mostImportantPolicyEvidenceInTextContext.length;
                        }
                        if (webPage.whatPolicyNeedsToImplementInResponseToEvidence) {
                            reommendationCount +=
                                webPage.whatPolicyNeedsToImplementInResponseToEvidence.length;
                        }
                        totalCount++;
                        if (webPage.mostImportantPolicyEvidenceInTextContext) {
                            refinedCount++;
                        }
                    }
                    this.logger.info(`${searchType} Total: ${totalCount} - Refined: ${refinedCount} - Evidence: ${revidenceCount} - Recommendation: ${reommendationCount}`);
                    offset += limit;
                }
            }
        }
        catch (error) {
            this.logger.error(error.stack || error);
            throw error;
        }
    }
    async process() {
        this.logger.info("Count evidence Agent");
        super.process();
        const subProblemsLimit = Math.min(this.memory.subProblems.length, this.maxSubProblems);
        const skipSubProblemsIndexes = [];
        const currentGeneration = 0;
        for (let subProblemIndex = 0; subProblemIndex < subProblemsLimit; subProblemIndex++) {
            this.logger.info(`Count evidence for sub problem ${subProblemIndex}`);
            const subProblem = this.memory.subProblems[subProblemIndex];
            if (!skipSubProblemsIndexes.includes(subProblemIndex)) {
                if (subProblem.policies) {
                    const policies = subProblem.policies.populations[currentGeneration];
                    for (let p = 0; p < Math.min(policies.length, this.maxTopPoliciesToProcess); p++) {
                        const policy = policies[p];
                        try {
                            await this.countAll(policy, subProblemIndex);
                            this.logger.debug(`Finished counting sub problem ${subProblemIndex} for policy ${policy.title}\n\n`);
                        }
                        catch (error) {
                            this.logger.error(error.stack || error);
                            throw error;
                        }
                    }
                }
            }
            else {
                this.logger.info(`Skipping sub problem ${subProblemIndex}`);
            }
        }
        this.logger.info("Finished rating all web evidence");
    }
}
async function run() {
    const projectId = process.argv[2];
    if (projectId) {
        const output = await redis.get(`st_mem:${projectId}:id`);
        const memory = JSON.parse(output);
        const counts = new CountWebEvidenceAgent({}, memory, 0, 0);
        await counts.process();
        process.exit(0);
    }
    else {
        console.log("No project id provided - count evidence");
        process.exit(1);
    }
}
run();
//# sourceMappingURL=countEvidence.js.map