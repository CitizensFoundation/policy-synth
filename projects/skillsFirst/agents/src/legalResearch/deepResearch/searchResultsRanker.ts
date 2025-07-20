import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class SearchResultsRanker extends PairwiseRankingAgent {
  instructions: string | undefined;
  override memory: JobDescriptionMemoryData;

  defaultModelSize = PsAiModelSize.Medium;

  numberOfMatchesForEachPrompt = 10;

  updatePrefix = "Rank Search Results";

  jobTitle: string;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    progressFunction: Function | undefined = undefined,
    startProgress: number,
    endProgress: number,
    jobTitle: string,
    useSmallModelForSearchResultsRanking: boolean = false
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
    this.progressFunction = progressFunction;
    if (useSmallModelForSearchResultsRanking) {
      this.defaultModelSize = PsAiModelSize.Small;
      this.numberOfMatchesForEachPrompt = 12;
    }
    this.jobTitle = jobTitle;
  }

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as PsSearchResultItem;
    const itemTwo = this.allItems![index]![itemTwoIndex] as PsSearchResultItem;

    console.log(`\nitemOne: ${itemOne.title} - ${itemOne.description} ${itemOne.url}\n`);
    console.log(`itemTwo: ${itemTwo.title} - ${itemTwo.description} ${itemTwo.url}\n`);

    const messages = [
      this.createSystemMessage(
        `<searchResultsRanker>
        You are an AI expert trained to rank search results based on their relevance to the user instructions.

        <JobTitle>
        ${this.jobTitle}
        </JobTitle>

        ${this.memory.additionalGeneralContext ? this.memory.additionalGeneralContext : ""}

        Instructions:
        1. You will receive user instructions and our research plan above.
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

        The Most Relevant Search Results Is:
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

  async rankSearchResults(
    queriesToRank: PsSearchResultItem[],
    instructions: string
  ) {
    this.instructions = instructions;

    this.setupRankingPrompts(
      -1,
      queriesToRank,
      queriesToRank.length * this.numberOfMatchesForEachPrompt,
      this.progressFunction,
      20,
      true
    );
    await this.performPairwiseRanking(-1);
    await this.saveMemory();
    return this.getOrderedListOfItems(-1) as PsSearchResultItem[];
  }
}
