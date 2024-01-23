
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { BasePairwiseRankingsProcessor } from "../basePairwiseRanking.js";
import { IEngineConstants } from "../../constants.js";

export class SearchResultsRanker extends BasePairwiseRankingsProcessor {
  searchQuestion: string | undefined;
  progressFunction: Function | undefined;

  constructor(progressFunction: Function | undefined = undefined) {
    super(undefined as any, undefined as any);
    this.progressFunction = progressFunction;
  }

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<IEnginePairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![
      itemOneIndex
    ] as IEngineSearchResultItem;
    const itemTwo = this.allItems![index]![
      itemTwoIndex
    ] as IEngineSearchResultItem;

    console.log(`itemOne: ${JSON.stringify(itemOne, null, 2)}`);
    console.log(`itemTwo: ${JSON.stringify(itemOne, null, 2)}`);

    const messages = [
      new SystemMessage(
        `
        You are an AI expert trained to rank root causes search results based on their relevance to the problem statement.
        We will later visit those websites to discover the root causes presented in the problem statement.

        Instructions:
        1. You will receive a problem statement.
        2. You will also see two root causes web search results, marked as "Search Result One" and "Search Result Two".
        3. Your task is to analyze, compare, and rank these search results based on their relevance to the given problem and importance in relation root causes.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `
      ),
      new HumanMessage(
        `
        ${this.searchQuestion}

        Root Causes Search Results to Rank:

        Search Results One:
        ${itemOne.title}
        ${itemOne.description}
        ${itemOne.url}

        Search Results Two:
        ${itemTwo.title}
        ${itemTwo.description}
        ${itemTwo.url}

        The Most Relevant Search Results Is:
       `
      ),
    ];

    return await this.getResultsFromLLM(
      index,
      "rank-search-results",
      IEngineConstants.searchResultsRankingsModel,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async rankSearchResults(
    queriesToRank: IEngineSearchResultItem[],
    searchQuestion: string,
    maxPrompts = 150
  ) {
    this.searchQuestion = searchQuestion;

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.searchQueryRankingsModel.temperature,
      maxTokens: IEngineConstants.searchQueryRankingsModel.maxOutputTokens,
      modelName: IEngineConstants.searchQueryRankingsModel.name,
      verbose: IEngineConstants.searchQueryRankingsModel.verbose,
    });

    this.setupRankingPrompts(-1, queriesToRank, maxPrompts, this.progressFunction);
    await this.performPairwiseRanking(-1);
    return this.getOrderedListOfItems(-1) as IEngineSearchResultItem[];
  }
}
