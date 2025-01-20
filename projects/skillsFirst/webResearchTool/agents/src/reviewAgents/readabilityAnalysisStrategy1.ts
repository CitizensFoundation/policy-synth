import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

// Import necessary types and interfaces
import { EducationType, EducationTypes } from '../educationTypes.js'; // Adjust the path as needed

export class ReadabilityAnalysisAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Medium;
  modelType: PsAiModelType = PsAiModelType.TextReasoning;
  override get maxModelTokensOut(): number {
    return 16384;
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

  // Processing function for performing readability analysis using LLM
  async processJobDescription(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `Performing readability analysis for ${jobDescription.name}`
    );

    // Ensure readabilityAnalysis exists
    jobDescription.readabilityAnalysis = jobDescription.readabilityAnalysis || {} as JobDescriptionReadabilityAnalysis;
    const readabilityAnalysis = jobDescription.readabilityAnalysis;

    // Prepare the system prompt for the LLM
    const systemPrompt = `You are an expert in linguistic analysis and assessing reading levels of texts.

Your task is to analyze the following job description and perform the assessments as per the prompts provided.

Job Description:
\`\`\`
${jobDescription.text}
\`\`\`

Existing Degree Requirements:
${JSON.stringify(jobDescription.degreeAnalysis?.educationRequirements?.map(er => er.type), null, 2)}

Please perform the following tasks:

**Prompt #1:**

- Assess the education level (from the provided EducationType enum) required to fully comprehend the job description for people in the United States. Report the assessed education level.

- Compare the assessed education level to any academic degree requirement included in the job description and report \`true\` if they are the same and \`false\` if they are different.

**Prompt #2:**

- (\`true\`/\`false\`) This job description is fully comprehensible for an American with an education level of \`HighSchool\` (Type1) or lower.

- If the answer is \`false\`, identify the language in the job description that an American with a \`HighSchool\` (Type1) education level would not fully comprehend.

**Prompt #3:**

- (\`true\`/\`false\`) This job description is fully comprehensible for an American with an education level of \`CollegeCoursework\` (Type2).

- If the answer is \`false\`, identify the language in the job description that an American with a \`CollegeCoursework\` (Type2) education level would not fully comprehend.

- Provide the answer \`Reading Mismatch\` if the answer to Prompt #3 is \`false\` and the job description requires a \`HighSchool\` (Type1) degree or a higher level of education.

**Prompt #4:**

- (\`true\`/\`false\`) This job description is fully comprehensible for an American who has an education level of \`AssociatesDegree\` (Type3).

- If the answer is \`false\`, identify the language in the job description that an American with an \`AssociatesDegree\` (Type3) education level would not fully comprehend.

- Provide the answer \`Reading Mismatch\` if the answer to Prompt #4 is \`false\` and the job description requires a \`CollegeCoursework\` (Type2) or higher level of education.

**Prompt #5:**

- (\`true\`/\`false\`) This job description is fully comprehensible for an American who has an education level of \`BachelorsDegree\` (Type4).

- If the answer is \`false\`, identify the language in the job description that an American with a \`BachelorsDegree\` (Type4) education level would not fully comprehend.

- Provide the answer \`Reading Mismatch\` if the answer to Prompt #5 is \`false\` and the job description requires a \`MastersDegree\` (Type5) or higher level of education.

**Prompt #6:**

- (\`true\`/\`false\`) This job description is fully comprehensible for an American who has an education level of \`MastersDegree\` (Type5).

- If the answer is \`false\`, identify the language in the job description that an American with a \`MastersDegree\` (Type5) education level would not fully comprehend.

**Your response should be in the following JSON format:**

\`\`\`json
{
  "assessedEducationLevel": "EducationType",
  "readingLevelMatchesDegreeRequirement": true/false,
  "readabilityAssessments": [
    {
      "educationType": "EducationType",
      "isComprehensible": true/false,
      "difficultLanguage": ["list of phrases"],
      "readingMismatch": true/false/null
    },
    // Repeat for each education level assessed
  ]
}
\`\`\`

Please use the \`EducationType\` enum values exactly as defined:

${JSON.stringify(EducationType, null, 2)}

Do not include any explanations or additional text. Output only the JSON object.`;

    // Call the LLM
    const messages = [this.createSystemMessage(systemPrompt)];

    const resultText = await this.callModel(
      this.modelType,
      this.modelSize,
      messages,
      true // parse as JSON
    );

    // Parse the LLM's response
    let result;
    try {
      result = JSON.parse(resultText) as JobDescriptionReadabilityAnalysis;
    } catch (error) {
      this.logger.error('Error parsing LLM response:', error);
      throw new Error('Failed to parse LLM response as JSON.');
    }

    if (result) {
      // Update the readabilityAnalysis object
      readabilityAnalysis.assessedEducationLevel = result.assessedEducationLevel;
      readabilityAnalysis.readingLevelMatchesDegreeRequirement = result.readingLevelMatchesDegreeRequirement;
      readabilityAnalysis.readabilityAssessments = result.readabilityAssessments;
    } else {
      // Handle parsing error or invalid response
      this.logger.error('Invalid response from LLM for readability analysis.');
      throw new Error('LLM did not return the expected readability analysis.');
    }

    await this.updateRangedProgress(100, "Readability analysis completed");
  }
}