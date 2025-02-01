import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class SearchResultsRanker extends PairwiseRankingAgent {
  instructions: string | undefined;
  override memory: PsEngineerMemoryData;

  // New properties based on the example
  defaultModelSize = PsAiModelSize.Medium;
  numberOfMatchesForEachPrompt = 10;
  updatePrefix = "Rank Search Results";

  /**
   * The constructor now accepts additional parameters:
   * - agent: The agent instance (of type PsAgent)
   * - memory: Your memory data (of type PsEngineerMemoryData)
   * - progressFunction: Optional progress callback
   * - startProgress / endProgress: Bounds for progress tracking
   * - useSmallModelForSearchResultsRanking: Flag that when true switches to a small model and increases match count
   */
  constructor(
    agent: PsAgent,
    memory: PsEngineerMemoryData,
    startProgress: number,
    endProgress: number,
    useSmallModelForSearchResultsRanking: boolean = false
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
    if (useSmallModelForSearchResultsRanking) {
      this.defaultModelSize = PsAiModelSize.Small;
      this.numberOfMatchesForEachPrompt = 12;
    }
  }

  /**
   * Compares two search result items.
   * The system message is constructed using helper functions and follows a similar template as the first example.
   */
  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as PsSearchResultItem;
    const itemTwo = this.allItems![index]![itemTwoIndex] as PsSearchResultItem;

    // Log the two items in a similar style to the first example.
    console.log(`\nitemOne: ${itemOne.title} - ${itemOne.description} ${itemOne.url}\n`);
    console.log(`\nitemTwo: ${itemTwo.title} - ${itemTwo.description} ${itemTwo.url}\n`);

    const messages = [
      this.createSystemMessage(
        `<searchResultsRanker>
You are an AI expert trained to rank search results based on their relevance to the user instructions.

<TaskDetails>
${this.memory.taskTitle ? `<OverallTaskTitle>
${this.memory.taskTitle}
</OverallTaskTitle>` : ""}

${this.memory.taskDescription ? `<OverallTaskDescription>
${this.memory.taskDescription}
</OverallTaskDescription>` : ""}

${this.memory.taskInstructions ? `<OverallTaskInstructions>
${this.memory.taskInstructions}
</OverallTaskInstructions>` : ""}
</TaskDetails>
${
  this.memory.likelyRelevantNpmPackageDependencies &&
  this.memory.likelyRelevantNpmPackageDependencies.length > 0
    ? "Likely relevant npm dependencies:\n" +
      this.memory.likelyRelevantNpmPackageDependencies.join("\n")
    : ""
}

Instructions:
1. You will receive user instructions and task details above.
2. You will also see two web search results, marked as "Search Result One" and "Search Result Two".
3. Your task is to analyze, compare, and rank these search results based on their relevance to the user instructions.
4. Output your decision as "One", "Two" or "Neither". Output nothing else. No explanation is required.
</searchResultsRanker>`
      ),
      this.createHumanMessage(
        `User instructions: ${this.instructions}

Search Results to Rank:

Search Result One:
${itemOne.title}
${itemOne.description}
${itemOne.url}

Search Result Two:
${itemTwo.title}
${itemTwo.description}
${itemTwo.url}

The Most Relevant Search Results Is:`
      ),
    ];

    return await this.getResultsFromLLM(index, messages, itemOneIndex, itemTwoIndex);
  }

  /**
   * Sets up the ranking prompts based on the number of search results, performs the pairwise ranking,
   * saves memory, and returns the ordered list.
   */
  async rankSearchResults(
    queriesToRank: PsSearchResultItem[],
    instructions: string
  ) {
    this.instructions = instructions;

    // Compute the total number of ranking prompts to use.
    this.setupRankingPrompts(
      -1,
      queriesToRank,
      queriesToRank.length * this.numberOfMatchesForEachPrompt,
      this.progressFunction,
      12
    );
    await this.performPairwiseRanking(-1);
    await this.saveMemory();
    return this.getOrderedListOfItems(-1) as PsSearchResultItem[];
  }
}
