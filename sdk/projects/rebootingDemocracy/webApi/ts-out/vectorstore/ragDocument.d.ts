import { WeaviateClient } from "weaviate-ts-client";
import { PolicySynthAgentBase } from "@policysynth/agents//baseAgent.js";
export declare class PsRagDocumentVectorStore extends PolicySynthAgentBase {
    static allFieldsToExtract: string;
    static client: WeaviateClient;
    roughFastWordTokenRatio: number;
    maxChunkTokenLength: number;
    minQualityEloRatingForChunk: number;
    getEstimateTokenLength(data: string): number;
    addSchema(): Promise<void>;
    showScheme(): Promise<void>;
    deleteScheme(): Promise<void>;
    testQuery(): Promise<{
        data: any;
    }>;
    retry<T>(fn: () => Promise<T>, retries?: number, delay?: number): Promise<T>;
    postDocument(document: PsRagDocumentSource): Promise<string | undefined>;
    updateDocument(id: string, documentData: PsRagDocumentSource, quiet?: boolean): Promise<unknown>;
    getDocument(id: string): Promise<PsRagDocumentSource>;
    searchDocuments(query: string): Promise<PsRagDocumentSourceGraphQlResponse>;
    searchChunksWithReferences(query: string): Promise<PsRagChunk[]>;
}
//# sourceMappingURL=ragDocument.d.ts.map