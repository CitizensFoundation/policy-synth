import { BaseIngestionAgent } from "./baseAgent.js";
export declare class IngestionChunkCompressorAgent extends BaseIngestionAgent {
    maxCompressionRetries: number;
    retryCountBeforeRandomizingLlmTemperature: number;
    completionValidationSuccessMessage: string;
    correctnessValidationSuccessMessage: string;
    hallucinationValidationSuccessMessage: string;
    hallucinationValidationSystemMessage: PsModelMessage;
    correctnessValidationSystemMessage: PsModelMessage;
    completionValidationSystemMessage: PsModelMessage;
    validationUserMessage: (uncompressed: string, compressed: string) => PsModelMessage;
    compressionSystemMessage: PsModelMessage;
    compressionRetrySystemMessage: PsModelMessage;
    compressionUserMessage: (data: string) => PsModelMessage;
    compressionRetryUserMessage: (data: string, lastCompressed: string, currentValidationResults: string, previousValidationResults: string, retryCount: number) => PsModelMessage;
    compress(uncompressedData: string): Promise<string>;
    validateChunkSummary(uncompressed: string, compressed: string): Promise<{
        valid: boolean;
        validationTextResults: string;
    }>;
}
//# sourceMappingURL=chunkCompressorAgent.d.ts.map