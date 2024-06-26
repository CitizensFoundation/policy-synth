
import { SimplePairwiseRankingsAgent } from "../base/simplePairwiseRanking.js";

export class SearchResultsRanker extends SimplePairwiseRankingsAgent {
  searchQuestion: string | undefined;

  constructor(
    memory: PsSimpleAgentMemoryData,
    progressFunction: Function | undefined = undefined
  ) {
    super(memory);
    this.progressFunction = progressFunction;
  }

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![
      itemOneIndex
    ] as PsSearchResultItem;
    const itemTwo = this.allItems![index]![
      itemTwoIndex
    ] as PsSearchResultItem;

    console.log(`itemOne: ${JSON.stringify(itemOne, null, 2)}`);
    console.log(`itemTwo: ${JSON.stringify(itemTwo, null, 2)}`);

    const messages = [
      this.createSystemMessage(
        `
        You are an AI expert trained to rank search results based on their relevance to the user research question.

        Instructions:
        1. You will receive a research question.
        2. You will also see two web search results, marked as "Search Result One" and "Search Result Two".
        3. Your task is to analyze, compare, and rank these search results based on their relevance to the user research question.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `
      ),
      this.createHumanMessage(
        `
        Research question: ${this.searchQuestion}

        Search Results to Rank:

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
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async rankSearchResults(
    queriesToRank: PsSearchResultItem[],
    searchQuestion: string,
    maxPrompts = 150
  ) {
    this.searchQuestion = searchQuestion;

    this.setupRankingPrompts(-1, queriesToRank, maxPrompts, this.progressFunction);
    await this.performPairwiseRanking(-1);
    return this.getOrderedListOfItems(-1) as PsSearchResultItem[];
  }
}
