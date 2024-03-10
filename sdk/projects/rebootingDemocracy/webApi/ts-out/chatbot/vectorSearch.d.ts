import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsRagVectorSearch extends PolicySynthAgentBase {
    getChunkId(chunk: PsRagChunk, documentUrl: string): string;
    search(userQuestion: string, routingData: any, dataLayout: any): Promise<string>;
    processChunk(chunk: PsRagChunk, chunksMap: Map<string, PsRagChunk & {
        subChunks: PsRagChunk[];
    }>, documentsMap: Map<string, PsRagDocumentSource & {
        chunks: PsRagChunk[];
    }>, addedChunkIdsMap: Map<string, Set<string>>): void;
    formatOutput(documents: (PsRagDocumentSource & {
        chunks: PsRagChunk[];
    })[]): string;
    appendChunks(chunks: PsRagChunk[], level: number): string;
}
//# sourceMappingURL=vectorSearch.d.ts.map