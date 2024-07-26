import { BaseIngestionAgent } from "./baseAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class IngestionChunkCompressorAgent extends BaseIngestionAgent {
    maxCompressionRetries: number;
    retryCountBeforeRandomizingLlmTemperature: number;
    completionValidationSuccessMessage: string;
    correctnessValidationSuccessMessage: string;
    hallucinationValidationSuccessMessage: string;
    hallucinationValidationSystemMessage: SystemMessage;
    correctnessValidationSystemMessage: SystemMessage;
    completionValidationSystemMessage: SystemMessage;
    validationUserMessage: (uncompressed: string, compressed: string) => HumanMessage;
    compressionSystemMessage: SystemMessage;
    compressionRetrySystemMessage: SystemMessage;
    compressionUserMessage: (data: string) => HumanMessage;
    compressionRetryUserMessage: (data: string, lastCompressed: string, currentValidationResults: string, previousValidationResults: string, retryCount: number) => HumanMessage;
    compress(uncompressedData: string): Promise<string>;
    validateChunkSummary(uncompressed: string, compressed: string): Promise<{
        valid: boolean;
        validationTextResults: string;
    }>;
}
//# sourceMappingURL=chunkCompressorAgent.d.ts.map