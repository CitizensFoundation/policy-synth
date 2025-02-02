import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";

export class PsEngineerWebContentRanker extends PairwiseRankingAgent {
  instructions: string | undefined;
  override memory: PsEngineerMemoryData;

  defaultModelSize = PsAiModelSize.Small;
  defaultModelType = PsAiModelType.TextReasoning;

  updatePrefix = "Ranking Results";

  constructor(
    agent: PsAgent,
    memory: PsEngineerMemoryData,
   startProgress: number = 0,
    endProgress: number = 100
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

    const messages = [
      this.createSystemMessage(`${this.memory.taskTitle ? `<OverallTaskTitle>
${this.memory.taskTitle}
</OverallTaskTitle>` : ""}

${this.memory.taskDescription ? `<OverallTaskDescription>
${this.memory.taskDescription}
</OverallTaskDescription>` : ""}

${this.memory.taskInstructions ? `<OverallTaskInstructions>
${this.memory.taskInstructions}
</OverallTaskInstructions>` : ""}

${this.memory.likelyRelevantNpmPackageDependencies &&
  this.memory.likelyRelevantNpmPackageDependencies.length > 0
    ? `Likely relevant npm dependencies:
${this.memory.likelyRelevantNpmPackageDependencies.join("\n")}`
    : ""}

<Instructions>
1. You will see user instructions and two content items.
2. Analyze, compare, and rank the content items based on their relevance.
3. Output your decision as "One", "Two" or "Neither". No explanation is required.
</Instructions>
      `),
      this.createHumanMessage(`
<UserInstructions>
${this.instructions}
</UserInstructions>

<ContentItemsToRank>
  <One>
  ${itemOne}
  </One>

  <Two>
  ${itemTwo}
  </Two>
</ContentItemsToRank>

The Most Relevant Content Item Is (One, Two or Neither):
      `)
    ];

    return await this.getResultsFromLLM(
      index,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async rankWebContent(
    queriesToRank: string[],
    instructions: string,
    maxPrompts = 120
  ) {
    this.instructions = instructions;

    // Set up the prompts for pairwise ranking.
    this.setupRankingPrompts(
      -1,
      queriesToRank,
      queriesToRank.length * 10,
      this.progressFunction,
      3
    );
    await this.performPairwiseRanking(-1);
    await this.saveMemory();
    return this.getOrderedListOfItems(-1) as string[];
  }
}
