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
    // Your existing logic to rewrite userQuestion and perform searches
    const vectorStore = new PsRagDocumentVectorStore();

    /*const [documentResults, chunkResults] = await Promise.all([
      vectorStore.searchDocuments(userQuestion),
      vectorStore.searchChunksWithReferences(userQuestion),
    ]);

    // Process results
    const processedResults = this.processAndMergeResults(
      documentResults,
      chunkResults
    );*/

    const [chunkResults] = await Promise.all([
      vectorStore.searchChunksWithReferences(userQuestion),
    ]);

    // Format and return the output
    return this.formatOutput(chunkResults as any);
  }

  processAndMergeResults(
    documentResults: PsRagDocumentSourceGraphQlResponse,
    documentsWithChunksResults: PsRagDocumentSource[]
  ): PsRagDocumentSource[] {
    // Initialize a map to hold documents from documentResults, keyed by ID
    const ragDocumentsMap = new Map<string, PsRagDocumentSource>();

    // Add documents from documentResults to the map if they meet Elo rating criteria
    documentResults.data.Get.RagDocument.forEach(
      (document: PsRagDocumentSource) => {
        if (
          (document.relevanceEloRating &&
            document.relevanceEloRating >=
              this.minQualityEloRatingForDocument) ||
          (document.substanceEloRating &&
            document.substanceEloRating >= this.minQualityEloRatingForDocument)
        ) {
          ragDocumentsMap.set(document.id!, { ...document, chunks: [] });
        }
      }
    );

    // Now integrate documentsWithChunksResults, which are already associated with their chunks
    documentsWithChunksResults.forEach((docWithChunks: PsRagDocumentSource) => {
      // Check if the document is already in the map (it meets the Elo rating criteria)
      if (ragDocumentsMap.has(docWithChunks.id!)) {
        // Get the document from the map
        const document = ragDocumentsMap.get(docWithChunks.id!);

        // Iterate over chunks in the current document from documentsWithChunksResults
        docWithChunks.chunks?.forEach((chunk) => {
          // Check if the chunk meets the Elo rating criteria
          if (
            (chunk.relevanceEloRating &&
              chunk.relevanceEloRating >= this.minQualityEloRatingForChunk) ||
            (chunk.substanceEloRating &&
              chunk.substanceEloRating >= this.minQualityEloRatingForChunk)
          ) {
            // Add the chunk to the document's chunk array
            document?.chunks?.push(chunk);
          }
        });
      }
    });

    return Array.from(ragDocumentsMap.values());
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
