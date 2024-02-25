import { BaseIngestionAgent } from "./baseAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class IngestionCleanupAgent extends BaseIngestionAgent {
    maxCleanupTokenLength: number;
    systemMessage: SystemMessage;
    userMessage: (data: string) => HumanMessage;
    clean(data: string): Promise<string>;
}
//# sourceMappingURL=cleanupAgent.d.ts.map