import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsRagVectorSearch extends PolicySynthScAgentBase {
    getChunkId(chunk: PsRagChunk, documentUrl: string): string;
    setupChunkMaps(chunkResults: PsRagChunk[], documentsMap: Map<string, PsRagDocumentSource>, chunksMap: Map<string, PsRagChunk>, addedChunkIdsMap: Map<string, Set<string>>): void;
    processChunk(documentUrl: string, chunk: PsRagChunk, chunksMap: Map<string, PsRagChunk>, documentsMap: Map<string, PsRagDocumentSource>, addedChunkIdsMap: Map<string, Set<string>>): void;
    addMostRelevantChunks(chunk: PsRagChunk, chunksMap: Map<string, PsRagChunk>, documentsMap: Map<string, PsRagDocumentSource>): void;
    addTopEloRatedSiblingChunks(chunk: PsRagChunk, chunksMap: Map<string, PsRagChunk>, documentsMap: Map<string, PsRagDocumentSource>): void;
    search(userQuestion: string, routingData: PsRagRoutingResponse, dataLayout: PsIngestionDataLayout): Promise<PsVectorSearchResponse>;
    formatOutput(documents: PsRagDocumentSource[]): string;
    appendChunks(chunks: PsRagChunk[], level: number): string;
    getEloAverage(chunk: PsRagChunk): number;
}
//# sourceMappingURL=vectorSearch.d.ts.map