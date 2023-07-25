import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import { BasePairwiseRankingsProcessor } from "./basePairwiseRanking.js";
export class RankSearchQueriesProcessor extends BasePairwiseRankingsProcessor {
    subProblemIndex = 0;
    entitiesIndex = 0;
    currentEntity;
    searchQueryType;
    searchQueryTarget;
    renderProblemDetail() {
        let detail = ``;
        if (this.searchQueryTarget === "problemStatement") {
            detail = `
        ${this.renderProblemStatement()}
      `;
        }
        else if (this.searchQueryTarget === "subProblem") {
            detail = `
        ${this.renderSubProblem(this.subProblemIndex)}
      `;
        }
        else if (this.searchQueryTarget === "entity") {
            detail = `
        ${this.renderSubProblem(this.subProblemIndex)}

        Entity:
        ${this.currentEntity.name}
        ${this.renderEntityPosNegReasons(this.currentEntity)}
      `;
        }
        return detail;
    }
    async voteOnPromptPair(subProblemIndex, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[subProblemIndex][itemOneIndex];
        const itemTwo = this.allItems[subProblemIndex][itemTwoIndex];
        const messages = [
            new SystemChatMessage(`
        You are an AI expert trained to rank search queries based on their relevance to complex problem statements, sub-problems and affected entities.

        Please follow these guidelines:
        1. You will receive a problem statement or a sub-problem, possibly along with entities and their impacts (both negative and positive).
        2. You will also see two web search queries, each marked as "Search Query One" and "Search Query Two".
        3. Your task is to analyze, compare, and rank these search queries based on their relevance to the given problem and affected entities.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Ensure a systematic and methodical approach to this task. Think step by step.`),
            new HumanChatMessage(`
        Search query type: ${this.searchQueryType}

        ${this.renderProblemDetail()}

        Search Queries to Rank:

        Search Query One:
        ${itemOne}

        Search Query Two:
        ${itemTwo}

        The Most Relevant Search Query Is:
       `),
        ];
        return await this.getResultsFromLLM(subProblemIndex, "rank-search-queries", IEngineConstants.searchQueryRankingsModel, messages, itemOneIndex, itemTwoIndex);
    }
    async processSubProblems() {
        for (let s = 0; s <
            Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems); s++) {
            this.subProblemIndex = s;
            await this.processEntities(s);
            for (const searchQueryType of [
                "general",
                "scientific",
                "openData",
                "news",
            ]) {
                this.searchQueryType = searchQueryType;
                this.logger.info(`Ranking search queries for sub-problem ${s} ${searchQueryType}`);
                let queriesToRank = this.memory.subProblems[s].searchQueries[searchQueryType];
                this.searchQueryTarget = "subProblem";
                this.setupRankingPrompts(s, queriesToRank);
                await this.performPairwiseRanking(s);
                this.memory.subProblems[s].searchQueries[searchQueryType] =
                    this.getOrderedListOfItems(s);
            }
            await this.saveMemory();
        }
    }
    async processEntities(subProblemIndex) {
        this.searchQueryTarget = "entity";
        for (let e = 0; e <
            Math.min(this.memory.subProblems[subProblemIndex].entities.length, IEngineConstants.maxTopEntitiesToSearch); e++) {
            for (const searchQueryType of [
                "general",
                "scientific",
                "openData",
                "news",
            ]) {
                this.searchQueryType = searchQueryType;
                this.logger.info(`Ranking search queries for sub problem ${subProblemIndex} entity ${e} ${searchQueryType}`);
                this.currentEntity =
                    this.memory.subProblems[subProblemIndex].entities[e];
                let queriesToRank = this.currentEntity.searchQueries[searchQueryType];
                this.setupRankingPrompts(subProblemIndex * e, queriesToRank);
                await this.performPairwiseRanking(subProblemIndex * e);
                this.logger.debug("Entity Queries ranked");
                this.memory.subProblems[subProblemIndex].entities[e].searchQueries[searchQueryType] = this.getOrderedListOfItems(subProblemIndex * e);
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
        this.logger.info("Rank Search Queries Processor: Problem Statement");
        this.logger.info("Rank Search Queries Processor: Sub Problems");
        await this.processSubProblems();
        for (const searchQueryType of [
            "general",
            "scientific",
            "openData",
            "news",
        ]) {
            this.searchQueryType = searchQueryType;
            let queriesToRank = this.memory.problemStatement.searchQueries[searchQueryType];
            this.searchQueryTarget = "problemStatement";
            this.setupRankingPrompts(-1, queriesToRank);
            await this.performPairwiseRanking(-1);
            this.memory.problemStatement.searchQueries[searchQueryType] =
                this.getOrderedListOfItems(-1);
            this.logger.debug("Search Queries Ranked");
            this.logger.debug(this.memory.problemStatement.searchQueries[searchQueryType]);
            await this.saveMemory();
        }
        await this.saveMemory();
    }
}
