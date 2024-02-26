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

  userMessage = (data: string) =>
    new HumanMessage(`Document to analyze:
${data}
`);

  async analyze(
    fileId: string,
    data: string,
    filesMetaData: Record<string, CachedFileMetadata> = {}
  ): Promise<CachedFileMetadata> {
    const documentAnalysis = (await this.callLLM(
      "ingestion-agent",
      IEngineConstants.ingestionModel,
      this.getFirstMessages(this.systemMessage, this.userMessage(data))
    )) as LlmDocumentAnalysisReponse;

    console.log(JSON.stringify(documentAnalysis, null, 2));

    // Update metadata with analysis results
    let metadata = filesMetaData[fileId];
    if (!metadata) {
      metadata = filesMetaData[fileId] = {} as any;
    }

    metadata.title = documentAnalysis.title;
    metadata.shortDescription = documentAnalysis.shortDescription;
    metadata.description = documentAnalysis.description;
    metadata.documentMetaData = {
      ...(metadata.documentMetaData || {}),
      ...documentAnalysis.documentMetaData,
    };
    metadata.references = [
      ...(metadata.references || []),
      ...documentAnalysis.references,
    ];

    return metadata;
  }
}
