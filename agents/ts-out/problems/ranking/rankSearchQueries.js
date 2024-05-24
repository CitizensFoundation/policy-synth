import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { IEngineConstants } from "../../constants.js";
import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export class RankSearchQueriesProcessor extends BasePairwiseRankingsProcessor {
    renderProblemDetail(additionalData) {
        let detail = ``;
        if (additionalData.searchQueryTarget === "problemStatement") {
            detail = `
        ${this.renderProblemStatement()}
      `;
        }
        else if (additionalData.searchQueryTarget === "subProblem") {
            detail = `
        ${this.renderSubProblem(additionalData.subProblemIndex)}
      `;
        }
        else if (additionalData.searchQueryTarget === "entity") {
            detail = `
        ${this.renderSubProblem(additionalData.subProblemIndex)}

        Entity:
        ${additionalData.currentEntity.name}
        ${this.renderEntityPosNegReasons(additionalData.currentEntity)}
      `;
        }
        return detail;
    }
    async voteOnPromptPair(index, promptPair, additionalData) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[index][itemOneIndex];
        const itemTwo = this.allItems[index][itemTwoIndex];
        const messages = [
            new SystemMessage(`
        You are an AI expert trained to rank search queries based on their relevance to complex problem statements, sub-problems and affected entities.

        Instructions:
        1. You will receive a problem statement or a sub-problem, possibly along with entities and their impacts (both negative and positive).
        2. You will also see two web search queries, each marked as "Search Query One" and "Search Query Two".
        3. Your task is to analyze, compare, and rank these search queries based on their relevance to the given problem and affected entities.
        4. If the problem statement refers to specific places or countries, it is not necessarily better to always include the name in the search query.
        5. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        6. Let's think step by step.
        `),
            new HumanMessage(`
        ${this.renderProblemDetail(additionalData)}

        Search Queries to Rank:

        Search Query One:
        ${itemOne}

        Search Query Two:
        ${itemTwo}

        The Most Relevant Search Query Is:
       `),
        ];
        return await this.getResultsFromLLM(index, "rank-search-queries", IEngineConstants.searchQueryRankingsModel, messages, itemOneIndex, itemTwoIndex);
    }
    async processSubProblems() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            await this.processEntities(subProblemIndex);
            for (const searchQueryType of [
                "general",
                "scientific",
                "openData",
                "news",
            ]) {
                this.logger.info(`Ranking search queries for sub-problem ${subProblemIndex} ${searchQueryType}`);
                let queriesToRank = this.memory.subProblems[subProblemIndex].searchQueries[searchQueryType];
                const index = this.getQueryIndex(searchQueryType) * (subProblemIndex + 30);
                this.setupRankingPrompts(index, queriesToRank);
                await this.performPairwiseRanking(index, {
                    subProblemIndex,
                    searchQueryType,
                    searchQueryTarget: "subProblem",
                });
                this.memory.subProblems[subProblemIndex].searchQueries[searchQueryType] = this.getOrderedListOfItems(index);
            }
            await this.saveMemory();
        });
        await Promise.all(subProblemsPromises);
        this.logger.debug("Sub Problems Ranked");
    }
    getQueryIndex(searchQueryType) {
        if (searchQueryType === "general") {
            return 2;
        }
        else if (searchQueryType === "scientific") {
            return 3;
        }
        else if (searchQueryType === "openData") {
            return 4;
        }
        else if (searchQueryType === "news") {
            return 5;
        }
        else {
            return 6;
        }
    }
    async processEntities(subProblemIndex) {
        for (let e = 0; e <
            Math.min(this.memory.subProblems[subProblemIndex].entities.length, IEngineConstants.maxTopEntitiesToSearch); e++) {
            for (const searchQueryType of [
                "general",
                "scientific",
                "openData",
                "news",
            ]) {
                this.logger.info(`Ranking search queries for sub problem ${subProblemIndex} entity ${e} ${searchQueryType}`);
                const currentEntity = this.memory.subProblems[subProblemIndex].entities[e];
                let queriesToRank = currentEntity.searchQueries[searchQueryType];
                const index = this.getQueryIndex(searchQueryType) * (subProblemIndex + 30) * (e + 1);
                this.setupRankingPrompts(index, queriesToRank);
                await this.performPairwiseRanking(index, {
                    subProblemIndex,
                    currentEntity,
                    searchQueryType,
                    searchQueryTarget: "entity",
                });
                this.logger.debug("Entity Queries ranked");
                this.memory.subProblems[subProblemIndex].entities[e].searchQueries[searchQueryType] = this.getOrderedListOfItems(index);
            }
        }
    }
    async process() {
        this.logger.info("Rank Search Queries Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.searchQueryRankingsModel.temperature,
            maxTokens: IEngineConstants.searchQueryRankingsModel.maxOutputTokens,
            modelName: IEngineConstants.searchQueryRankingsModel.name,
            verbose: IEngineConstants.searchQueryRankingsModel.verbose,
        });
        this.logger.info("Rank Search Queries Processor: Sub Problems");
        await this.processSubProblems();
        this.logger.info("Rank Search Queries Processor: Problem Statement");
        for (const searchQueryType of [
            "general",
            "scientific",
            "openData",
            "news",
        ]) {
            let queriesToRank = this.memory.problemStatement.searchQueries[searchQueryType];
            this.setupRankingPrompts(-1, queriesToRank);
            await this.performPairwiseRanking(-1, {
                searchQueryType,
                searchQueryTarget: "problemStatement",
            });
            this.memory.problemStatement.searchQueries[searchQueryType] =
                this.getOrderedListOfItems(-1);
            this.logger.debug("Search Queries Ranked");
            this.logger.debug(this.memory.problemStatement.searchQueries[searchQueryType]);
            await this.saveMemory();
        }
        await this.saveMemory();
        this.logger.info("Rank Search Queries Processor: Done");
    }
}
//# sourceMappingURL=rankSearchQueries.js.map