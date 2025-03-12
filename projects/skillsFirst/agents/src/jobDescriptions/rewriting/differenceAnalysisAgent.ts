import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import { EducationType, EducationTypes } from "../educationTypes.js";
import { runInThisContext } from "vm";

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

  detectEducationTypeFromText(text: string): EducationType | null {
    if (!text) return null;

    const lowerText = text.toLowerCase();

    for (const [typeKey, typeInfo] of Object.entries(EducationTypes)) {
      for (const phrase of typeInfo.phrases) {
        // Compare both sides in lowercase
        if (lowerText.includes(phrase.toLowerCase())) {
          return typeKey as EducationType;
        }
      }
    }

    return null;
  }

  async processJobDescription(jobDescription: JobDescription): Promise<boolean> {


    // Ensure we have all required data
    if (
      !jobDescription.degreeAnalysis?.maximumDegreeRequirement ||
      !jobDescription.readingLevelGradeAnalysis?.readabilityLevel
    ) {
      this.logger.warn(
        `Missing degree analysis or readabilityLevel for ${jobDescription.name}`
      );
      await this.updateRangedProgress(
        100,
        `Skipping difference analysis due to missing data`
      );
      return false;
    }

    // Instead of using raw strings or an already-set enum,
    // let's detect from the text (case-insensitive):
    const requiredLevel: EducationType | null = this.detectEducationTypeFromText(
      jobDescription.degreeAnalysis.maximumDegreeRequirement
    );

    const assessedLevel: EducationType | null = this.detectEducationTypeFromText(
      jobDescription.readingLevelGradeAnalysis.readabilityLevel
    );

    // If detectEducationTypeFromText fails to find a match, it returns null
    if (!requiredLevel || !assessedLevel) {
      this.logger.warn(
        `Could not detect education type from text for ${jobDescription.name}`
      );
      this.logger.warn(`Required Level: ${requiredLevel} from ${jobDescription.degreeAnalysis.maximumDegreeRequirement}`);
      this.logger.warn(`Assessed Level: ${assessedLevel} from ${jobDescription.readingLevelGradeAnalysis.readabilityLevel}`);
     //this.logger.warn(`Text: ${jobDescription.readingLevelGradeAnalysis.readabilityLevel}`);

      return false;
    }



    // A mismatch happens IF the job requires only HighSchool/None
    // but the text is at a 'higher' reading level: Some college or above.
    const isHighSchoolOrNone =
      requiredLevel === EducationType.HighSchool ||
      requiredLevel === EducationType.None;

    const isTextSomeCollegeOrAbove =
      assessedLevel === EducationType.CollegeCoursework ||
      assessedLevel === EducationType.AssociatesDegree ||
      assessedLevel === EducationType.BachelorsDegree ||
      assessedLevel === EducationType.MastersDegree ||
      assessedLevel === EducationType.DoctoralDegree;

    // If "high school or none" required but text is "some college or above",
    // mismatch => readingLevelMatches = false
    let readingLevelMatches = true;
    if (isHighSchoolOrNone && isTextSomeCollegeOrAbove) {
      readingLevelMatches = false;
    }

    // Store result
    jobDescription.readingLevelGradeAnalysis.readingLevelMatchesDegreeRequirement =
      readingLevelMatches;

    if (!readingLevelMatches) {
      this.logger.debug(
        `Comparing Job Level: ${requiredLevel} and Text Level: ${assessedLevel}`
      );
      this.logger.info(
        `Difference analysis for ${jobDescription.name}: readingLevelMatchesDegreeRequirement = ${readingLevelMatches}`
      );
    }

    return readingLevelMatches;
  }
}
