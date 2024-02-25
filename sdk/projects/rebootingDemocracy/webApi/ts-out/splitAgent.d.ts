import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export declare class IngestionSplitAgent extends BaseIngestionAgent {
    strategySystemMessage: SystemMessage;
    strategyUserMessage: (data: string) => HumanMessage;
    splitIndexSystemMessage: SystemMessage;
    splitIndexUserMessage: (data: string, strategy: string) => HumanMessage;
    splitDocumentIntoChunks(data: string): Promise<{
        [key: string]: string;
    }>;
    chunkDocument(data: string, strategy: string): Promise<{
        [key: string]: string;
    }>;
}
//# sourceMappingURL=splitAgent.d.ts.map