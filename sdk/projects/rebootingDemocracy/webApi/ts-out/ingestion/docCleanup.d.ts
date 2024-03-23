import { BaseIngestionAgent } from "./baseAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class DocumentCleanupAgent extends BaseIngestionAgent {
    maxCleanupTokenLength: number;
    maxCleanupRetries: number;
    completionValidationSuccessMessage: string;
    correctnessValidationSuccessMessage: string;
    hallucinationValidationSuccessMessage: string;
    hallucinationValidationSystemMessage: SystemMessage;
    correctnessValidationSystemMessage: SystemMessage;
    completionValidationSystemMessage: SystemMessage;
    validationUserMessage: (original: string, cleaned: string) => HumanMessage;
    systemMessage: SystemMessage;
    userMessage: (data: string, validationTextResults: string | undefined) => HumanMessage;
    referencesCheckSystemMessage: SystemMessage;
    referencesCheckUserMessage: (data: string) => HumanMessage;
    clean(data: string): Promise<string>;
    validateCleanedPart(original: string, cleaned: string): Promise<{
        valid: boolean;
        validationTextResults: string;
    }>;
}
//# sourceMappingURL=docCleanup.d.ts.map