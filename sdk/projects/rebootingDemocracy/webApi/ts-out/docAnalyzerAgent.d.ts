import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export declare class DocAnalyzerAgent extends BaseIngestionAgent {
    systemMessage: SystemMessage;
    userMessage: (data: string) => HumanMessage;
    analyze(fileId: string, data: string, filesMetaData?: Record<string, CachedFileMetadata>): Promise<CachedFileMetadata>;
}
//# sourceMappingURL=docAnalyzerAgent.d.ts.map