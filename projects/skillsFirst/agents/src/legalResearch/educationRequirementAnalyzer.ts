import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";

export class EducationRequirementAnalyzerAgent extends PolicySynthAgent {
  memory: JobDescriptionMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Medium;
  modelType: PsAiModelType = PsAiModelType.TextReasoning;

  override get maxModelTokensOut(): number {
    return 16000;
  }
  override get modelTemperature(): number {
    return 0.0;
  }
  override get reasoningEffort(): "low" | "medium" | "high" {
    return "high";
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

  async analyze(
    extractedText: string,
    jobTitle: string,
    sourceUrl: string
  ): Promise<EducationRequirementResearchResult | { error: string }> {
    const estimatedTokenFactor = 1.42;
    const tokenLimit = 150_000;
    const words = extractedText.split(" ");
    const wordCount = words.length;
    const estimatedTokenCount = wordCount * estimatedTokenFactor;

    if (estimatedTokenCount > tokenLimit) {
      const maxWordCount = Math.floor(tokenLimit / estimatedTokenFactor);
      const originalWordCount = wordCount;
      extractedText = words.slice(0, maxWordCount).join(" ");
      this.logger.debug(
        `Reduced document from ${originalWordCount} words (estimated ${Math.round(
          estimatedTokenCount
        )} tokens) to ${maxWordCount} words (estimated ${Math.round(
          maxWordCount * estimatedTokenFactor
        )} tokens) based on token limit.`
      );
    }

    await this.updateRangedProgress(
      0,
      `Analyzing requirements for: ${jobTitle}`
    );
    this.logger.info(
      `Analyzing extracted text for ${jobTitle} from ${sourceUrl}`
    );

    if (!extractedText || extractedText.trim().length === 0) {
      this.logger.warn(`Cannot analyze empty text for ${jobTitle}`);
      return { error: "Input text for analysis is empty." };
    }

    const systemPrompt = `You are an expert analyst specializing in New Jersey employment regulations.
    Your task is to determine if the <jobTitle>${jobTitle}</jobTitle> requires a college degree based *only* on the provided text from an official source (statute, regulation, classification document, etc.).
    Focus solely on educational prerequisites for holding the job. Summarize any explicit or implicit degree requirement.
    Return your analysis strictly as JSON in the following format:
    {\n  \"statedDegreeRequirement\": string,\n  \"reasoning\": string\n}\n
    Do NOT include any text before or after the JSON object.`;

    const userPrompt = `<SourceText>${extractedText}</SourceText>\n\nYour JSON output:`;

    try {
      const messages = [
        this.createSystemMessage(systemPrompt),
        this.createHumanMessage(userPrompt),
      ];
      const llmResponse = await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Large,
        messages
      );

      this.logger.debug(
        `LLM response: ${JSON.stringify(llmResponse, null, 2)}`
      );

      const analysis = llmResponse as EducationRequirementResearchResult;

      this.logger.info(
        `Analysis complete for ${jobTitle}`
      );
      await this.updateRangedProgress(
        100,
        `Analysis complete for: ${jobTitle}`
      );

      return analysis;
    } catch (error: any) {
      this.logger.error(
        `Error during LLM analysis for ${jobTitle}: ${error.message}`
      );
      this.memory.llmErrors.push(
        `Analyzer LLM Error (${jobTitle}): ${error.message}`
      );
      await this.updateRangedProgress(100, `Analysis failed for: ${jobTitle}`);
      return { error: `LLM analysis failed for ${jobTitle}: ${error.message}` };
    }
  }

  async process() {
    throw new Error(
      "Process method not implemented for direct use. Call analyze instead."
    );
  }
}
