import { BaseIngestionAgent } from "./baseAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class IngestionChunkAnalzyerAgent extends BaseIngestionAgent {
    analyzisSystemMessage: SystemMessage;
    analyzisUserMessage: (data: string) => HumanMessage;
    analyze(data: string): Promise<LlmChunkAnalysisReponse>;
}
//# sourceMappingURL=chunkAnalyzer.d.ts.map