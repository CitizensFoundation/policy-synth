import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsRagVectorSearch extends PolicySynthScAgentBase {
    getChunkId(chunk: PsRagChunk, documentUrl: string): string;
    search(userQuestion: string, routingData: any, dataLayout: any): Promise<string>;
    processChunk(chunk: PsRagChunk, chunksMap: Map<string, PsRagChunk>, documentsMap: Map<string, PsRagDocumentSource>, addedChunkIdsMap: Map<string, Set<string>>): void;
    formatOutput(documents: PsRagDocumentSource[]): string;
    appendChunks(chunks: PsRagChunk[], level: number): string;
}
//# sourceMappingURL=vectorSearch.d.ts.map