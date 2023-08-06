import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import { WebPageVectorStore } from "../vectorstore/webPage.js";
export class RankWebSolutionsProcessor extends BaseProcessor {
    webPageVectorStore = new WebPageVectorStore();
    async renderProblemPrompt(solutionsToRank, subProblemIndex, entityIndex) {
        return [
            new SystemChatMessage(`
        1. You are an expert in ranking solution components for problems and entities.
        2. Rank the solution components according to how important and practical they are in regards to the problem
        3. If affected entities are presented also think about them in your ranking.
        4. If there are very similar solution components, then rank the less important one at the bottom of the list.
        5. The top solution components should be unique.
        6. Never change any text, just rank them in order of importance.
        7. Always output the ranked solution components in a JSON string Array: [ solution ]
        8. Think step by step.`),
            new HumanChatMessage(`
        ${subProblemIndex === undefined ? this.renderProblemStatement() : ""}

        ${subProblemIndex !== undefined
                ? this.renderSubProblem(subProblemIndex, true)
                : ""}

        ${entityIndex !== undefined && subProblemIndex !== undefined
                ? this.renderEntity(subProblemIndex, entityIndex)
                : ""}

        Solution components to rank:
        ${JSON.stringify(solutionsToRank, null, 2)}

        Your ranked solution components as a JSON string array:
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
                //TODO: Remove this check after the null index is merged into the WebPage schema
                if (!entityIndex && webPage.entityIndex) {
                    this.logger.debug(`Skipping web page ${id} as it is an entity page`);
                }
                else if (!entityIndex && !subProblemIndex && (webPage.entities || webPage.subProblemIndex)) {
                    this.logger.debug(`Skipping web page ${id} as it is an entity page or sub problem page`);
                }
                else {
                    this.logger.debug(`${id} - Solutions before ranking: ${JSON.stringify(webPage.solutionsIdentifiedInTextContext, null, 2)}`);
                    const rankedSolutions = await this.callLLM("rank-web-solutions", IEngineConstants.rankWebSolutionsModel, await this.renderProblemPrompt(webPage.solutionsIdentifiedInTextContext, subProblemIndex, entityIndex));
                    this.logger.debug(`${id} - Solutions after ranking: ${JSON.stringify(rankedSolutions, null, 2)}`);
                    await this.webPageVectorStore.updateWebSolutions(id, rankedSolutions);
                    this.logger.debug(`${id} - Updated`);
                    if (true) {
                        const testWebPageBack = await this.webPageVectorStore.getWebPage(id);
                        if (testWebPageBack) {
                            this.logger.debug(`${id} - Solutions Test Get ${JSON.stringify(testWebPageBack.solutionsIdentifiedInTextContext, null, 2)}`);
                        }
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
        await this.rankWebSolutions(undefined, undefined);
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            this.logger.info(`Ranking sub problem ${subProblemIndex + 1}`);
            await this.rankWebSolutions(subProblemIndex, undefined);
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
