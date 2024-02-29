import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export declare class IngestionSplitAgent extends BaseIngestionAgent {
    maxSplitRetries: number;
    minChunkCharacterLength: number;
    strategySystemMessage: SystemMessage;
    strategyUserMessage: (data: string, reviewComments?: string | undefined) => HumanMessage;
    reviewStrategySystemMessage: SystemMessage;
    reviewStrategyUserMessage: (data: string, splitStrategy: string) => HumanMessage;
    splitDocumentIntoChunks(data: string): Promise<{
        [key: string]: string;
    }>;
}
//# sourceMappingURL=splitAgent.d.ts.map