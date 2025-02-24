import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";

export class DifferenceAnalysisAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Medium;
  modelType: PsAiModelType = PsAiModelType.TextReasoning;
  override get maxModelTokensOut(): number {
    return 100000;
  }
  override get modelTemperature(): number {
    return 0.0;
  }

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  async processJobDescription(jobDescription: JobDescription): Promise<void> {
    const mem = this.memory as JobDescriptionMemoryData;
    await this.updateRangedProgress(0, `Starting difference analysis for ${jobDescription.name}`);
    
    if (!jobDescription.readabilityAnalysis) {
      jobDescription.readabilityAnalysis = {} as any;
    }
    if (!jobDescription.degreeAnalysis || !jobDescription.degreeAnalysis.maximumDegreeRequirement) {
      this.logger.warn(`Missing degree analysis or maximum degree requirement for ${jobDescription.name}`);
      await this.updateRangedProgress(100, `Skipping difference analysis for ${jobDescription.name} due to missing data`);
      return;
    }
    if (!jobDescription.readabilityAnalysis!.assessedEducationLevel) {
      this.logger.warn(`Missing assessed education level in readability analysis for ${jobDescription.name}`);
      await this.updateRangedProgress(100, `Skipping difference analysis for ${jobDescription.name} due to missing assessed education level`);
      return;
    }

    const assessedLevel = jobDescription.readabilityAnalysis!.assessedEducationLevel;
    const requiredLevel = jobDescription.degreeAnalysis.maximumDegreeRequirement;

    const systemPrompt = `<JobDescription>
Title: ${jobDescription.name}
Text Preview: ${jobDescription.text.substring(0, 200)}
</JobDescription>

Assessed Readability Education Level: ${assessedLevel}
Maximum Degree Requirement: ${requiredLevel}

Determine if the job description text is written at a higher complexity level than the required education level.
It is acceptable if the assessed readability level is equal to or lower than the maximum degree requirement.
If the text is written at a higher complexity level than required, then the reading level does NOT match the degree requirement.

Provide your answer in the following JSON format:
{
  "readingLevelMatchesDegreeRequirement": boolean
}
Do not include any additional text.
`;

    const messages = [this.createSystemMessage(systemPrompt)];

    let resultText;
    try {
      resultText = await this.callModel(
        this.modelType,
        this.modelSize,
        messages,
        true,
        true
      );
    } catch (error) {
      this.logger.error(`Error in DifferenceAnalysisAgent for ${jobDescription.name}: ${error}`);
      mem.llmErrors.push(`DifferenceAnalysisAgent error for ${jobDescription.name}: ${error}`);
      await this.updateRangedProgress(100, `Difference analysis failed for ${jobDescription.name}`);
      return;
    }

    if (!resultText) {
      this.logger.error(`No result from LLM for DifferenceAnalysisAgent for ${jobDescription.name}`);
      mem.llmErrors.push(`No LLM response in DifferenceAnalysisAgent for ${jobDescription.name}`);
      await this.updateRangedProgress(100, `Difference analysis failed for ${jobDescription.name}`);
      return;
    }

    try {
      const result = resultText as { readingLevelMatchesDegreeRequirement: boolean };
      jobDescription.readabilityAnalysis!.readingLevelMatchesDegreeRequirement = result.readingLevelMatchesDegreeRequirement;
      this.logger.info(`Difference analysis for ${jobDescription.name}: readingLevelMatchesDegreeRequirement = ${result.readingLevelMatchesDegreeRequirement}`);
    } catch (parseError) {
      this.logger.error(`Error parsing result from DifferenceAnalysisAgent for ${jobDescription.name}: ${parseError}`);
      mem.llmErrors.push(`Parsing error in DifferenceAnalysisAgent for ${jobDescription.name}: ${parseError}`);
    }
    await this.updateRangedProgress(100, `Difference analysis completed for ${jobDescription.name}`);
  }
}