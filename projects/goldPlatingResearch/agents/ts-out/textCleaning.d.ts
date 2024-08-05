import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class TextCleaningAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    maxCleanupTokenLength: number;
    maxCleanupRetries: number;
    completionValidationSuccessMessage: string;
    correctnessValidationSuccessMessage: string;
    hallucinationValidationSuccessMessage: string;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(textToClean: string): Promise<string>;
    private clean;
    private cleanPart;
    private callCleaningModel;
    private validateCleanedPart;
    private runValidationSubAgent;
    private getCleaningSystemPrompt;
    private getCleaningUserPrompt;
    private getValidationSystemPrompt;
    private getValidationUserPrompt;
    private splitDataForProcessing;
}
//# sourceMappingURL=textCleaning.d.ts.map