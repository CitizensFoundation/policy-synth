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
    title: string,
    sourceUrl: string
  ): Promise<EducationRequirementResearchResult[] | { error: string }> {
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

    const systemPrompt = `You are an expert analyst specializing in New Jersey employment degree requirements for state jobs in New Jersey.
Follow the user <Instruction> in detail.

Return your analysis strictly as JSON in the following format:
[
  {
  statedDegreeRequirement: string;
  degreeRequirementType: "Explicit Bachelor's" | "Explicit Associate's" | "Explicit Graduate/Professional" | "Implicit Bachelor's" | "Implicit Associate's" | "No Degree Found" | "Could Not Determine";
  typeOfOfficialDocument: "regulation" | "statute" | "classification" | "policy" | "administrativeDecision" | "courtDecision" | "jobPosting" |"other";
  reasoning: string;
  }
]`;

    const userPrompt = `<SourceText>${extractedText}</SourceText>
<Instructions>
You are an expert analyst specializing in New Jersey employment degree requirements for state jobs in New Jersey. Your task is to determine if the <jobTitle>${jobTitle}</jobTitle> for a job at the State of New Jersey requires a college degree or higher based *only* on the provided <SourceText> for that job title.

Analyze the <SourceText> provided below for the job title: <jobTitle>${jobTitle}</jobTitle>.

Focus solely on *educational prerequisites* for the job title: <jobTitle>${jobTitle}</jobTitle>.

Do not consider experience substitutions unless they explicitly replace the *entire* educational requirement.

Determine the minimum degree requirement based on the following hierarchy and definitions:

1.  **Explicit Graduate/Professional:** Text explicitly requires a Master's, Doctorate, professional degree (JD, MD, PharmD, DVM etc.), or graduation from a specific post-baccalaureate professional school (e.g., "accredited law school", "medical school").
2.  **Explicit Bachelor's:** Text explicitly requires a "bachelor's degree", "baccalaureate degree", "4-year degree", or graduation from a program *typically* requiring a bachelor's (e.g., "ABET-accredited engineering program" often implies a BS).
3.  **Explicit Associate's:** Text explicitly requires an "associate's degree", "2-year degree", or graduation from a program *typically* awarding an associate's (e.g., "accredited associate degree nursing program").
4.  **Implicit Bachelor's:** Text requires a graduate/professional degree (see #1) which inherently presupposes a Bachelor's, *unless* it's explicitly stated an alternative path exists *without* a prior bachelor's (rare). Flag this as "Implicit Bachelor's". Also consider requirements like "graduation from an accredited 4-year [Type] program" if the degree name isn't mentioned but the duration/accreditation implies it.
5.  **Implicit Associate's:** Text requires graduation from a program *clearly* identifiable as associate-level (e.g., "completion of a 2-year registered nursing program") even if the word "associate's" isn't used.
6.  **No Degree Found:** The text details requirements (like high school diploma, specific training courses, experience, exams) but mentions *no* requirement for an Associate's, Bachelor's, or Graduate/Professional degree, either explicitly or implicitly through program descriptions. High school diploma or GED requirements fall into this category. Specific non-degree training hours (e.g., 1500 hours of cosmetology training) also fall here.
7.  **Could Not Determine:** The text is ambiguous, contradictory, or lacks sufficient detail about educational requirements to make a confident determination.
</Instructions>

Your JSON array output:`;

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

      const analysis = llmResponse as EducationRequirementResearchResult[];

      this.logger.info(
        `Analysis complete for ${jobTitle}`
      );
      await this.updateRangedProgress(
        100,
        `Analysis complete for: ${jobTitle}`
      );

      if (Array.isArray(analysis)) {
        for (const obj of analysis) {
          if (obj && typeof obj === "object") {
            obj.sourceUrl = "file://nj-statutes.txt";
            obj.jobTitle = jobTitle;
            obj.title = title;
          }
        }
      } else {
        throw new Error("LLM response is not an array");
      }

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
