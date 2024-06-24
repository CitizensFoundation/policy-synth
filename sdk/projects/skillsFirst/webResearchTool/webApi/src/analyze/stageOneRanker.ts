import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { BasePairwiseRankingsProcessor } from "@policysynth/agents/basePairwiseRanking.js";
import { PsConstants } from "@policysynth/agents/constants.js";

export class StageOneRanker extends BasePairwiseRankingsProcessor {
  rankInstructions: string | undefined;

  constructor(
    memory: PsSmarterCrowdsourcingMemoryData | undefined = undefined,
    progressFunction: Function | undefined = undefined
  ) {
    super(undefined as any, undefined as any);
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
      new SystemMessage(
        `
        You are an AI expert trained to rank two items according to the users ranking instructions.

        Instructions:
        1. You will see ranking instructions.
        2. You will also see two items, each marked as "Item One" and "Item Two".
        3. Your task is to analyze, compare, and rank these items based on the users ranking instructions.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `
      ),
      new HumanMessage(
        `
        Ranking Instructions:
        ${this.rankInstructions}

        Items to Rank:

        Item One:
        ${itemOne}

        Item Two:
        ${itemTwo}

        The Most Relevant Item Is:
       `
      ),
    ];

    return await this.getResultsFromLLM(
      index,
      "rank-search-queries",
      PsConstants.searchQueryRankingsModel,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async rankItems(
    itemsToRank: string[],
    rankInstructions: string | undefined = undefined
  ) {
    if (rankInstructions) {
      this.rankInstructions = rankInstructions;
    }

    this.chat = new ChatOpenAI({
      temperature: 0.0,
      maxTokens: 4000,
      modelName: "gpt-4-0125-preview",
      verbose: true
    });

    this.setupRankingPrompts(
      -1,
      itemsToRank,
      itemsToRank.length*10,
      this.progressFunction
    );
    await this.performPairwiseRanking(-1);
    return this.getOrderedListOfItems(-1) as string[];
  }
}
