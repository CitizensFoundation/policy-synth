import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsRagDocumentVectorStore } from "../vectorstore/ragDocument.js";

export class PsRagVectorSearch extends PolicySynthAgentBase {
  getChunkId(chunk: PsRagChunk, documentUrl: string): string {
    return `${documentUrl}#${chunk.chunkIndex}#${chunk.chapterIndex}`;
  }

  setupChunkMaps(
    chunkResults: PsRagChunk[],
    documentsMap: Map<string, PsRagDocumentSource>,
    chunksMap: Map<string, PsRagChunk>,
    addedChunkIdsMap: Map<string, Set<string>>
  ) {
    const recursiveChunkId = (chunk: PsRagChunk, documentUrl: string) => {
      chunk.id = this.getChunkId(chunk, documentUrl);
      if (chunk.inChunk) {
        chunk.inChunk.forEach((subChunk) => {
          recursiveChunkId(subChunk, documentUrl);
        });
      }
    };

    let documentUrl: string | undefined;

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
        if (recursiveChunk.inDocument && recursiveChunk.inDocument.length) {
          const doc = recursiveChunk.inDocument[0];
          if (!documentsMap.has(doc.url)) {
            documentsMap.set(doc.url, { ...doc, chunks: [] });
            addedChunkIdsMap.set(doc.url, new Set());
            console.log(`Document initialized: ${doc.url}`);
          }
        }
        if (!chunksMap.has(recursiveChunk.id!)) {
          console.log(`SAVING: ${recursiveChunk.id}`);
          chunksMap.set(recursiveChunk.id!, {
            ...recursiveChunk,
            subChunks: [],
          });
        }
        if (recursiveChunk.inChunk) {
          console.log(
            "----------------------------> RECURSIVE CALL ---------------------->"
          );
          recursivePreProcessChunkResults(recursiveChunk.inChunk);
        }
      });
    };

    recursivePreProcessChunkResults(chunkResults);
  }

  processChunk(
    documentUrl: string,
    chunk: PsRagChunk,
    chunksMap: Map<string, PsRagChunk>,
    documentsMap: Map<string, PsRagDocumentSource>,
    addedChunkIdsMap: Map<string, Set<string>>
  ) {
    const document = documentsMap.get(documentUrl)!;
    console.log(`Processing document ${document.url}`);
    console.log(
      `Processing chunk: ${chunk.id} ${
        chunk.compressedContent ? "Content" : "Summary"
      } IN PARENT: ${chunk.inChunk ? chunk.inChunk[0].id! : ""}`
    );
    let parentChunk;

    if (chunk.inChunk && chunk.inChunk.length) {
      parentChunk = chunksMap.get(chunk.inChunk[0].id!);
    }

    const addedChunkIds = addedChunkIdsMap.get(document.url);

    if (addedChunkIds && addedChunkIds.has(chunk.id!)) {
      console.log(
        `222222222222222222222222 Chunk already processed: ${
          chunk.compressedContent ? "Content" : "Summary"
        } ${chunk.title}`
      );
      return;
    } else if (!addedChunkIds) {
      console.error(
        `!!!!!!!!!!!!!!!!!!!!!!!!!!! Chunk has no ${
          document.url
        } addedChunkIds: ${chunk.compressedContent ? "Content" : "Summary"} ${
          chunk.title
        }`
      );
      return;
    }

    if (parentChunk) {
      parentChunk.subChunks!.push(chunk);
      console.log(
        `\n\n\nChunk ${chunk.id} assigned to chunk parent ${parentChunk.id} in ${document.url}`
      );
      const copy = { ...parentChunk };
      copy.inChunk = undefined;
      console.log(JSON.stringify(copy, null, 2));
    } else if (document) {
      document.chunks!.push(chunk);
      console.log(`Chunk assigned to document: ${document.url}`);
    } else {
      console.error(
        `!!!!!!!!!!!!!!!!!!!!!!!!!!! Chunk not assigned to any parent: ${
          chunk.compressedContent ? "Content" : "Summary"
        } ${chunk.title} ${documentUrl}`
      );
    }
    addedChunkIds.add(chunk.id!); // Mark as processed
    if (chunk.inChunk) {
      this.processChunk(
        document.url,
        chunksMap.get(chunk.inChunk[0].id!)!,
        chunksMap,
        documentsMap,
        addedChunkIdsMap
      );
    } else {
      console.log(
        `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Chunk has no parent: ${
          chunk.compressedContent ? "Content" : "Summary"
        } ${chunk.compressedContent}`
      );
    }
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

      this.setupChunkMaps(
        chunkResults,
        documentsMap,
        chunksMap,
        addedChunkIdsMap
      );

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

        this.processChunk(
          chunk.inDocument![0]!.url!,
          chunk,
          chunksMap,
          documentsMap,
          addedChunkIdsMap
        );
      });

      /*console.log(
        `\n\n\n\addedChunkIdsMap keys:\n${JSON.stringify(
          Array.from(addedChunkIdsMap.keys()),
          null,
          2
        )}\n\n`
      );

      console.log(
        `\n\addedChunkIdsMap values:\n${JSON.stringify(
          Array.from(addedChunkIdsMap.values()),
          null,
          2
        )}\n\n\n\n`
      );*/

      console.log(
        "----------------------------------------------------------------------"
      );

      const logChunks = (chunks: PsRagChunk[]) => {
        chunks.forEach((chunk) => {
          console.log(`Log Log Log Chunk: ${chunk.id}`);
          console.log(JSON.stringify(chunk.subChunks, null, 2));
        });
      };

      //logChunks(Array.from(chunksMap.values()));

      /*console.log(
        `\n\nDocuments values:\n${JSON.stringify(
          Array.from(documentsMap.values()),
          null,
          2
        )}\n\n`
      );*/

      // Wait 3 minutes withn a promise
      /*const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      await wait(180000);*/

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

  formatOutput(documents: PsRagDocumentSource[]): string {
    console.log(
      "Formatting output......................................................."
    );
    //console.log(JSON.stringify(documents, null, 2));
    console.log(
      "Formatting output......................................................."
    );
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
      if (chunk.subChunks && chunk.subChunks.length) {
        chunkOutput += this.appendChunks(chunk.subChunks, level + 1);
      }
    });

    return chunkOutput;
  }
}
