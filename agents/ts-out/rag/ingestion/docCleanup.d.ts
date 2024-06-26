import { BaseIngestionAgent } from "./baseAgent.js";
export declare class DocumentCleanupAgent extends BaseIngestionAgent {
    maxCleanupTokenLength: number;
    maxCleanupRetries: number;
    completionValidationSuccessMessage: string;
    correctnessValidationSuccessMessage: string;
    hallucinationValidationSuccessMessage: string;
    hallucinationValidationSystemMessage: PsModelMessage;
    correctnessValidationSystemMessage: PsModelMessage;
    completionValidationSystemMessage: PsModelMessage;
    validationUserMessage: (original: string, cleaned: string) => PsModelMessage;
    systemMessage: PsModelMessage;
    userMessage: (data: string, validationTextResults: string | undefined) => PsModelMessage;
    referencesCheckSystemMessage: PsModelMessage;
    referencesCheckUserMessage: (data: string) => PsModelMessage;
    clean(data: string): Promise<string>;
    validateCleanedPart(original: string, cleaned: string): Promise<{
        valid: boolean;
        validationTextResults: string;
    }>;
}
//# sourceMappingURL=docCleanup.d.ts.map