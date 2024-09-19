import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
import { PsConstants } from "@policysynth/agents/constants.js";
export class SearchQueriesRanker extends BasePairwiseRankingsProcessor {
    instructions;
    memory;
    constructor(memory, progressFunction = undefined) {
        super(undefined, memory);
        this.memory = memory;
        this.progressFunction = progressFunction;
    }
    async voteOnPromptPair(index, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[index][itemOneIndex];
        const itemTwo = this.allItems[index][itemTwoIndex];
        const messages = [
            new SystemMessage(`
        You are an AI expert trained to rank search queries based on their relevance to the user instructions.

        Instructions:
        1. You will see instructions from the user.
        2. You will also see two web search queries, each marked as "Search Query One" and "Search Query Two".
        3. Your task is to analyze, compare, and rank these search queries based on their relevance to the user instructions.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `),
            new HumanMessage(`
        User instructions: ${this.instructions}

        Overall task title:
        ${this.memory.taskTitle}

        Overall task description:
        ${this.memory.taskDescription}

        Overall task instructions: ${this.memory.taskInstructions}

        ${this.memory.likelyRelevantNpmPackageDependencies?.length > 0
                ? `Likely relevant npm dependencies:\n${this.memory.likelyRelevantNpmPackageDependencies.join(`\n`)}`
                : ``}

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
    async rankSearchQueries(queriesToRank, instructions, maxPrompts = 120) {
        this.instructions = instructions;
        this.chat = new ChatOpenAI({
            temperature: PsConstants.searchQueryRankingsModel.temperature,
            maxTokens: PsConstants.searchQueryRankingsModel.maxOutputTokens,
            modelName: "gpt-4o",
            verbose: PsConstants.searchQueryRankingsModel.verbose,
        });
        this.setupRankingPrompts(-1, queriesToRank, queriesToRank.length * 7, this.progressFunction);
        await this.performPairwiseRanking(-1);
        return this.getOrderedListOfItems(-1);
    }
}
//# sourceMappingURL=searchQueriesRanker.js.map