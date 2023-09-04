import { BaseProcessor } from "../../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { IEngineConstants } from "../../../constants.js";
import { EvidenceWebPageVectorStore } from "../evidenceWebPage.js";
export class RateWebEvidenceProcessor extends BaseProcessor {
    evidenceWebPageVectorStore = new EvidenceWebPageVectorStore();
    async countAll(policy, subProblemIndex) {
        let offset = 0;
        const limit = 100;
        this.logger.info(`Counting all web evidence for policy ${policy.title}`);
        try {
            for (const evidenceType of IEngineConstants.policyEvidenceFieldTypes) {
                this.logger.info(`Counting all web evidence for type ${evidenceType}`);
                let offset = 0;
                let refinedCount = 0;
                let totalCount = 0;
                let revidenceCount = 0;
                let reommendationCount = 0;
                const searchType = IEngineConstants.simplifyEvidenceType(evidenceType);
                while (true) {
                    const results = await this.evidenceWebPageVectorStore.getWebPagesForProcessing(this.memory.groupId, subProblemIndex, searchType, policy.title, limit, offset);
                    this.logger.debug(`Got ${results.data.Get["EvidenceWebPage"].length} WebPage results from Weaviate`);
                    if (results.data.Get["EvidenceWebPage"].length === 0) {
                        this.logger.info("Exiting");
                        break;
                    }
                    let pageCounter = 0;
                    for (const retrievedObject of results.data.Get["EvidenceWebPage"]) {
                        const webPage = retrievedObject;
                        const id = webPage._additional.id;
                        this.logger.info(`${webPage.searchType} - ${webPage.totalScore} - ${webPage.hasBeenRefined ? "refined" : "original"} - ${webPage.url}`);
                        if (webPage.mostImportantPolicyEvidenceInTextContext) {
                            revidenceCount +=
                                webPage.mostImportantPolicyEvidenceInTextContext.length;
                        }
                        if (webPage.whatPolicyNeedsToImplementInResponseToEvidence) {
                            reommendationCount +=
                                webPage.whatPolicyNeedsToImplementInResponseToEvidence.length;
                        }
                        totalCount++;
                        if (webPage.hasBeenRefined) {
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
        this.logger.info("Set web evidence types Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.rateWebEvidenceModel.temperature,
            maxTokens: IEngineConstants.rateWebEvidenceModel.maxOutputTokens,
            modelName: IEngineConstants.rateWebEvidenceModel.name,
            verbose: IEngineConstants.rateWebEvidenceModel.verbose,
        });
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const skipSubProblemsIndexes = [];
        const currentGeneration = 0;
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            this.logger.info(`Set evidence type for sub problem ${subProblemIndex}`);
            const subProblem = this.memory.subProblems[subProblemIndex];
            if (!skipSubProblemsIndexes.includes(subProblemIndex)) {
                if (subProblem.policies) {
                    const policies = subProblem.policies.populations[currentGeneration];
                    for (let p = 0; p <
                        Math.min(policies.length, IEngineConstants.maxTopPoliciesToProcess); p++) {
                        const policy = policies[p];
                        try {
                            await this.countAll(policy, subProblemIndex);
                            this.logger.debug(`Finished ranking sub problem ${subProblemIndex} for policy ${policy}`);
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
        });
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished rating all web evidence");
    }
}
