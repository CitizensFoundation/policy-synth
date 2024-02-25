import { BaseIngestionAgent } from "./baseAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class ChunkCompressorAgent extends BaseIngestionAgent {
    maxCompressionRetries: number;
    completionValidationSuccessMessage: string;
    correctnessValidationSuccessMessage: string;
    hallucinationValidationSuccessMessage: string;
    halluciantionValidationSystemMessage: SystemMessage;
    correctnessValidationSystemMessage: SystemMessage;
    completionValidationSystemMessage: SystemMessage;
    validationUserMessage: (uncompressed: string, compressed: string) => HumanMessage;
    compressionSystemMessage: SystemMessage;
    compressionUserMessage: (data: string, retryCount: number) => HumanMessage;
    compress(uncompressedData: string): Promise<LlmChunkCompressionReponse>;
    validateChunkSummary(uncompressed: string, compressed: string): Promise<boolean>;
}
//# sourceMappingURL=chunkCompressorAgent.d.ts.map