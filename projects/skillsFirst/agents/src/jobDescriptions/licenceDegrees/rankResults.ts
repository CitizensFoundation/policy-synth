import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";


export class LicenseDegreeResultsRanker extends PairwiseRankingAgent {
  override memory: LicenseDegreeAnalysisMemoryData;

  defaultModelSize = PsAiModelSize.Medium;
  updatePrefix = "Rank License Degree Analysis Results";
  licenseType: string;

  constructor(
    agent: PsAgent,
    memory: LicenseDegreeAnalysisMemoryData,
    startProgress: number,
    endProgress: number,
    licenseType: string,
    progressFunction: Function | undefined = undefined
  ) {
    super(agent, memory, startProgress, endProgress);
    // this.memory is assigned by super(agent, memory, ...)
    this.progressFunction = progressFunction;
    this.licenseType = licenseType;
    this.memory = memory;
  }

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as LicenseDegreeAnalysisResult;
    const itemTwo = this.allItems![index]![itemTwoIndex] as LicenseDegreeAnalysisResult;

    const systemMessage = this.createSystemMessage(
      `You are an AI expert trained to rank analysis results for professional licenses based on their authoritativeness.

<ProfessionalLicenseType>
${this.licenseType}
</ProfessionalLicenseType>

Instructions:
1. You will be presented with two analysis results, "Result One" and "Result Two".
2. Each result contains information like the source URL, the stated degree requirement, supporting evidence, a confidence score, and reasoning.
3. Your task is to determine which result is more authoritative. Consider factors such as:
    - The source of the information (e.g., official government or licensing board websites are highly authoritative).
    - The clarity, directness, and strength of the supporting evidence for the degree requirement status.
    - The coherence and logical soundness of the reasoning provided.
    - While confidence scores are a factor, they should be weighed against the quality of the source and evidence. A high score from a less reliable source may not be as authoritative as a moderate score from an official source.
4. Output your decision as "One", "Two" or "Neither". Output nothing else. No explanation is required.`
    );

    // Present only relevant fields to the LLM, exclude eloScore and id from the prompt.
    const itemOnePromptData = {
      sourceUrl: itemOne.sourceUrl,
      degreeRequiredStatus: itemOne.degreeRequiredStatus,
      supportingEvidence: itemOne.supportingEvidence,
      confidenceScore: itemOne.confidenceScore,
      reasoning: itemOne.reasoning,
    };

    const itemTwoPromptData = {
      sourceUrl: itemTwo.sourceUrl,
      degreeRequiredStatus: itemTwo.degreeRequiredStatus,
      supportingEvidence: itemTwo.supportingEvidence,
      confidenceScore: itemTwo.confidenceScore,
      reasoning: itemTwo.reasoning,
    };

    const humanMessage = this.createHumanMessage(
      `License Type: ${this.licenseType}

Analysis Results to Rank:

Result One:
${JSON.stringify(itemOnePromptData, null, 2)}

Result Two:
${JSON.stringify(itemTwoPromptData, null, 2)}

The More Authoritative Result Is:`
    );

    const messages = [systemMessage, humanMessage];

    return await this.getResultsFromLLM(
      index,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async rankLicenseDegreeResults(
    resultsToRank: LicenseDegreeAnalysisResult[]
  ): Promise<LicenseDegreeAnalysisResult[]> {
    const numItems = resultsToRank.length;
    if (numItems < 2) {
      this.logger.info(`Skipping ranking for ${this.licenseType} as there are less than 2 items.`);
      return resultsToRank;
    }

    this.logger.info(`Ranking ${numItems} results for license type: ${this.licenseType}`);

    this.setupRankingPrompts(
      -1,
      resultsToRank,
      resultsToRank.length * 10,
      this.progressFunction,
      resultsToRank.length > 15 ? 10 : 1
    );

    await this.performPairwiseRanking(-1);
    await this.saveMemory();

    // The items in resultsToRank should now have their eloRating property updated by the ranking agent.
    // getOrderedListOfItems will return these items, sorted.
    const rankedResults = this.getOrderedListOfItems(-1, true) as LicenseDegreeAnalysisResult[];

    // No explicit mapping back to eloScore is needed as we are using eloRating directly.
    return rankedResults;
  }
}