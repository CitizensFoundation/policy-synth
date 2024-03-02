import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";

export class IngestionDocAnalyzerAgent extends BaseIngestionAgent {
  maxAnalyzeTokenLength = 8000;

  systemMessage = new SystemMessage(`You are an expert document analyzer.

  Instructions:
  - You will analyze the document and output your analysis in this JSON format without explanations: {
    title: string;
    shortDescription: string;
    description: string;
    fullDescriptionOfAllContents: string;
    documentMetaData: { [key: string]: string };
    allReferencesWithUrls: { reference: string; url: string }[],
    allOtherReferences: strings[]
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
    // Split data if larger than maxAnalyzeTokenLength
    const dataChunks = data.length > this.maxAnalyzeTokenLength
      ? this.splitDataForProcessingWorksBigChunks(data, this.maxAnalyzeTokenLength)
      : [data];

    let metadata = filesMetaData[fileId] || {} as CachedFileMetadata;

    for (let i = 0; i < dataChunks.length; i++) {
      console.log(`Analyzing chunk ${i + 1} of ${dataChunks.length}`)
      const chunkData = dataChunks[i];
      const documentAnalysis = (await this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(this.systemMessage, this.userMessage(chunkData))
      )) as LlmDocumentAnalysisReponse;

      console.log(`Chunk ${i+1} results: ${JSON.stringify(documentAnalysis, null, 2)}`);

      // For the first chunk, initialize metadata with analysis results
      if (i === 0) {
        metadata = {
          ...metadata,
          title: documentAnalysis.title,
          shortDescription: documentAnalysis.shortDescription,
          description: documentAnalysis.description,
          fullDescriptionOfAllContents: documentAnalysis.fullDescriptionOfAllContents,
          documentMetaData: documentAnalysis.documentMetaData,
          allReferencesWithUrls: documentAnalysis.allReferencesWithUrls,
          allOtherReferences: documentAnalysis.allOtherReferences
        };
      } else {
        // For subsequent chunks, update only specific fields
        metadata.fullDescriptionOfAllContents += "\n" + documentAnalysis.fullDescriptionOfAllContents;
        metadata.documentMetaData = {
          ...metadata.documentMetaData,
          ...documentAnalysis.documentMetaData,
        };
        metadata.allReferencesWithUrls = [
          ...(metadata.allReferencesWithUrls || []),
          ...documentAnalysis.allReferencesWithUrls,
        ];
        metadata.allOtherReferences = [
          ...(metadata.allOtherReferences || []),
          ...documentAnalysis.allOtherReferences,
        ];
      }
    }

    console.log(`Final analysis results: ${JSON.stringify(metadata, null, 2)}`);

    filesMetaData[fileId] = metadata;
    return metadata;
  }
}
