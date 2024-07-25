import { BaseIngestionAgent } from "./baseAgent.js";
export declare class IngestionChunkAnalzyerAgent extends BaseIngestionAgent {
    analysisSystemMessage: PsModelMessage;
    analysisUserMessage: (data: string) => PsModelMessage;
    analyze(data: string): Promise<LlmChunkAnalysisReponse>;
}
//# sourceMappingURL=chunkAnalyzer.d.ts.map