import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export class IngestionDocAnalyzerAgent extends BaseIngestionAgent {
    systemMessage = new SystemMessage(`You are an expert document analyze.

  Instructions:
  - You will analyze the document and output your analysis in this JSON format: {
    title: string;
    shortDescription: string;
    description: string;
    fullDescriptionOfAllContents: string;
    documentMetaData: { [key: string]: string };
    references: string[],
    allUrls: strings[]
  }`);
    userMessage = (data) => new HumanMessage(`Document to analyze:
${data}
`);
    async analyze(fileId, data, filesMetaData = {}) {
        const documentAnalysis = (await this.callLLM("ingestion-agent", IEngineConstants.ingestionModel, this.getFirstMessages(this.systemMessage, this.userMessage(data))));
        // Update metadata with analysis results
        let metadata = filesMetaData[fileId];
        if (!metadata) {
            metadata = filesMetaData[fileId] = {};
        }
        metadata.title = documentAnalysis.title;
        metadata.shortDescription = documentAnalysis.shortDescription;
        metadata.description = documentAnalysis.description;
        metadata.documentMetaData = {
            ...metadata.documentMetaData,
            ...documentAnalysis.documentMetaData,
        };
        metadata.references = [
            ...metadata.references,
            ...documentAnalysis.references,
        ];
        return metadata;
    }
}
