import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class PsRagVectorSearch extends PolicySynthAgentBase {
    search(userQuestion: string, routingData: any, dataLayout: any): Promise<string>;
    formatOutput(documents: (PsRagDocumentSource & {
        chunks: PsRagChunk[];
    })[]): string;
    appendChunks(chunks: PsRagChunk[], level: number): string;
}
//# sourceMappingURL=vectorSearch.d.ts.map