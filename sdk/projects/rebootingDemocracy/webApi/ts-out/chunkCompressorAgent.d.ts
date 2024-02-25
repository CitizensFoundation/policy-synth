import { BaseIngestionAgent } from "./baseAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class IngestionChunkCompressorAgent extends BaseIngestionAgent {
    maxCompressionRetries: number;
    completionValidationSuccessMessage: string;
    correctnessValidationSuccessMessage: string;
    hallucinationValidationSuccessMessage: string;
    hallucinationValidationSystemMessage: SystemMessage;
    correctnessValidationSystemMessage: SystemMessage;
    completionValidationSystemMessage: SystemMessage;
    validationUserMessage: (uncompressed: string, compressed: string) => HumanMessage;
    compressionSystemMessage: SystemMessage;
    compressionUserMessage: (data: string, retryCount: number, validationTextResults: string | undefined) => HumanMessage;
    compress(uncompressedData: string): Promise<LlmChunkCompressionReponse>;
    validateChunkSummary(uncompressed: string, compressed: string): Promise<{
        valid: boolean;
        validationTextResults: string;
    }>;
}
//# sourceMappingURL=chunkCompressorAgent.d.ts.map