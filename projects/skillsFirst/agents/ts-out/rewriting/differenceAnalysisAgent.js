import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { EducationType } from "../educationTypes.js";
export class DifferenceAnalysisAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Medium;
    modelType = PsAiModelType.TextReasoning;
    get maxModelTokensOut() {
        return 100000;
    }
    get modelTemperature() {
        return 0.0;
    }
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    async processJobDescription(jobDescription) {
        await this.updateRangedProgress(0, `Starting difference analysis for ${jobDescription.name}`);
        // Ensure we have all required data
        if (!jobDescription.degreeAnalysis || !jobDescription.degreeAnalysis.maximumDegreeRequirement) {
            this.logger.warn(`Missing degree analysis or maximumDegreeRequirement for ${jobDescription.name}`);
            await this.updateRangedProgress(100, `Skipping difference analysis due to missing data`);
            return false;
        }
        if (!jobDescription.readabilityAnalysis || !jobDescription.readabilityAnalysis.assessedEducationLevel) {
            this.logger.warn(`Missing readabilityAnalysis or assessedEducationLevel for ${jobDescription.name}`);
            await this.updateRangedProgress(100, `Skipping difference analysis due to missing data`);
            return false;
        }
        // Extract needed fields
        const requiredLevel = jobDescription.degreeAnalysis.maximumDegreeRequirement;
        const assessedLevel = jobDescription.readabilityAnalysis.assessedEducationLevel;
        /**
         * Mismatch Definition per your policy:
         * A mismatch happens IF the job requires only HighSchool (GED) or none,
         * but the text is at a 'higher' reading level: Some college or above.
         */
        const isHighSchoolOrNone = (requiredLevel === EducationType.HighSchool);
        const isTextSomeCollegeOrAbove = (assessedLevel === EducationType.CollegeCoursework
            || assessedLevel === EducationType.AssociatesDegree
            || assessedLevel === EducationType.BachelorsDegree
            || assessedLevel === EducationType.MastersDegree
            || assessedLevel === EducationType.DoctoralDegree);
        // If "high school or none" required but text is "some college or above", mismatch => false for "readingLevelMatches"
        let readingLevelMatches = true;
        if (isHighSchoolOrNone && isTextSomeCollegeOrAbove) {
            readingLevelMatches = false;
        }
        jobDescription.readabilityAnalysis.readingLevelMatchesDegreeRequirement = readingLevelMatches;
        this.logger.info(`Difference analysis for ${jobDescription.name}: readingLevelMatchesDegreeRequirement = ${readingLevelMatches}`);
        await this.updateRangedProgress(100, `Difference analysis completed for ${jobDescription.name}`);
        return readingLevelMatches;
    }
}
//# sourceMappingURL=differenceAnalysisAgent.js.map