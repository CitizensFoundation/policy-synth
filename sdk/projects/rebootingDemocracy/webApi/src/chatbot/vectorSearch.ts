import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsRagDocumentVectorStore } from "../vectorstore/ragDocument.js";

export class PsRagVectorSearch extends PolicySynthAgentBase {
  getChunkId(chunk: PsRagChunk, documentUrl: string): string {
    return `${documentUrl}#${chunk.chunkIndex}#${chunk.chapterIndex}`;
  }

  async search(
    userQuestion: string,
    routingData: any,
    dataLayout: any
  ): Promise<string> {
    const vectorStore = new PsRagDocumentVectorStore();
    try {
      const chunkResults: PsRagChunk[] =
        await vectorStore.searchChunksWithReferences(userQuestion);

      /*console.log(
      "Initial chunk results received:",
      JSON.stringify(chunkResults, null, 2)
    );*/

      const documentsMap: Map<string, PsRagDocumentSource> = new Map();
      const chunksMap: Map<string, PsRagChunk> = new Map();
      const addedChunkIdsMap: Map<string, Set<string>> = new Map(); // Tracks added chunk IDs for each document

      // Go through all the chunks and subChunks recursively and do cunk.id = this.getChunkId(chunk, documentUrl)
      let documentUrl: string | undefined;

      const recursiveChunkId = (chunk: PsRagChunk, documentUrl: string) => {
        chunk.id = this.getChunkId(chunk, documentUrl);
        if (chunk.inChunk) {
          chunk.inChunk.forEach((subChunk) => {
            recursiveChunkId(subChunk, documentUrl);
          });
        }
      };

      chunkResults.forEach((chunk) => {
        if (chunk.inDocument && chunk.inDocument.length) {
          documentUrl = chunk.inDocument[0].url;
          recursiveChunkId(chunk, documentUrl);
        }
      });

      //console.log(JSON.stringify(chunkResults, null, 2));

      const recursivePreProcessChunkResults = (chunkResults: PsRagChunk[]) => {
        chunkResults.forEach((recursiveChunk) => {
          console.log(
            `Processing chunk ${
              recursiveChunk.compressedContent ? "Content" : "Summary"
            }: ${recursiveChunk.id} `
          );
          if (!chunksMap.has(recursiveChunk.id!)) {
            chunksMap.set(recursiveChunk.id!, {
              ...recursiveChunk,
              subChunks: [],
            });
          }
          if (recursiveChunk.inDocument && recursiveChunk.inDocument.length) {
            const doc = recursiveChunk.inDocument[0];
            if (!documentsMap.has(doc.url)) {
              documentsMap.set(doc.url, { ...doc, chunks: [] });
              addedChunkIdsMap.set(doc.url, new Set());
              console.log(`Document initialized: ${doc.url}`);
            }
          }
          this.processChunk(
            recursiveChunk,
            chunksMap,
            documentsMap,
            addedChunkIdsMap
          );
          if (recursiveChunk.inChunk) {
            console.log(
              "----------------------------> RECURSIVE CALL ---------------------->"
            );
            recursivePreProcessChunkResults(recursiveChunk.inChunk);
          }
        });
      };

      recursivePreProcessChunkResults(chunkResults);

      chunkResults.forEach((chunk) => {
        if (chunk._additional) {
          console.log(`\n\n${chunk.title}`);
          console.log(
            `C: ${
              chunk.compressedContent && chunk.compressedContent != ""
                ? "Content"
                : "Summary"
            }`
          );
          console.log(
            `\nChunk info: ${chunk._additional.id} with distance: ${chunk._additional.distance} and confidence: ${chunk._additional.certainty}`
          );
          console.log(
            `Chunk info: ${chunk._additional.id} with relevance: ${chunk.relevanceEloRating}} and substance: ${chunk.substanceEloRating} and quality: ${chunk.qualityEloRating}\n\n`
          );
        }
        this.processChunk(chunk, chunksMap, documentsMap, addedChunkIdsMap);
      });

      const recursiveSortChunks = (chunk: PsRagChunk) => {
        if (chunk.subChunks && chunk.subChunks.length) {
          chunk.subChunks.sort((a, b) => a.chapterIndex - b.chapterIndex);
          chunk.subChunks.forEach((subChunk) => {
            recursiveSortChunks(subChunk);
          });
        }
      };

      chunkResults.forEach((chunk) => {
        recursiveSortChunks(chunk);
      });

      console.log("Processed chunk assignments complete.");
      return this.formatOutput(Array.from(documentsMap.values()));
    } catch (error) {
      console.error("Error in search:", error);
      return "Error in search";
    }
  }

  processChunk(
    chunk: PsRagChunk,
    chunksMap: Map<string, PsRagChunk>,
    documentsMap: Map<string, PsRagDocumentSource>,
    addedChunkIdsMap: Map<string, Set<string>>
  ) {
    console.log(
      `Processing chunk: ${chunk.compressedContent ? "Content" : "Summary"} ${
        chunk.inChunk ? chunk.inChunk[0].id! : ""
      }`
    );
    const parentChunk =
      chunk.inChunk && chunk.inChunk.length
        ? chunksMap.get(chunk.inChunk[0].id!)
        : null;

    const doc =
      chunk.inDocument && chunk.inDocument.length
        ? documentsMap.get(chunk.inDocument[0].url)
        : null;
    const addedChunkIds = doc
      ? addedChunkIdsMap.get(chunk.inDocument![0].url)
      : null;

    if (!addedChunkIds || addedChunkIds.has(chunk.id!)) return; // Skip if already processed

    if (parentChunk) {
      parentChunk.subChunks!.push(chunk);
      console.log(
        `Chunk assigned to chunk parent: ${
          chunk.compressedContent ? "Content" : "Summary"
        } ${chunk.title} in ${parentChunk.title}`
      );
      if (!parentChunk.inChunk && !doc?.chunks?.includes(parentChunk)) {
        doc!.chunks!.push(parentChunk);
      }
    } else if (doc) {
      doc.chunks!.push(chunk);
      console.log(
        `Chunk assigned to document: ${
          chunk.compressedContent ? "Content" : "Summary"
        } ${chunk.title} in ${doc.title}`
      );
    } else {
      console.error(
        `!!!!!!!!!!!!!!!!!!!!!!!!!!! Chunk not assigned to any parent: ${
          chunk.compressedContent ? "Content" : "Summary"
        } ${chunk.title}`
      );
    }

    if (chunk.inChunk) {
      this.processChunk(
        chunk.inChunk[0],
        chunksMap,
        documentsMap,
        addedChunkIdsMap
      );
    } else {
      console.log(
        `Chunk has no parent: ${
          chunk.compressedContent ? "Content" : "Summary"
        } ${chunk.title}`
      );
    }

    addedChunkIds.add(chunk.id!); // Mark as processed
  }

  formatOutput(documents: PsRagDocumentSource[]): string {
    console.log(
      "Formatting output....,..................................................."
    );
    console.log(JSON.stringify(documents, null, 2));
    let output = "";

    documents.forEach((doc) => {
      if (!doc.title && !doc.url) return; // Skip empty DocumentSource
      console.log(`Formatting document: ${doc.shortDescription || doc.title}`);
      output += `Document: ${doc.shortDescription || doc.title}\nURL: ${
        doc.url
      }\n\n`;
      output += this.appendChunks(doc.chunks!, 1);
    });

    console.log("Final output:", output);
    return output.trim(); // Remove trailing new lines
  }

  appendChunks(chunks: PsRagChunk[], level: number): string {
    let chunkOutput = "";

    chunks.forEach((chunk) => {
      const prefix = `${" ".repeat(level * 2)}Chapter (${
        chunk.compressedContent ? "Content" : "Summary"
      }): `;
      console.log(`${prefix}${chunk.title}`);
      chunkOutput += `${prefix}${chunk.title}\n${" ".repeat(level * 2)}${
        chunk.compressedContent || chunk.fullSummary
      }\n\n`;
      if (chunk.inChunk && chunk.inChunk.length) {
        chunkOutput += this.appendChunks(chunk.inChunk, level + 1);
      }
    });

    return chunkOutput;
  }
}
