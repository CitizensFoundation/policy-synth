import { WeaviateClient } from "weaviate-ts-client";
import { PolicySynthStandaloneAgent } from "@policysynth/agents/base/agentStandalone.js";
export declare class PsEcasYeaRagChunkVectorStore extends PolicySynthStandaloneAgent {
    static allFieldsToExtract: string;
    static client: WeaviateClient;
    addSchema(): Promise<void>;
    showScheme(): Promise<void>;
    deleteScheme(): Promise<void>;
    testQuery(): Promise<{
        data: any;
    }>;
    retry<T>(fn: () => Promise<T>, retries?: number, delay?: number): Promise<T>;
    postChunk(chunkData: PsEcasYeaRagChunk): Promise<string | undefined>;
    updateChunk(id: string, chunkData: PsRagChunk, quiet?: boolean): Promise<unknown>;
    getChunk(id: string): Promise<PsRagChunk>;
    searchChunks(query: string): Promise<PsEcasRagChunkGraphQlResponse>;
}
//# sourceMappingURL=ragChunk.d.ts.map