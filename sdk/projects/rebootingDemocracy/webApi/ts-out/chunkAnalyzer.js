import { BaseIngestionAgent } from "./baseAgent.js";
import { PsIngestionConstants } from "./ingestionConstants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export class IngestionChunkAnalzyerAgent extends BaseIngestionAgent {
    analyzisSystemMessage = new SystemMessage(`You are an expert text analyzer.

Instructions:
- You will analyze the text for metadata and add title, a short description and a full description of all the contents.
- Only output JSON without any explanations.

Output:
- Output your analysis in this JSON format: {
  fullDescription: string;
  shortDescription: string;
  title: string;
  textMetaData: { [key: string]: string };
  mainExternalUrlFound: string;
}`);
    analyzisUserMessage = (data) => new HumanMessage(`Document to analyze:
${data}
Your analyzis in JSON format:
`);
    async analyze(data) {
        this.resetLlmTemperature();
        try {
            const analyze = (await this.callLLM("ingestion-agent", PsIngestionConstants.ingestionMainModel, this.getFirstMessages(this.analyzisSystemMessage, this.analyzisUserMessage(data))));
            return analyze;
        }
        catch (error) {
            throw Error(`Analyzis failed: ${error}`);
        }
    }
}
