import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsRagDocumentVectorStore } from "../vectorstore/ragDocument.js";
export class PsRagVectorSearch extends PolicySynthAgentBase {
    async search(userQuestion, routingData, dataLayout) {
        const vectorStore = new PsRagDocumentVectorStore();
        const chunkResults = await vectorStore.searchChunksWithReferences(userQuestion);
        console.log(`Chunk results: ${JSON.stringify(chunkResults, null, 2)}`);
        const documentsMap = new Map();
        const chunksMap = new Map();
        const addedChunkIdsMap = new Map(); // New map to track added chunk IDs for each document
        chunkResults.forEach((chunk) => {
            chunksMap.set(chunk.id, { ...chunk, subChunks: [] });
            if (chunk.inDocument && chunk.inDocument.length) {
                const doc = chunk.inDocument[0];
                if (!documentsMap.has(doc.url)) {
                    documentsMap.set(doc.url, { ...doc, chunks: [] });
                    addedChunkIdsMap.set(doc.url, new Set()); // Initialize the set for this document
                }
            }
        });
        chunkResults.forEach((chunk) => {
            const parentChunk = chunk.inChunk && chunk.inChunk.length
                ? chunksMap.get(chunk.inChunk[0].id)
                : null;
            const doc = documentsMap.get(chunk.inDocument[0].url);
            const addedChunkIds = addedChunkIdsMap.get(chunk.inDocument[0].url); // Retrieve the set of added chunk IDs for this document
            if (parentChunk) {
                if (!addedChunkIds.has(chunk.id)) {
                    // Check if the chunk is not already added
                    parentChunk.subChunks.push(chunk);
                    addedChunkIds.add(chunk.id); // Mark this chunk ID as added
                }
            }
            else if (doc && !addedChunkIds.has(chunk.id)) {
                // Similarly, check for the document's chunk list
                doc.chunks.push(chunk);
                addedChunkIds.add(chunk.id); // Mark this chunk ID as added
            }
        });
        return this.formatOutput(Array.from(documentsMap.values()));
    }
    formatOutput(documents) {
        let output = "";
        documents.forEach((doc) => {
            output += `Document: ${doc.shortDescription}\nURL: ${doc.url}\n\n`;
            console.log(`Document: ${doc.shortDescription}\nURL: ${doc.url}\n\n`);
            output += this.appendChunks(doc.chunks, 1);
        });
        return output;
    }
    appendChunks(chunks, level) {
        let chunkOutput = "";
        chunks.forEach((chunk) => {
            console.log(`${" ".repeat(level * 2)}Chapter (${chunk.compressedContent ? "Content" : "Summary"}): ${chunk.title}\n${chunk.compressedContent || chunk.fullSummary}\n\n`);
            chunkOutput += `${" ".repeat(level * 2)}Chapter (${chunk.compressedContent ? "Content" : "Summary"}): ${chunk.title}\n${chunk.compressedContent || chunk.fullSummary}\n\n`;
            if (chunk.subChunks && chunk.subChunks.length) {
                chunkOutput += this.appendChunks(chunk.subChunks, level + 1);
            }
        });
        return chunkOutput;
    }
}
