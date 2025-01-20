import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

// Import necessary types and interfaces
// Assuming these are defined in your codebase
// import { JobDescriptionMemoryData, JobDescription, readingLevelUSGradeAnalysis } from "../types.js";

export class ReadingLevelUSGradeAnalysisAgent extends PolicySynthAgent {
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

  // Processing function for analyzing reading level of job descriptions
  async processJobDescription(jobDescription: JobDescription) {
    await this.updateRangedProgress(
      0,
      `Analyzing reading level for ${jobDescription.name}`
    );

    // Ensure readingLevelUSGradeAnalysis exists
    jobDescription.readingLevelUSGradeAnalysis =
      jobDescription.readingLevelUSGradeAnalysis ||
      ({} as {
        readabilityLevelExplanation: string;
        usGradeLevelReadability: string;
        difficultPassages: string[];
      });
    const readingLevelUSGradeAnalysis =
      jobDescription.readingLevelUSGradeAnalysis;

    // Define the list of U.S. Grade Levels
    const gradeLevels = [
      "6th Grade",
      "7th Grade",
      "8th Grade",
      "9th Grade (Freshman High School)",
      "10th Grade",
      "11th Grade",
      "12th Grade (Senior High School)",
      "College Freshman",
      "College Sophomore",
      "College Junior",
      "College Senior",
      "College Graduate",
      "Postgraduate Level",
    ];

    // Prepare the prompt for the LLM
    const systemPrompt = `What reading level must an individual have attained in order to fully comprehend this job description? Choose only from the U.S. Grade Levels listed:

${gradeLevels.join("\n")}

Quote each sentence or paragraph you reviewed in the job description that explains why you have identified this U.S. Grade Level.

Job Description Text:
${jobDescription.text}

Provide your answer in the following JSON format:

\`\`\`json
{
  "U.S. Grade Level Readability": "Selected U.S. Grade Level",
  "Readability Level Explanation": ["Passage1", "Passage2", ...]
}
\`\`\`

Do not include any explanations or additional text. Output only the JSON object.`;

    // Call the LLM
    const messages = [this.createHumanMessage(systemPrompt)];
    const resultText = await this.callModel(
      this.modelType,
      this.modelSize,
      messages,
      true // Indicate we expect JSON back
    );

    let result;

    if (typeof resultText === "string") {
      // Extract JSON from the resultText
      let jsonString = resultText;

      // Use a regular expression to match and extract JSON content from code blocks
      const jsonCodeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = resultText.match(jsonCodeBlockRegex);
      if (match && match[1]) {
        jsonString = match[1];
        this.logger.debug("Extracted JSON from code block");
      } else {
        this.logger.warn(
          "No JSON code block found in LLM response, using entire response as JSON"
        );
      }

      // Parse the extracted JSON string
      try {
        result = JSON.parse(jsonString);
        this.logger.info("Successfully parsed JSON from string response");
      } catch (error) {
        this.logger.error("Error parsing LLM response:", error);
        throw new Error("Failed to parse LLM response as JSON.");
      }
    } else if (typeof resultText === "object") {
      // LLM returned an object, use it directly
      result = resultText;
      this.logger.debug("LLM response is an object, using it directly");
      this.logger.info("Successfully received JSON object from LLM");
    } else {
      throw new Error(`Unexpected type of LLM response: ${typeof resultText}`);
    }

    if (result) {
      // Validate the U.S. Grade Level Readability
      if (!gradeLevels.includes(result["U.S. Grade Level Readability"])) {
        this.logger.error("Invalid U.S. Grade Level returned by LLM.");
        throw new Error("LLM returned an invalid U.S. Grade Level.");
      }

      // Assign the results to the readingLevelUSGradeAnalysis object
      readingLevelUSGradeAnalysis!.usGradeLevelReadability =
        result["U.S. Grade Level Readability"];
      readingLevelUSGradeAnalysis!.readabilityLevelExplanation =
        result["Readability Level Explanation"];

      this.logger.info("Reading level analysis completed successfully.");
    } else {
      // Handle parsing error or invalid response
      this.logger.error(
        "Invalid response from LLM for reading level analysis."
      );
      throw new Error(
        "LLM did not return the expected data for reading level analysis."
      );
    }

    await this.updateRangedProgress(100, "Reading level analysis completed");
  }
}
