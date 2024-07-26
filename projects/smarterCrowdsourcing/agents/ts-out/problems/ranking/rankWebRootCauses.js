import { ProblemsSmarterCrowdsourcingAgent } from "../../base/scBaseProblemsAgent.js";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
export class RankWebRootCausesAgent extends ProblemsSmarterCrowdsourcingAgent {
    rootCauseWebPageVectorStore = new RootCauseWebPageVectorStore();
    async renderProblemPrompt(rootCausesToRank, rootCauseType) {
        return [
            this.createSystemMessage(`
        You are an expert in filtering and ranking root causes of a particular problem.

        1. Filter out irrelevant root causes and solutions to the problem.
        2. Filter out duplicates or near duplicates.
        3. Rank the root causes array by importance to the problem statement.
        4. Always and only output a JSON String Array and never explain only output JSON.

        Let's think step by step.`),
            this.createHumanMessage(`
        ${this.renderProblemStatement()}

        Root Cause type: ${rootCauseType}

        Root Causes to filter and rank:
        ${JSON.stringify(rootCausesToRank, null, 2)}

        Filtered and ranked root causes as a JSON string array:
       `),
        ];
    }
    //TODO: Convert to go through the searchTypes at top like the countEvidence one
    async rankWebRootCauses() {
        this.logger.info("Ranking all web root causes");
        try {
            for (const rootCauseType of this.rootCauseFieldTypes) {
                let offset = 0;
                const limit = 100;
                const searchType = this.simplifyRootCauseType(rootCauseType);
                while (true) {
                    const results = await this.rootCauseWebPageVectorStore.getWebPagesForProcessing(this.memory.groupId, searchType, limit, offset);
                    this.logger.debug(`Got ${results.data.Get["RootCauseWebPage"].length} WebPage results from Weaviate`);
                    if (results.data.Get["RootCauseWebPage"].length === 0) {
                        this.logger.info("Exiting");
                        break;
                    }
                    let pageCounter = 0;
                    for (const retrievedObject of results.data.Get["RootCauseWebPage"]) {
                        const webPage = retrievedObject;
                        const id = webPage._additional.id;
                        const fieldKey = rootCauseType;
                        if (webPage[fieldKey] &&
                            Array.isArray(webPage[fieldKey]) &&
                            webPage[fieldKey].length > 0) {
                            const rootCausesToRank = webPage[fieldKey];
                            this.logger.debug(`${id} - Root Causes before ranking (${rootCauseType}):\n${JSON.stringify(rootCausesToRank, null, 2)}`);
                            let rankedRootCauses = await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, await this.renderProblemPrompt(rootCausesToRank, fieldKey));
                            await this.rootCauseWebPageVectorStore.updateWebRootCause(id, fieldKey, rankedRootCauses, true);
                            this.logger.debug(`${id} - Root Causes after ranking (${rootCauseType}):\n${JSON.stringify(rankedRootCauses, null, 2)}`);
                        }
                        else {
                        }
                        this.logger.info(`(+${offset + pageCounter++}) - ${id} - Updated`);
                    }
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
        this.logger.info("Rank web root cause Agent");
        super.process();
        try {
            await this.rankWebRootCauses();
            this.logger.debug(`Finished ranking root causes`);
        }
        catch (error) {
            this.logger.error(error.stack || error);
            throw error;
        }
        this.logger.info("Finished ranking all web root causes");
    }
}
//# sourceMappingURL=rankWebRootCauses.js.map