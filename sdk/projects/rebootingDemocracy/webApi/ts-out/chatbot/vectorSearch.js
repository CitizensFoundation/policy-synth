import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsRagDocumentVectorStore } from "../vectorstore/ragDocument.js";
export class PsRagVectorSearch extends PolicySynthAgentBase {
    getChunkId(chunk, documentUrl) {
        return `${documentUrl}#${chunk.chunkIndex}#${chunk.chapterIndex}`;
    }
    setupChunkMaps(chunkResults, documentsMap, chunksMap, addedChunkIdsMap) {
        const recursiveChunkId = (chunk, documentUrl) => {
            chunk.id = this.getChunkId(chunk, documentUrl);
            if (chunk.inChunk) {
                chunk.inChunk.forEach((subChunk) => {
                    recursiveChunkId(subChunk, documentUrl);
                });
            }
        };
        let documentUrl;
        chunkResults.forEach((chunk) => {
            if (chunk.inDocument && chunk.inDocument.length) {
                documentUrl = chunk.inDocument[0].url;
                recursiveChunkId(chunk, documentUrl);
            }
        });
        //console.log(JSON.stringify(chunkResults, null, 2));
        const recursivePreProcessChunkResults = (chunkResults) => {
            chunkResults.forEach((recursiveChunk) => {
                console.log(`Processing chunk ${recursiveChunk.compressedContent ? "Content" : "Summary"}: ${recursiveChunk.id} `);
                if (recursiveChunk.inDocument && recursiveChunk.inDocument.length) {
                    const doc = recursiveChunk.inDocument[0];
                    if (!documentsMap.has(doc.url)) {
                        documentsMap.set(doc.url, { ...doc, chunks: [] });
                        addedChunkIdsMap.set(doc.url, new Set());
                        console.log(`Document initialized: ${doc.url}`);
                    }
                }
                if (!chunksMap.has(recursiveChunk.id)) {
                    console.log(`SAVING: ${recursiveChunk.id}`);
                    chunksMap.set(recursiveChunk.id, {
                        ...recursiveChunk,
                        subChunks: [],
                    });
                }
                if (recursiveChunk.inChunk) {
                    console.log("----------------------------> RECURSIVE CALL ---------------------->");
                    recursivePreProcessChunkResults(recursiveChunk.inChunk);
                }
            });
        };
        recursivePreProcessChunkResults(chunkResults);
    }
    processChunk(documentUrl, chunk, chunksMap, documentsMap, addedChunkIdsMap) {
        const document = documentsMap.get(documentUrl);
        console.log(`Processing document ${document.url}`);
        console.log(`Processing chunk: ${chunk.id} ${chunk.compressedContent ? "Content" : "Summary"} IN PARENT: ${chunk.inChunk ? chunk.inChunk[0].id : ""}`);
        let parentChunk;
        if (chunk.inChunk && chunk.inChunk.length) {
            parentChunk = chunksMap.get(chunk.inChunk[0].id);
        }
        const addedChunkIds = addedChunkIdsMap.get(document.url);
        if (addedChunkIds && addedChunkIds.has(chunk.id)) {
            console.log(`222222222222222222222222 Chunk already processed: ${chunk.compressedContent ? "Content" : "Summary"} ${chunk.title}`);
            return;
        }
        else if (!addedChunkIds) {
            console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!! Chunk has no ${document.url} addedChunkIds: ${chunk.compressedContent ? "Content" : "Summary"} ${chunk.title}`);
            return;
        }
        if (parentChunk) {
            parentChunk.subChunks.push(chunk);
            console.log(`\n\n\nChunk ${chunk.id} assigned to chunk parent ${parentChunk.id} in ${document.url}`);
            chunk.inChunk = [parentChunk];
            chunk.inDocument = undefined;
        }
        else if (document) {
            document.chunks.push(chunk);
            console.log(`Chunk assigned to document: ${document.url}`);
            chunk.inDocument = [document];
        }
        else {
            console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!! Chunk not assigned to any parent: ${chunk.compressedContent ? "Content" : "Summary"} ${chunk.title} ${documentUrl}`);
        }
        addedChunkIds.add(chunk.id); // Mark as processed
        if (chunk.inChunk) {
            this.processChunk(document.url, chunksMap.get(chunk.inChunk[0].id), chunksMap, documentsMap, addedChunkIdsMap);
        }
    }
    async search(userQuestion, routingData, dataLayout) {
        const vectorStore = new PsRagDocumentVectorStore();
        try {
            const chunkResults = await vectorStore.searchChunksWithReferences(userQuestion);
            /*console.log(
            "Initial chunk results received:",
            JSON.stringify(chunkResults, null, 2)
          );*/
            const documentsMap = new Map();
            const chunksMap = new Map();
            const addedChunkIdsMap = new Map(); // Tracks added chunk IDs for each document
            this.setupChunkMaps(chunkResults, documentsMap, chunksMap, addedChunkIdsMap);
            chunkResults.forEach((chunk) => {
                if (chunk._additional) {
                    console.log(`\n\n${chunk.title}`);
                    console.log(`C: ${chunk.compressedContent && chunk.compressedContent != ""
                        ? "Content"
                        : "Summary"}`);
                    console.log(`\nChunk info: ${chunk._additional.id} with distance: ${chunk._additional.distance} and confidence: ${chunk._additional.certainty}`);
                    console.log(`Chunk info: ${chunk._additional.id} with relevance: ${chunk.relevanceEloRating}} and substance: ${chunk.substanceEloRating} and quality: ${chunk.qualityEloRating}\n\n`);
                }
                this.processChunk(chunk.inDocument[0].url, chunk, chunksMap, documentsMap, addedChunkIdsMap);
                const currentChunk = chunksMap.get(chunk.id);
                if (chunk.mostRelevantSiblingChunks && chunk.mostRelevantSiblingChunks.length) {
                    chunk.mostRelevantSiblingChunks.forEach((siblingChunk) => {
                        if (currentChunk.inChunk && currentChunk.inChunk.length) {
                            const parentChunk = chunksMap.get(currentChunk.inChunk[0].id);
                            if (parentChunk) {
                                parentChunk.subChunks.push(siblingChunk);
                                console.log(`Sibling chunk assigned to parent chunk: ${parentChunk.id}`);
                            }
                            else {
                                console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!! Sibling chunk not assigned to any parent: ${siblingChunk.compressedContent ? "Content" : "Summary"} ${siblingChunk.title}`);
                            }
                        }
                        else if (currentChunk.inDocument && currentChunk.inDocument.length) {
                            console.log(`Sibling chunk assigned to document: ${currentChunk.inDocument[0].url}`);
                            const currentDocument = documentsMap.get(currentChunk.inDocument[0].url);
                            currentDocument.chunks.push(siblingChunk);
                        }
                    });
                }
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
            console.log("----------------------------------------------------------------------");
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
            const recursiveSortChunks = (chunk) => {
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
        }
        catch (error) {
            console.error("Error in search:", error);
            return "Error in search";
        }
    }
    formatOutput(documents) {
        console.log("Formatting output.......................................................");
        //console.log(JSON.stringify(documents, null, 2));
        console.log("Formatting output.......................................................");
        let output = "";
        documents.forEach((doc) => {
            if (!doc.title && !doc.url)
                return; // Skip empty DocumentSource
            console.log(`Formatting document: ${doc.shortDescription || doc.title}`);
            output += `Document: ${doc.shortDescription || doc.title}\nURL: ${doc.url}\n\n`;
            output += this.appendChunks(doc.chunks, 1);
        });
        console.log("Final output:", output);
        return output.trim(); // Remove trailing new lines
    }
    appendChunks(chunks, level) {
        let chunkOutput = "";
        chunks.forEach((chunk) => {
            const prefix = `${" ".repeat(level * 2)}Chapter (${chunk.compressedContent ? "Content" : "Summary"}): `;
            console.log(`${prefix}${chunk.title}`);
            chunkOutput += `${prefix}${chunk.title}\n${" ".repeat(level * 2)}${chunk.compressedContent || chunk.fullSummary}\n\n`;
            if (chunk.subChunks && chunk.subChunks.length) {
                chunkOutput += this.appendChunks(chunk.subChunks, level + 1);
            }
        });
        return chunkOutput;
    }
}
//# sourceMappingURL=vectorSearch.js.map