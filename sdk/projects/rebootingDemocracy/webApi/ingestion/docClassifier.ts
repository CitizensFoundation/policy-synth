import { PsIngestionConstants } from "./ingestionConstants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
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

export class DocumentClassifierAgent extends BaseIngestionAgent {
  maxAnalyzeTokenLength = 8000;

  systemMessage = (schema: string) => new SystemMessage(`You are an expert classification agent that analyzes content and classifies it.

  Instructions:
  - Use the schema below to classify the content the user will provide you with.
  - Output only the most relevant categories for each category type.
  - Think step by step

  Classification Categories Schema:

  `);

  userMessage = (data: string) =>
    new HumanMessage(`Document to analyze:
${data}

Your JSON analysis:
`);

  reviewSystemMessage =
    new SystemMessage(`You are an expert document analyze refiner.
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

  reviewUserMessage = (analysis: LlmDocumentAnalysisReponse) =>
    new HumanMessage(`Document analysis to review:
${JSON.stringify(analysis, null, 2)}

Your refined JSON analysis:
`);

  async classify(
    fileId: string,
    data: string,
    filesMetaData: Record<string, DocumentSource> = {}
  ): Promise<DocumentSource> {
    // Split data if larger than maxAnalyzeTokenLength
    const dataChunks =
      data.length > this.maxAnalyzeTokenLength
        ? this.splitDataForProcessingWorksBigChunks(
            data,
            this.maxAnalyzeTokenLength
          )
        : [data];

    let metadata = filesMetaData[fileId] || ({} as DocumentSource);

    for (let i = 0; i < dataChunks.length; i++) {
      console.log(`Analyzing chunk ${i + 1} of ${dataChunks.length}`);
      const chunkData = dataChunks[i];
      const documentAnalysis = (await this.callLLM(
        "ingestion-agent",
        PsIngestionConstants.ingestionMainModel,
        this.getFirstMessages(this.systemMessage(""), this.userMessage(chunkData))
      )) as LlmDocumentAnalysisReponse;

      console.log(
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

    console.log(`Final analysis results: ${JSON.stringify(refineInput, null, 2)}`);

    const refinedMetadata = (await this.callLLM(
      "ingestion-agent",
      PsIngestionConstants.ingestionMainModel,
      this.getFirstMessages(
        this.reviewSystemMessage,
        this.reviewUserMessage(refineInput as LlmDocumentAnalysisReponse)
      )
    )) as LlmDocumentAnalysisReponse;

    console.log(
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

    console.log(
      `Final refined analysis results: ${JSON.stringify(debugResults, null, 2)}`
    );

    filesMetaData[fileId] = metadata;
    return metadata;
  }
}
