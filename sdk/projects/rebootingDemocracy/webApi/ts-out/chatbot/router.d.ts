import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "../ingestion/baseAgent.js";
export declare class PsRagRouter extends BaseIngestionAgent {
    systemMessage: (schema: string, about: string, simpleChatHistory: string | undefined) => SystemMessage;
    userMessage: (question: string) => HumanMessage;
    getRoutingData(userQuestion: string, chatHistory: string | undefined, dataLayout: PsIngestionDataLayout): Promise<PsRagRoutingResponse>;
}
//# sourceMappingURL=router.d.ts.map