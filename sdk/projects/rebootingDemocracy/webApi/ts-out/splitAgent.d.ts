import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export declare class IngestionSplitAgent extends BaseIngestionAgent {
    maxSplitRetries: number;
    minChunkCharacterLength: number;
    maxChunkLinesLength: number;
    strategySystemMessage: SystemMessage;
    strategyUserMessage: (data: string) => HumanMessage;
    strategyWithReviewUserMessage: (data: string, reviewComments: string) => HumanMessage;
    reviewStrategySystemMessage: SystemMessage;
    reviewStrategyUserMessage: (data: string, splitStrategy: string) => HumanMessage;
    generateDiff(str1: string, str2: string): string;
    fetchLlmChunkingStrategy(data: string, review: string | undefined, lastJson: LlmDocumentChunksStrategy[] | undefined): Promise<{
        chunkingStrategy: string;
        chunkingStrategyReview: string;
        lastChunkingStrategyJson: LlmDocumentChunksStrategy[];
    }>;
    splitDocumentIntoChunks(data: string, startingLineNumber?: number, isSubChunk?: boolean, totalLinesInChunk?: number): Promise<LlmDocumentChunksStrategy[] | undefined>;
}
//# sourceMappingURL=splitAgent.d.ts.map