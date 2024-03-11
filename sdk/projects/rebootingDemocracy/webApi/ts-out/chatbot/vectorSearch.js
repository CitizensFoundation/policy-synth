import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsRagDocumentVectorStore } from "../vectorstore/ragDocument.js";
export class PsRagVectorSearch extends PolicySynthAgentBase {
    getChunkId(chunk, documentUrl) {
        return `${documentUrl}#${chunk.chunkIndex}#${chunk.chapterIndex}`;
    }
    async search(userQuestion, routingData, dataLayout) {
        const vectorStore = new PsRagDocumentVectorStore();
        const chunkResults = await vectorStore.searchChunksWithReferences(userQuestion);
        console.log("Initial chunk results received:", JSON.stringify(chunkResults, null, 2));
        const documentsMap = new Map();
        const chunksMap = new Map();
        const addedChunkIdsMap = new Map(); // Tracks added chunk IDs for each document
        // Go through all the chunks and subChunks recursively and do cunk.id = this.getChunkId(chunk, documentUrl)
        let documentUrl;
        const recursiveChunkId = (chunk, documentUrl) => {
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
        const recursiveProcessChunkResults = (chunkResults) => {
            chunkResults.forEach((chunk) => {
                console.log(`Processing chunk ${chunk.compressedContent ? "Content" : "Summary"}: ${chunk.id} `);
                chunksMap.set(chunk.id, { ...chunk, subChunks: [] });
                if (chunk.inDocument && chunk.inDocument.length) {
                    const doc = chunk.inDocument[0];
                    if (!documentsMap.has(doc.url)) {
                        documentsMap.set(doc.url, { ...doc, chunks: [] });
                        addedChunkIdsMap.set(doc.url, new Set());
                        console.log(`Document initialized: ${doc.url}`);
                    }
                }
                if (chunk.inChunk) {
                    console.log("----------------------------_> RECURSIVE CALL ---------------------->");
                    recursiveProcessChunkResults(chunk.inChunk);
                }
            });
        };
        recursiveProcessChunkResults(chunkResults);
        chunkResults.forEach((chunk) => {
            if (chunk._additional) {
                console.log(`\n\n${chunk.title}`);
                console.log(`C: ${(chunk.compressedContent && chunk.compressedContent != "") ? "Content" : "Summary"}`);
                console.log(`\nChunk info: ${chunk._additional.id} with distance: ${chunk._additional.distance} and confidence: ${chunk._additional.certainty}`);
                console.log(`Chunk info: ${chunk._additional.id} with relevance: ${chunk.relevanceEloRating}} and substance: ${chunk.substanceEloRating} and quality: ${chunk.qualityEloRating}\n\n`);
            }
            this.processChunk(chunk, chunksMap, documentsMap, addedChunkIdsMap);
        });
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
        console.log(`Processed chunk assignments: ${JSON.stringify(Array.from(documentsMap.values()), null, 2)}`);
        // Wait 3 minutes
        await new Promise((resolve) => setTimeout(resolve, 180000));
        console.log("Processed chunk assignments complete.");
        return this.formatOutput(Array.from(documentsMap.values()));
    }
    processChunk(chunk, chunksMap, documentsMap, addedChunkIdsMap) {
        console.log(`Processing chunk: ${chunk.compressedContent ? "Content" : "Summary"} ${chunk.inChunk ? chunk.inChunk[0].id : ""}`);
        const parentChunk = chunk.inChunk && chunk.inChunk.length
            ? chunksMap.get(chunk.inChunk[0].id)
            : null;
        const doc = chunk.inDocument && chunk.inDocument.length
            ? documentsMap.get(chunk.inDocument[0].url)
            : null;
        const addedChunkIds = doc
            ? addedChunkIdsMap.get(chunk.inDocument[0].url)
            : null;
        if (!addedChunkIds || addedChunkIds.has(chunk.id))
            return; // Skip if already processed
        if (parentChunk) {
            parentChunk.subChunks.push(chunk);
            console.log(`Chunk assigned to chunk parent: ${chunk.compressedContent ? "Content" : "Summary"} ${chunk.title} in ${parentChunk.title}`);
            this.processChunk(parentChunk, chunksMap, documentsMap, addedChunkIdsMap);
        }
        else if (doc) {
            doc.chunks.push(chunk);
            console.log(`Chunk assigned to document: ${chunk.compressedContent ? "Content" : "Summary"} ${chunk.title} in ${doc.title}`);
        }
        addedChunkIds.add(chunk.id); // Mark as processed
    }
    formatOutput(documents) {
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
