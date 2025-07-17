import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";

export class SearchQueriesRanker extends PairwiseRankingAgent {
  instructions: string | undefined;
  override memory: JobDescriptionMemoryData;

  defaultModelSize = PsAiModelSize.Medium;

  updatePrefix = "Rank Search Queries";

  jobTitle: string;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    progressFunction: Function | undefined = undefined,
    startProgress: number,
    endProgress: number,
    jobTitle: string
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
    this.progressFunction = progressFunction;
    this.jobTitle = jobTitle;
  }

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as string;
    const itemTwo = this.allItems![index]![itemTwoIndex] as string;

    console.log(`itemOne: ${this.allItems![index]![itemOneIndex]}`);
    console.log(`itemTwo: ${this.allItems![index]![itemTwoIndex]}`);

    const messages = [
      this.createSystemMessage(
        `<searchQueriesRanker>You are an AI expert trained to rank search queries based on their relevance to the user instructions.

        <JobTitle>
        ${this.jobTitle}
        </JobTitle>

        ${this.memory.additionalGeneralContext ? this.memory.additionalGeneralContext : ""}

        Instructions:
        1. You will see instructions from the user and our deep research plan above.
        2. You will also see two web search queries, each marked as "Search Query One" and "Search Query Two".
        3. Your task is to analyze, compare, and rank these search queries based on their relevance to the user instructions.
        4. Output your decision as "One", "Two" or "Neither". Output nothing else. No explanation is required.
        </searchQueriesRanker>`
      ),
      this.createHumanMessage(
        `User instructions: ${this.instructions}

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
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async rankSearchQueries(
    queriesToRank: string[],
    instructions: string,
    maxPrompts = 120
  ) {
    this.instructions = instructions;

    this.setupRankingPrompts(
      -1,
      queriesToRank,
      queriesToRank.length*10,
      this.progressFunction,
      4,
      true
    );
    await this.performPairwiseRanking(-1);
    await this.saveMemory();
    return this.getOrderedListOfItems(-1) as string[];
  }
}
