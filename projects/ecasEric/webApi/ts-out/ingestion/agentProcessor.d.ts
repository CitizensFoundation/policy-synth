import { BaseIngestionAgent } from "./baseAgent.js";
import { EcasYayChunkAnalyserAgent } from "./chunkAnalyzer.js";
export declare class EcasYayIngestionAgentProcessor extends BaseIngestionAgent {
    chunkAnalysisAgent: EcasYayChunkAnalyserAgent;
    constructor();
    getChunksFromXlsx(filePath: string): Promise<{
        question: string;
        answer: string;
    }[]>;
    ingest(filePath?: string): Promise<void>;
}
//# sourceMappingURL=agentProcessor.d.ts.map