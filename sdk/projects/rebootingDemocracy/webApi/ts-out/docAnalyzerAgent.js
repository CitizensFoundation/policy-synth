import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export class IngestionDocAnalyzerAgent extends BaseIngestionAgent {
    maxAnalyzeTokenLength = 8000;
    systemMessage = new SystemMessage(`You are an expert document analyzer.

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
    userMessage = (data) => new HumanMessage(`Document to analyze:
${data}

Your JSON analysis:
`);
    finalReviewSystemMessage = new SystemMessage(`You are an expert document analyze refiner.
Instructions:
- You will recieve a document analysis in JSON format.
- Please refine the fullDescriptionOfAllContents has been collected part by part in a loop, but keep all the data and all text do not remove anything from there.
- Then refine the shortDescription and description with all the data from the fullDescriptionOfAllContents.
- Then output again the full JSON but with the refined shortDescription, description and fullDescriptionOfAllContents without explanations:
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
}
`);
    finalReviewUserMessage = (analysis) => new HumanMessage(`Document analyzis to review:
${JSON.stringify(analysis, null, 2)}

Your refined JSON analysis:
`);
    async analyze(fileId, data, filesMetaData = {}) {
        // Split data if larger than maxAnalyzeTokenLength
        const dataChunks = data.length > this.maxAnalyzeTokenLength
            ? this.splitDataForProcessingWorksBigChunks(data, this.maxAnalyzeTokenLength)
            : [data];
        let metadata = filesMetaData[fileId] || {};
        for (let i = 0; i < dataChunks.length; i++) {
            console.log(`Analyzing chunk ${i + 1} of ${dataChunks.length}`);
            const chunkData = dataChunks[i];
            const documentAnalysis = (await this.callLLM("ingestion-agent", IEngineConstants.ingestionModel, this.getFirstMessages(this.systemMessage, this.userMessage(chunkData))));
            console.log(`Chunk ${i + 1} results: ${JSON.stringify(documentAnalysis, null, 2)}`);
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
                    allOtherReferences: documentAnalysis.allOtherReferences,
                    allImageUrls: documentAnalysis.allImageUrls,
                };
            }
            else {
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
        console.log(`Final analysis results: ${JSON.stringify(metadata, null, 2)}`);
        const refinedMetadata = (await this.callLLM("ingestion-agent", IEngineConstants.ingestionModel, this.getFirstMessages(this.finalReviewSystemMessage, this.finalReviewUserMessage(metadata))));
        metadata.shortDescription = refinedMetadata.shortDescription;
        metadata.description = refinedMetadata.description;
        metadata.fullDescriptionOfAllContents =
            refinedMetadata.fullDescriptionOfAllContents;
        console.log(`Final refined analysis results: ${JSON.stringify(metadata, null, 2)}`);
        filesMetaData[fileId] = metadata;
        return metadata;
    }
}
