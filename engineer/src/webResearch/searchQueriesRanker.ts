import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsConstants } from "@policysynth/agents/constants.js";


export class SearchQueriesRanker extends PairwiseRankingAgent {
  instructions: string | undefined;
  override memory: PsEngineerMemoryData;

  // Extra properties from the upgraded code
  defaultModelSize = PsAiModelSize.Medium;
  updatePrefix = "Rank Search Queries";

  constructor(
    agent: PsAgent,
    memory: PsEngineerMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as string;
    const itemTwo = this.allItems![index]![itemTwoIndex] as string;

    console.log(`itemOne: ${itemOne}`);
    console.log(`itemTwo: ${itemTwo}`);

    const messages = [
      this.createSystemMessage(
        `<searchQueriesRanker>You are an AI expert trained to rank search queries based on their relevance to the user instructions.

<OurTaskPlan>
${this.memory.taskTitle ? `<OverallTaskTitle>
${this.memory.taskTitle}
</OverallTaskTitle>` : ""}

${this.memory.taskDescription ? `<OverallTaskDescription>
${this.memory.taskDescription}
</OverallTaskDescription>` : ""}

${this.memory.taskInstructions ? `<OverallTaskInstructions>
${this.memory.taskInstructions}
</OverallTaskInstructions>` : ""}
${
  this.memory.likelyRelevantNpmPackageDependencies && this.memory.likelyRelevantNpmPackageDependencies.length > 0
    ? `Likely relevant npm dependencies:\n${this.memory.likelyRelevantNpmPackageDependencies.join('\n')}`
    : ""
}
</OurTaskPlan>

Instructions:
1. You will see instructions from the user and our task plan above.
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
  ): Promise<string[]> {
    this.instructions = instructions;

    // Use a multiplier of 10 (and add an extra parameter, e.g. 6, if needed)
    this.setupRankingPrompts(
      -1,
      queriesToRank,
      queriesToRank.length * 10,
      this.progressFunction,
      6
    );
    await this.performPairwiseRanking(-1);
    await this.saveMemory();
    return this.getOrderedListOfItems(-1) as string[];
  }
}
