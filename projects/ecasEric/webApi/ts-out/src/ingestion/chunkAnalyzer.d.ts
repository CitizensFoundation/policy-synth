import { BaseIngestionAgent } from "./baseAgent.js";
export declare class EcasYayChunkAnalyserAgent extends BaseIngestionAgent {
    analysisSystemMessage: PsModelMessage;
    analysisUserMessage: (question: string, answer: string) => PsModelMessage;
    analyze(question: string, answer: string): Promise<PsEcasYeaRagChunkAnalysis>;
}
//# sourceMappingURL=chunkAnalyzer.d.ts.map