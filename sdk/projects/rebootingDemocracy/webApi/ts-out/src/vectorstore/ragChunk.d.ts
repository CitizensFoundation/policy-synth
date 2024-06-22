import { WeaviateClient } from "weaviate-ts-client";
import { PolicySynthScAgentBase } from "@policysynth/agents//baseAgent.js";
export declare class PsRagChunkVectorStore extends PolicySynthScAgentBase {
    static allFieldsToExtract: string;
    static client: WeaviateClient;
    addSchema(): Promise<void>;
    showScheme(): Promise<void>;
    deleteScheme(): Promise<void>;
    testQuery(): Promise<{
        data: any;
    }>;
    retry<T>(fn: () => Promise<T>, retries?: number, delay?: number): Promise<T>;
    postChunk(chunkData: PsRagChunk): Promise<string | undefined>;
    addCrossReference(sourceId: string, propertyName: string, targetId: string, targetClassName: string): Promise<unknown>;
    updateChunk(id: string, chunkData: PsRagChunk, quiet?: boolean): Promise<unknown>;
    getChunk(id: string): Promise<PsRagChunk>;
    searchChunks(query: string): Promise<PsRagChunkGraphQlResponse>;
    searchChunksWithReferences(query: string, minRelevanceEloRating?: number, minSubstanceEloRating?: number): Promise<PsRagChunkGraphQlResponse>;
}
//# sourceMappingURL=ragChunk.d.ts.map