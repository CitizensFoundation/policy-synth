import { BaseIngestionAgent } from "./baseAgent.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";

export class EcasYayChunkAnalyserAgent extends BaseIngestionAgent {
  analysisSystemMessage =
    this.createSystemMessage(`You are an expert EU question and answer analyizer.

Instructions:
- You will analyze the question answer pair to see if it is euWide or country specific.
- Only output JSON without any explanations.

Output:
- Output your analysis in this JSON format: {
  isEuWideOrCountrySpecific?: "euWide" | "countrySpecific" | "unknown";
}
`);

  analysisUserMessage = (question: string, answer: string) =>
    this.createHumanMessage(`Question and answer to analyze:
Question: ${question}
Answer: ${answer}
Your analysis in JSON format:
`);

  async analyze(
    question: string,
    answer: string
  ): Promise<PsEcasYeaRagChunkAnalysis> {

    try {
      const analyze = (await this.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Medium,
        this.getFirstMessages(
          this.analysisSystemMessage,
          this.analysisUserMessage(question, answer)
        )
      )) as PsEcasYeaRagChunkAnalysis;
      return analyze;
    } catch (error) {
      throw Error(`Analyzis failed: ${error}`);
    }
  }
}
