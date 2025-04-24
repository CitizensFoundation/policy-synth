// src/analyzerAgent.ts
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";

// Expected JSON output structure from the LLM

export class DegreeRequirementAnalyzerAgent extends PolicySynthAgent {
  memory: LicenseDegreeAnalysisMemoryData;

  // Use a reasoning model
  modelSize: PsAiModelSize = PsAiModelSize.Medium; // Or Large for complex analysis
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
    memory: LicenseDegreeAnalysisMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  async analyze(
    extractedText: string,
    licenseType: string,
    sourceUrl: string
  ): Promise<LicenseDegreeAnalysisResult | { error: string }> {
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
      `Analyzing requirements for: ${licenseType}`
    );
    this.logger.info(
      `Analyzing extracted text for ${licenseType} from ${sourceUrl}`
    );

    if (!extractedText || extractedText.trim().length === 0) {
      this.logger.warn(`Cannot analyze empty text for ${licenseType}`);
      return { error: "Input text for analysis is empty." };
    }

    const systemPrompt = `You are an expert analyst specializing in occupational licensing requirements in New Jersey. Your task is to determine if obtaining a specific license requires a college degree (Associate's, Bachelor's, Graduate/Professional) based *only* on the provided text, which comes from an official source (statute, regulation, board website).

Analyze the <SourceText> provided below for the license type: "${licenseType}".

Focus solely on *educational prerequisites* for *initial licensure*. Do not consider experience substitutions unless they explicitly replace the *entire* educational requirement.

Determine the minimum degree requirement based on the following hierarchy and definitions:

1.  **Explicit Graduate/Professional:** Text explicitly requires a Master's, Doctorate, professional degree (JD, MD, PharmD, DVM etc.), or graduation from a specific post-baccalaureate professional school (e.g., "accredited law school", "medical school").
2.  **Explicit Bachelor's:** Text explicitly requires a "bachelor's degree", "baccalaureate degree", "4-year degree", or graduation from a program *typically* requiring a bachelor's (e.g., "ABET-accredited engineering program" often implies a BS).
3.  **Explicit Associate's:** Text explicitly requires an "associate's degree", "2-year degree", or graduation from a program *typically* awarding an associate's (e.g., "accredited associate degree nursing program").
4.  **Implicit Bachelor's:** Text requires a graduate/professional degree (see #1) which inherently presupposes a Bachelor's, *unless* it's explicitly stated an alternative path exists *without* a prior bachelor's (rare). Flag this as "Implicit Bachelor's". Also consider requirements like "graduation from an accredited 4-year [Type] program" if the degree name isn't mentioned but the duration/accreditation implies it.
5.  **Implicit Associate's:** Text requires graduation from a program *clearly* identifiable as associate-level (e.g., "completion of a 2-year registered nursing program") even if the word "associate's" isn't used.
6.  **No Degree Found:** The text details requirements (like high school diploma, specific training courses, experience, exams) but mentions *no* requirement for an Associate's, Bachelor's, or Graduate/Professional degree, either explicitly or implicitly through program descriptions. High school diploma or GED requirements fall into this category. Specific non-degree training hours (e.g., 1500 hours of cosmetology training) also fall here.
7.  **Could Not Determine:** The text is ambiguous, contradictory, or lacks sufficient detail about educational requirements to make a confident determination.

Output Instructions:
Return your analysis *only* as a JSON object adhering strictly to the following format:
{
  "degreeRequiredStatus": "string", // Must be one of: "Explicit Bachelor's", "Explicit Associate's", "Explicit Graduate/Professional", "Implicit Bachelor's", "Implicit Associate's", "No Degree Found", "Could Not Determine"
  "supportingEvidence": "string", // Quote the *exact* key sentence(s) or phrase(s) from the <SourceText> that justify your conclusion. Keep it concise (1-3 relevant snippets). If "No Degree Found", state that no degree requirement was mentioned. If "Could Not Determine", explain the ambiguity briefly.
  "confidenceScore": number, // Your confidence level (0.0 to 1.0) based on the clarity and explicitness of the text. Explicit mentions = higher confidence (0.8-1.0), Implicit = medium (0.6-0.8), No mention = high if requirements are detailed otherwise (0.8-0.9), Ambiguous = low (0.1-0.5).
  "reasoning": "string" // A brief (1-2 sentence) explanation of *why* you chose that status based on the evidence and rules.
}

Do NOT include any text before or after the JSON object.
`;

    const userPrompt = `

<SourceText>
${extractedText}
</SourceText>

Your JSON output:`;

    try {
      const messages = [
        this.createSystemMessage(systemPrompt),
        this.createHumanMessage(userPrompt),
      ];
      // Use a large model for better reasoning on potentially long text
      const llmResponse = await this.callModel(
        PsAiModelType.TextReasoning, // Use reasoning model
        PsAiModelSize.Large, // Potentially use Large model for better analysis
        messages,
        true
      );

      this.logger.debug(`LLM response: ${JSON.stringify(llmResponse, null, 2)}`);

      // Attempt to parse the JSON response
      const analysis = llmResponse as LicenseDegreeAnalysisResult;

      // Basic validation of the response structure
      if (
        !analysis ||
        typeof analysis !== "object" ||
        !analysis.degreeRequiredStatus ||
        !analysis.supportingEvidence ||
        typeof analysis.confidenceScore !== "number"
      ) {
        this.logger.error(
          `LLM response parsing failed or invalid structure for ${licenseType}. Response: ${JSON.stringify(
            llmResponse
          )}`
        );
        this.memory.llmErrors.push(
          `Analyzer LLM Parsing Error (${licenseType}): Invalid JSON structure`
        );
        return {
          error: `LLM analysis failed for ${licenseType}: Invalid response structure.`,
        };
      }

      this.logger.info(
        `Analysis complete for ${licenseType}: Status=${analysis.degreeRequiredStatus}, Confidence=${analysis.confidenceScore}`
      );
      await this.updateRangedProgress(
        100,
        `Analysis complete for: ${licenseType}`
      );

      return analysis;
    } catch (error: any) {
      this.logger.error(
        `Error during LLM analysis for ${licenseType}: ${error.message}`
      );
      this.memory.llmErrors.push(
        `Analyzer LLM Error (${licenseType}): ${error.message}`
      );
      await this.updateRangedProgress(
        100,
        `Analysis failed for: ${licenseType}`
      );
      return {
        error: `LLM analysis failed for ${licenseType}: ${error.message}`,
      };
    }
  }

  async process() {
    throw new Error(
      "Process method not implemented for direct use. Call analyze instead."
    );
  }
}
