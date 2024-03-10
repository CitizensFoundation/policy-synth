import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsRagDocumentVectorStore } from "../vectorstore/ragDocument.js";

export class PsRagVectorSearch extends PolicySynthAgentBase {
  minQualityEloRatingForChunk = 900;
  minQualityEloRatingForDocument = 1000; // Adjust as needed

  async search(
    userQuestion: string,
    routingData: PsRagRoutingResponse,
    dataLayout: PsIngestionDataLayout
  ): Promise<string> {
    const vectorStore = new PsRagDocumentVectorStore();

    const [chunkResults] = await Promise.all([
      vectorStore.searchChunksWithReferences(userQuestion),
    ]);

    // Format and return the output
    return this.formatOutput(chunkResults as any);
  }

  formatOutput(processedResults: PsRagChunk[]) {
    console.log(`Processed results: ${JSON.stringify(processedResults, null, 2)}`);
    let output = "";
    const collectedTitles = new Set<string>();

    // Function to recursively collect chunk information, including all nested inChunks
    const collectChunks = (
      chunk: PsRagChunk,
      collectedChunks: PsRagChunk[] = []
    ) => {
      if (chunk.inChunk) {
        collectChunks(chunk.inChunk[0], collectedChunks);
      }
      collectedChunks.push(chunk);
      return collectedChunks;
    };

    // Process each chunk to collect information in reverse order (deepest first)
    processedResults.forEach((chunk) => {
      if (chunk.inDocument) {
        const doc = chunk.inDocument[0];
        const docTitle = doc.title || "No title available";
        collectedTitles.add(docTitle);
        const docSummary =
          doc.compressedFullDescriptionOfAllContents ||
          doc.fullDescriptionOfAllContents ||
          "";
        // Placing inDocument details at the start of the output
        output += `Document title: ${docTitle}\n\nAbout document:\n${docSummary}\n\n`;
      }

      const collectedChunks = collectChunks(chunk);
      // Append each collected chunk's information to the output
      collectedChunks.forEach(({ title, compressedContent, fullSummary }) => {
        output += `Chapter: ${title || 'undefined'}\n${compressedContent || fullSummary || ''}\n\n`;
      });
    });

    console.log(output);
    return output;
  }
}
