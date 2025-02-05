import { SimplePairwiseRankingsAgent } from "../base/simplePairwiseRanking.js";

export class SearchQueriesRanker extends SimplePairwiseRankingsAgent {
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

    const itemOne = this.allItems![index]![itemOneIndex] as string;
    const itemTwo = this.allItems![index]![itemTwoIndex] as string;

    const messages = [
      this.createSystemMessage(
        `
        You are an AI expert trained to rank search queries based on their relevance to the user research question.

        Instructions:
        1. You will see a research question.
        2. You will also see two web search queries, each marked as "Search Query One" and "Search Query Two".
        3. Your task is to analyze, compare, and rank these search queries based on their relevance to the research question.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `
      ),
      this.createHumanMessage(
        `
        Research question: ${this.searchQuestion}

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
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async rankSearchQueries(
    queriesToRank: string[],
    searchQuestion: string,
    maxPrompts = 120
  ) {
    this.searchQuestion = searchQuestion;

    this.setupRankingPrompts(
      -1,
      queriesToRank,
      maxPrompts,
      this.progressFunction
    );
    await this.performPairwiseRanking(-1);
    return this.getOrderedListOfItems(-1) as string[];
  }
}
