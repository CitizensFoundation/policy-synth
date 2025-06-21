import { BaseIngestionAgent } from "./baseAgent.js";

interface RefineInput {
  title: string;
  shortDescription: string;
  description: string;
  fullDescriptionOfAllContents: string;
  documentDate: string;
  documentMetaData: { [key: string]: string };
  allImageUrls: string[];
  allReferencesWithUrls: { reference: string; url: string }[];
  allOtherReferences: string[];
}

export class DocumentAnalyzerAgent extends BaseIngestionAgent {
  maxAnalyzeTokenLength = 8000;

  systemMessage = this.createSystemMessage(`You are an expert document analyzer.

  Instructions:
  - You will analyze the document.
  - Always output URLs in a proper URL format if you find any and add them to the relevant lists.
  - Only output png, jpg, jpeg, webp, and gif image URLs into the allImageUrls list no text.
  - If you find a document date output it in this format: 1. January 2024 in the documentDate field.
  - Finally, output your analysis in this JSON format without explanations:
  {
    title: string;
    shortDescription: string;
    description: string;
    fullDescriptionOfAllContents: string;
    documentDate: string;
    documentMetaData: { [key: string]: string };
    allImageUrls: string[];
    allReferencesWithUrls: { reference: string; url: string }[];
    allOtherReferences: string[];
  }`);

  userMessage = (data: string) =>
    this.createHumanMessage(`Document to analyze:
${data}

Your JSON analysis:
`);

  finalReviewSystemMessage =
    this.createSystemMessage(`You are an expert document analyze refiner.
Instructions:
- You will recieve a document analysis in JSON format.
- Refine description and shortDescription with all the data from the fullDescriptionOfAllContents.
- Compressed fullDescriptionOfAllContents into compressedFullDescriptionOfAllContents.
- Then output again only the processed JSON fields with the refined shortDescription, description and compressedFullDescriptionOfAllContents without explanations:
{
  shortDescription: string;
  description: string;
  compressedFullDescriptionOfAllContents: string;
}
`);

  finalReviewUserMessage = (analysis: LlmDocumentAnalysisReponse) =>
    this.createHumanMessage(`Document analysis to review:
${JSON.stringify(analysis, null, 2)}

Your refined JSON analysis:
`);

  async analyze(
    fileId: string,
    data: string,
    filesMetaData: Record<string, PsRagDocumentSource> = {}
  ): Promise<PsRagDocumentSource> {
    // Split data if larger than maxAnalyzeTokenLength
    const dataChunks =
      data.length > this.maxAnalyzeTokenLength
        ? this.splitDataForProcessingWorksBigChunks(
            data,
            this.maxAnalyzeTokenLength
          )
        : [data];

    let metadata = filesMetaData[fileId] || ({} as PsRagDocumentSource);

    for (let i = 0; i < dataChunks.length; i++) {
      this.logger.info(`Analyzing chunk ${i + 1} of ${dataChunks.length}`);
      const chunkData = dataChunks[i];
      const documentAnalysis = (await this.callLLM(
        "ingestion-agent",
        this.getFirstMessages(this.systemMessage, this.userMessage(chunkData))
      )) as LlmDocumentAnalysisReponse;

      this.logger.info(
        `Chunk ${i + 1} results: ${JSON.stringify(documentAnalysis, null, 2)}`
      );

      // For the first chunk, initialize metadata with analysis results
      if (i === 0) {
        metadata = {
          ...metadata,
          title: documentAnalysis.title,
          shortDescription: documentAnalysis.shortDescription,
          description: documentAnalysis.description,
          fullDescriptionOfAllContents:
            documentAnalysis.fullDescriptionOfAllContents,
          documentMetaData: documentAnalysis.documentMetaData,
          allReferencesWithUrls: documentAnalysis.allReferencesWithUrls,
          allOtherReferences: documentAnalysis.allOtherReferences,
          allImageUrls: documentAnalysis.allImageUrls,
        };
      } else {
        // For subsequent chunks, update only specific fields
        metadata.fullDescriptionOfAllContents +=
          "\n" + documentAnalysis.fullDescriptionOfAllContents;
        metadata.documentMetaData = {
          ...metadata.documentMetaData,
          ...(typeof documentAnalysis.documentMetaData === "object"
            ? documentAnalysis.documentMetaData
            : {}),
        };
        metadata.allReferencesWithUrls = [
          ...(metadata.allReferencesWithUrls || []),
          ...(Array.isArray(documentAnalysis.allReferencesWithUrls)
            ? documentAnalysis.allReferencesWithUrls
            : []),
        ];
        metadata.allOtherReferences = [
          ...(metadata.allOtherReferences || []),
          ...(Array.isArray(documentAnalysis.allOtherReferences)
            ? documentAnalysis.allOtherReferences
            : []),
        ];
        metadata.allImageUrls = [
          ...(metadata.allImageUrls || []),
          ...(Array.isArray(documentAnalysis.allImageUrls)
            ? documentAnalysis.allImageUrls
            : []),
        ];
      }
    }

    const refineInput = {
      title: metadata.title,
      shortDescription: metadata.shortDescription,
      description: metadata.description,
      fullDescriptionOfAllContents: metadata.fullDescriptionOfAllContents,
      documentDate: metadata.documentMetaData?.documentDate,
      documentMetaData: metadata.documentMetaData,
      allImageUrls: metadata.allImageUrls,
      allReferencesWithUrls: metadata.allReferencesWithUrls,
      allOtherReferences: metadata.allOtherReferences,
    };

    this.logger.info(`Final analysis results: ${JSON.stringify(refineInput, null, 2)}`);

    const refinedMetadata = (await this.callLLM(
      "ingestion-agent",
      this.getFirstMessages(
        this.finalReviewSystemMessage,
        this.finalReviewUserMessage(refineInput as LlmDocumentAnalysisReponse)
      )
    )) as LlmDocumentAnalysisReponse;

    this.logger.info(
      `Review analysis results: ${JSON.stringify(refinedMetadata, null, 2)}`
    );

    metadata.shortDescription = refinedMetadata.shortDescription;
    metadata.description = refinedMetadata.description;
    metadata.compressedFullDescriptionOfAllContents =
      refinedMetadata.compressedFullDescriptionOfAllContents;

    const debugResults = {
      title: metadata.title,
      shortDescription: metadata.shortDescription,
      description: metadata.description,
      fullDescriptionOfAllContents: metadata.fullDescriptionOfAllContents,
      compressedFullDescriptionOfAllContents: metadata.compressedFullDescriptionOfAllContents,
      documentDate: metadata.documentMetaData?.documentDate,
      documentMetaData: metadata.documentMetaData,
      allImageUrls: metadata.allImageUrls,
      allReferencesWithUrls: metadata.allReferencesWithUrls,
      allOtherReferences: metadata.allOtherReferences,
    };

    this.logger.info(
      `Final refined analysis results: ${JSON.stringify(debugResults, null, 2)}`
    );

    filesMetaData[fileId] = metadata;
    return metadata;
  }
}
