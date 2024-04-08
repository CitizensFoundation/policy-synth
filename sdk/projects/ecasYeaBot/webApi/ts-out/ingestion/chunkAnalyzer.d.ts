import { BaseIngestionAgent } from "./baseAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class EcasYayChunkAnalyserAgent extends BaseIngestionAgent {
    analysisSystemMessage: SystemMessage;
    analysisUserMessage: (question: string, answer: string) => HumanMessage;
    analyze(question: string, answer: string): Promise<PsEcasYeaRagChunkAnalysis>;
}
//# sourceMappingURL=chunkAnalyzer.d.ts.map