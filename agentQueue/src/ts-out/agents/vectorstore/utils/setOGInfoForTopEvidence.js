import { BaseProcessor } from "../../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { IEngineConstants } from "../../../constants.js";
import { EvidenceWebPageVectorStore } from "../evidenceWebPage.js";
export class RateWebEvidenceProcessor extends BaseProcessor {
    evidenceWebPageVectorStore = new EvidenceWebPageVectorStore();
    async setEvidenceType(policy, subProblemIndex) {
        let offset = 0;
        const limit = 100;
        while (true) {
            try {
                const results = await this.evidenceWebPageVectorStore.getWebPagesForProcessing(this.memory.groupId, subProblemIndex, policy.title, limit, offset);
                this.logger.debug(`Got ${results.data.Get["EvidenceWebPage"].length} WebPage results from Weaviate`);
                if (results.data.Get["EvidenceWebPage"].length === 0) {
                    this.logger.info("Exiting");
                    break;
                }
                let pageCounter = 0;
                for (const retrievedObject of results.data.Get["EvidenceWebPage"]) {
                    const webPage = retrievedObject;
                    const id = webPage._additional.id;
                    const evidenceType = EvidenceWebPageVectorStore.getEvidenceType(webPage);
                    await this.evidenceWebPageVectorStore.updateEvidenceType(id, evidenceType, true);
                    this.logger.info(`${subProblemIndex} - (+${offset + pageCounter++}) - ${id} - Updated with evidence type ${evidenceType}`);
                }
                offset += limit;
            }
            catch (error) {
                this.logger.error(error.stack || error);
                throw error;
            }
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
                    for (let p = 0; p < policies.length; p++) {
                        const policy = policies[p];
                        try {
                            await this.setEvidenceType(policy, subProblemIndex);
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
