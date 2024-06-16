import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BasePairwiseRankingsProcessor } from "../basePairwiseRanking.js";
import { PsConstants } from "../constants.js";
export class SearchQueriesRanker extends BasePairwiseRankingsProcessor {
    searchQuestion;
    constructor(memory, progressFunction = undefined) {
        super(undefined, memory);
        this.progressFunction = progressFunction;
    }
    async voteOnPromptPair(index, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[index][itemOneIndex];
        const itemTwo = this.allItems[index][itemTwoIndex];
        const messages = [
            new SystemMessage(`
        You are an AI expert trained to rank search queries based on their relevance to the user research question.

        Instructions:
        1. You will see a research question.
        2. You will also see two web search queries, each marked as "Search Query One" and "Search Query Two".
        3. Your task is to analyze, compare, and rank these search queries based on their relevance to the research question.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `),
            new HumanMessage(`
        Research question: ${this.searchQuestion}

        Search Queries to Rank:

        Search Query One:
        ${itemOne}

        Search Query Two:
        ${itemTwo}

        The Most Relevant Search Query Is:
       `),
        ];
        return await this.getResultsFromLLM(index, "rank-search-queries", PsConstants.searchQueryRankingsModel, messages, itemOneIndex, itemTwoIndex);
    }
    async rankSearchQueries(queriesToRank, searchQuestion, maxPrompts = 120) {
        this.searchQuestion = searchQuestion;
        this.chat = new ChatOpenAI({
            temperature: PsConstants.searchQueryRankingsModel.temperature,
            maxTokens: PsConstants.searchQueryRankingsModel.maxOutputTokens,
            modelName: PsConstants.searchQueryRankingsModel.name,
            verbose: PsConstants.searchQueryRankingsModel.verbose,
        });
        this.setupRankingPrompts(-1, queriesToRank, maxPrompts, this.progressFunction);
        await this.performPairwiseRanking(-1);
        return this.getOrderedListOfItems(-1);
    }
}
//# sourceMappingURL=searchQueriesRanker.js.map