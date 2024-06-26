import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";
export declare class SearchQueriesGenerator extends PolicySynthSimpleAgentBase {
    systemPrompt: string;
    userPrompt: string;
    maxModelTokensOut: number;
    modelTemperature: number;
    constructor(memory: PsSimpleAgentMemoryData, numberOfQueriesToGenerate: number, question: string, overRideSystemPrompt?: string, overRideUserPrompt?: string);
    renderMessages(): Promise<PsModelMessage[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map