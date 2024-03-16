import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsRagVectorSearch extends PolicySynthAgentBase {
    getChunkId(chunk: PsRagChunk, documentUrl: string): string;
    setupChunkMaps(chunkResults: PsRagChunk[], documentsMap: Map<string, PsRagDocumentSource>, chunksMap: Map<string, PsRagChunk>, addedChunkIdsMap: Map<string, Set<string>>): void;
    processChunk(documentUrl: string, chunk: PsRagChunk, chunksMap: Map<string, PsRagChunk>, documentsMap: Map<string, PsRagDocumentSource>, addedChunkIdsMap: Map<string, Set<string>>): void;
    search(userQuestion: string, routingData: any, dataLayout: any): Promise<string>;
    formatOutput(documents: PsRagDocumentSource[]): string;
    appendChunks(chunks: PsRagChunk[], level: number): string;
}
//# sourceMappingURL=vectorSearch.d.ts.map