import { BaseIngestionAgent } from "./baseAgent.js";
import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export class IngestionChunkAnalzyerAgent extends BaseIngestionAgent {
  analyzisSystemMessage = new SystemMessage(`You are an expert text analyzer.

Instructions:
- You will analyze the text for metadata and add title and a short description.
- Only output JSON without any explanations.

Output:
- Output your analysis in this JSON format: {
  title: string;
  shortDescription: string;
  fullDescription: string;
  textMetaData: { [key: string]: string };
  mainExternalUrlFound: string;
}`);

  analyzisUserMessage = (data: string) =>
    new HumanMessage(`Document to analyze:
${data}
Your analyzis in JSON format:
`);

  async analyze(data: string): Promise<LlmChunkAnalysisReponse> {
    this.resetLlmTemperature();

    try {
      const analyze = (await this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.analyzisSystemMessage,
          this.analyzisUserMessage(data)
        )
      )) as LlmChunkAnalysisReponse;
      return analyze;
    } catch (error) {
      throw Error(`Analyzis failed: ${error}`);
    }
  }
}
