import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsRagDocumentVectorStore } from "../vectorstore/ragDocument.js";
export class PsRagVectorSearch extends PolicySynthScAgentBase {
    getChunkId(chunk, documentUrl) {
        return `${documentUrl}#${chunk.chunkIndex}#${chunk.chapterIndex}`;
    }
    setupChunkMaps(chunkResults, documentsMap, chunksMap, addedChunkIdsMap) {
        const recursiveChunkId = (chunk, documentUrl) => {
            chunk.id = this.getChunkId(chunk, documentUrl);
            if (!chunk.id) {
                console.error("!!!!!!!!!!!!!!!!!!!! Chunk ID is undefined");
                throw "Chunk ID is undefined";
            }
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
    addMostRelevantChunks(chunk, chunksMap, documentsMap) {
        const currentChunk = chunksMap.get(chunk.id);
        if (chunk.mostRelevantSiblingChunks &&
            chunk.mostRelevantSiblingChunks.length) {
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
                    console.log(`Sibling chunk assigned to document: ${currentChunk.inDocument[0]
                        .url}`);
                    const currentDocument = documentsMap.get(currentChunk.inDocument[0].url);
                    currentDocument.chunks.push(siblingChunk);
                }
            });
        }
    }
    addTopEloRatedSiblingChunks(chunk, chunksMap, documentsMap) {
        const currentChunk = chunksMap.get(chunk.id);
        const allSiblings = chunk.allSiblingChunks ? chunk.allSiblingChunks : [];
        const mostRelevantSiblings = chunk.mostRelevantSiblingChunks
            ? new Set(chunk.mostRelevantSiblingChunks.map((s) => s.id))
            : new Set();
        // Exclude current chunk and most relevant siblings from the list
        let filteredSiblings = allSiblings.filter((sibling) => sibling.id !== chunk.id && !mostRelevantSiblings.has(sibling.id));
        filteredSiblings.sort((a, b) => {
            // Ensure we have the ELO ratings defined for both chunks before proceeding
            if (a.qualityEloRating !== undefined &&
                b.qualityEloRating !== undefined &&
                a.relevanceEloRating !== undefined &&
                b.relevanceEloRating !== undefined &&
                a.substanceEloRating !== undefined &&
                b.substanceEloRating !== undefined) {
                // Use getEloAverage to determine the average ELO ratings for comparison
                let aEloAverage = this.getEloAverage(a);
                let bEloAverage = this.getEloAverage(b);
                // Compare the average ELO ratings
                return bEloAverage - aEloAverage;
            }
            else {
                // Log an error if any of the required ELO ratings are undefined
                console.error("!!!!!!!!!!!!!!!! ELO ratings are not defined for one or more sibling chunks");
                return 0;
            }
        });
        // Take the top 2 chunks based on the sorted list
        const topEloRatedChunks = filteredSiblings.slice(0, 2);
        // Process the selected top ELO rated chunks
        topEloRatedChunks.forEach((siblingChunk) => {
            // This follows the same logic as in addMostRelevantChunks for assigning chunks
            if (currentChunk.inChunk && currentChunk.inChunk.length) {
                const parentChunk = chunksMap.get(currentChunk.inChunk[0].id);
                if (parentChunk && parentChunk.subChunks) {
                    parentChunk.subChunks.push(siblingChunk);
                    console.log(`Top ELO Rated Sibling chunk assigned to parent chunk: ${parentChunk.id}`);
                }
            }
            else if (currentChunk.inDocument && currentChunk.inDocument.length) {
                console.log(`Top ELO Rated Sibling chunk assigned to document: ${currentChunk
                    .inDocument[0].url}`);
                const currentDocument = documentsMap.get(currentChunk.inDocument[0].url);
                if (currentDocument.chunks) {
                    currentDocument.chunks.push(siblingChunk);
                }
            }
        });
    }
    async search(userQuestion, routingData, dataLayout) {
        const vectorStore = new PsRagDocumentVectorStore();
        try {
            if (routingData.rewrittenUserQuestionVectorDatabaseSearch &&
                routingData.rewrittenUserQuestionVectorDatabaseSearch != "") {
                userQuestion = routingData.rewrittenUserQuestionVectorDatabaseSearch;
            }
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
                this.addMostRelevantChunks(chunk, chunksMap, documentsMap);
                this.addTopEloRatedSiblingChunks(chunk, chunksMap, documentsMap);
            });
            //TODO: Find out why this is not working
            const recursiveSortChunks = (chunk) => {
                if (chunk.subChunks && chunk.subChunks.length) {
                    // First, sort by chapterIndex
                    chunk.subChunks.sort((a, b) => a.chapterIndex - b.chapterIndex);
                    // Deduplicate
                    const uniqueSubChunks = [];
                    const seenChapterIndexes = new Set();
                    for (const subChunk of chunk.subChunks) {
                        if (!seenChapterIndexes.has(subChunk.chapterIndex)) {
                            uniqueSubChunks.push(subChunk);
                            seenChapterIndexes.add(subChunk.chapterIndex);
                        }
                    }
                    // Replace the original subChunks with the deduplicated array
                    chunk.subChunks = uniqueSubChunks;
                    // Recursively apply this to subChunks
                    chunk.subChunks.forEach(recursiveSortChunks);
                }
            };
            Array.from(documentsMap.values()).forEach((document) => {
                console.log(`Sorting chunks for document: ${document.url} ${document.chunks.length}`);
                for (const chunk of document.chunks) {
                    if (chunk.id) {
                        console.log(`Sorting chunks for chunk: ${chunk.id}`);
                        const currentChunk = chunksMap.get(chunk.id);
                        recursiveSortChunks(currentChunk);
                    }
                    else {
                        console.error("!!!!!!!!!!!!!!!!!!!! TODO: Look into chunk is undefined: " +
                            JSON.stringify(chunk));
                    }
                }
            });
            //TODO: Filter out documents with the lowest relevanceEloRating, qualityEloRating, and substanceEloRating
            console.log("Processed chunk assignments complete.");
            const returnDocuments = [];
            Array.from(documentsMap.values()).forEach((document) => {
                returnDocuments.push({
                    id: document.id,
                    url: document.url,
                    relevanceEloRating: document.relevanceEloRating,
                    substanceEloRating: document.substanceEloRating,
                    title: document.title,
                    description: document.shortDescription,
                    contentType: document.contentType,
                    allReferencesWithUrls: document.allReferencesWithUrls,
                    allOtherReferences: document.allOtherReferences,
                    allImageUrls: document.allImageUrls,
                    documentDate: document.documentDate,
                    compressedFullDescriptionOfAllContents: document.compressedFullDescriptionOfAllContents,
                    documentMetaData: document.documentMetaData,
                });
            });
            return {
                responseText: this.formatOutput(Array.from(documentsMap.values())),
                documents: returnDocuments,
            };
        }
        catch (error) {
            console.error("Error in search:", error);
            return {
                responseText: "Unexpected error in search, please apologize",
                documents: [],
            };
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
            console.log(`Formatting document: ${doc.relevanceEloRating} ${doc.substanceEloRating} ${doc.shortDescription || doc.title}`);
            output += `Document: ${doc.shortDescription || doc.title}\nURL: ${doc.url}\n\n`;
            output += this.appendChunks(doc.chunks, 1);
        });
        console.log("Final output:", output);
        return output.trim(); // Remove trailing new lines
    }
    appendChunks(chunks, level) {
        let chunkOutput = "";
        chunks.sort((a, b) => a.chapterIndex - b.chapterIndex);
        // Deduplicate chunks on chapterIndex
        const uniqueChunks = [];
        const seenChapterIndexes = new Set();
        for (const chunk of chunks) {
            if (!seenChapterIndexes.has(chunk.chapterIndex)) {
                uniqueChunks.push(chunk);
                seenChapterIndexes.add(chunk.chapterIndex);
            }
        }
        uniqueChunks.forEach((chunk) => {
            const debugPefix = `${" ".repeat(level * 2)}Chapter (${chunk.compressedContent ? "Content" : "Summary"}) Chapter ${chunk.chapterIndex} Elo r ${Math.round(chunk.relevanceEloRating)} s ${Math.round(chunk.substanceEloRating)} q ${Math.round(chunk.qualityEloRating)} - `;
            const prefix = `${" ".repeat(level * 2)}Chapter (${chunk.compressedContent ? "Content" : "Summary"}) `;
            console.log(`${debugPefix}${chunk.title}`);
            chunkOutput += `${prefix}${chunk.title}\n${" ".repeat(level * 2)}${chunk.compressedContent || chunk.fullSummary}\n\n`;
            if (chunk.subChunks && chunk.subChunks.length) {
                chunkOutput += this.appendChunks(chunk.subChunks, level + 1);
            }
        });
        return chunkOutput;
    }
    getEloAverage(chunk) {
        const { relevanceEloRating, substanceEloRating, qualityEloRating } = chunk;
        if (relevanceEloRating) {
            return (relevanceEloRating + substanceEloRating + qualityEloRating) / 3;
        }
        else {
            return 0;
        }
    }
}
//# sourceMappingURL=vectorSearch.js.map