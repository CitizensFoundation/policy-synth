import { BaseIngestionAgent } from "./baseAgent.js";
export class IngestionChunkAnalzyerAgent extends BaseIngestionAgent {
    analysisSystemMessage = this.createSystemMessage(`You are an expert text analyzer.

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
    analysisUserMessage = (data) => this.createHumanMessage(`Text to analyze:
${data}
Your analysis in JSON format:
`);
    async analyze(data) {
        try {
            const analyze = (await this.callLLM("ingestion-agent", this.getFirstMessages(this.analysisSystemMessage, this.analysisUserMessage(data))));
            return analyze;
        }
        catch (error) {
            throw Error(`Analyzis failed: ${error}`);
        }
    }
}
//# sourceMappingURL=chunkAnalyzer.js.map