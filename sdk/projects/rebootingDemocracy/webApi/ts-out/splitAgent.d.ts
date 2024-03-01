import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
interface Chunk {
    data: string;
    startLine: number;
    actualStartLine?: number;
    actualEndLine?: number;
    subChunks?: Chunk[];
}
export declare class IngestionSplitAgent extends BaseIngestionAgent {
    maxSplitRetries: number;
    minChunkCharacterLength: number;
    maxChunkLinesLength: number;
    strategySystemMessage: SystemMessage;
    strategyUserMessage: (data: string) => HumanMessage;
    strategyWithReviewUserMessage: (data: string, reviewComments: string) => HumanMessage;
    reviewStrategySystemMessage: SystemMessage;
    reviewStrategyUserMessage: (data: string, splitStrategy: string) => HumanMessage;
    fetchLlmChunkingStrategy(data: string, review: string | undefined, lastJson: LlmDocumentChunksStrategy[] | undefined): Promise<{
        chunkingStrategy: string;
        chunkingStrategyReview: string;
        lastChunkingStrategyJson: LlmDocumentChunksStrategy[];
    }>;
    splitDocumentIntoChunks(data: string, isSubChunk?: boolean): Promise<Chunk[]>;
}
export {};
//# sourceMappingURL=splitAgent.d.ts.map