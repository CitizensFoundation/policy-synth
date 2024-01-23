import {
  BasePairwiseRankingsProcessor,
  IEngineConstants,
} from "@policysynth/agents";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";

export class SearchQueriesRanker extends BasePairwiseRankingsProcessor {
  searchQuestion: string | undefined;

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<IEnginePairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as string;
    const itemTwo = this.allItems![index]![itemTwoIndex] as string;

    const messages = [
      new SystemMessage(
        `
        You are an AI expert trained to rank search queries based on their relevance to complex problem statements, sub-problems and affected entities.

        Instructions:
        1. You will receive a problem statement or a sub-problem, possibly along with entities and their impacts (both negative and positive).
        2. You will also see two web search queries, each marked as "Search Query One" and "Search Query Two".
        3. Your task is to analyze, compare, and rank these search queries based on their relevance to the given problem and affected entities.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `
      ),
      new HumanMessage(
        `
        Search question: ${this.searchQuestion}

        Search Queries to Rank:

        Search Query One:
        ${itemOne}

        Search Query Two:
        ${itemTwo}

        The Most Relevant Search Query Is:
       `
      ),
    ];

    return await this.getResultsFromLLM(
      index,
      "rank-search-queries",
      IEngineConstants.searchQueryRankingsModel,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async rankSearchQueries(queriesToRank: string[], searchQuestion: string) {
    this.searchQuestion = searchQuestion;

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.searchQueryRankingsModel.temperature,
      maxTokens: IEngineConstants.searchQueryRankingsModel.maxOutputTokens,
      modelName: IEngineConstants.searchQueryRankingsModel.name,
      verbose: IEngineConstants.searchQueryRankingsModel.verbose,
    });

    this.setupRankingPrompts(-1, queriesToRank);
    await this.performPairwiseRanking(-1);
    return this.getOrderedListOfItems(-1) as string[];
  }
}
