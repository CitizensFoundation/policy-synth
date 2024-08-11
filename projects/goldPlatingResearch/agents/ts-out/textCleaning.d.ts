import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class TextCleaningAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    modelsize: PsAiModelSize;
    maxModelTokensOut: number;
    modelTemperature: number;
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