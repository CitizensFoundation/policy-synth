import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import { WebPageVectorStore } from "../vectorstore/webPage.js";
export class RankWebSolutionsProcessor extends BaseProcessor {
    webPageVectorStore = new WebPageVectorStore();
    async renderProblemPrompt(solutionsToRank, subProblemIndex) {
        return [
            new SystemChatMessage(`
        You are and expert in filtering and ranking solution components.

        1. Remove irrelevant and inactionable solution components.
        2. Eliminate duplicates or near duplicates.
        3. Rank solutions by importance and practicality.
        4. Always output the ranked solutions in a JSON string Array: [ solution ].

        Think step by step.`),
            new HumanChatMessage(`
        ${subProblemIndex === null ? this.renderProblemStatement() : ""}

        ${subProblemIndex !== null
                ? this.renderSubProblem(subProblemIndex, true)
                : ""}

        Solution components to filter and rank:
        ${JSON.stringify(solutionsToRank, null, 2)}

        Your filtered and ranked solution components as a JSON string array:
       `),
        ];
    }
    async rankWebSolutions(subProblemIndex, entityIndex) {
        let cursor = "";
        while (true) {
            const results = await this.webPageVectorStore.getWebPagesForProcessing(this.memory.groupId, subProblemIndex, entityIndex, undefined, cursor);
            if (results.data.Get["WebPage"].length === 0)
                break;
            for (const retrievedObject of results.data.Get["WebPage"]) {
                const webPage = retrievedObject;
                const id = webPage._additional.id;
                this.logger.debug(`${id} - Solutions before ranking: ${JSON.stringify(webPage.solutionsIdentifiedInTextContext, null, 2)}`);
                const rankedSolutions = await this.callLLM("rank-web-solutions", IEngineConstants.rankWebSolutionsModel, await this.renderProblemPrompt(webPage.solutionsIdentifiedInTextContext, subProblemIndex));
                this.logger.debug(`${id} - Solutions after ranking: ${JSON.stringify(rankedSolutions, null, 2)}`);
                //await this.webPageVectorStore.updateWebSolutions(id, rankedSolutions);
                this.logger.debug(`${id} - Updated`);
                if (false) {
                    const testWebPageBack = await this.webPageVectorStore.getWebPage(id);
                    if (testWebPageBack) {
                        this.logger.debug(`${id} - Solutions Test Get ${JSON.stringify(testWebPageBack.solutionsIdentifiedInTextContext, null, 2)}`);
                    }
                }
            }
            cursor = results.data.Get["WebPage"].at(-1)["_additional"]["id"];
        }
    }
    async process() {
        this.logger.info("Rank web solutions Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.rankWebSolutionsModel.temperature,
            maxTokens: IEngineConstants.rankWebSolutionsModel.maxOutputTokens,
            modelName: IEngineConstants.rankWebSolutionsModel.name,
            verbose: IEngineConstants.rankWebSolutionsModel.verbose,
        });
        this.logger.info("Ranking problem statement solutions");
        await this.rankWebSolutions(null, null);
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            this.logger.info(`Ranking sub problem ${subProblemIndex + 1}`);
            await this.rankWebSolutions(subProblemIndex, null);
            for (let e = 0; e <
                Math.min(this.memory.subProblems[subProblemIndex].entities.length, IEngineConstants.maxTopEntitiesToSearch); e++) {
                this.logger.info(`Ranking entity ${e + 1} for sub problem ${subProblemIndex + 1}`);
                await this.rankWebSolutions(subProblemIndex, e);
            }
        });
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished ranking web solutions");
    }
}
