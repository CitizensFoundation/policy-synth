import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "../ingestion/baseAgent.js";
export declare class PsRagRouter extends BaseIngestionAgent {
    systemMessage: (schema: string, about: string) => SystemMessage;
    userMessage: (question: string) => HumanMessage;
    getRoutingData(userQuestion: string, dataLayout: PsIngestionDataLayout): Promise<PsRagRoutingResponse>;
}
//# sourceMappingURL=router.d.ts.map