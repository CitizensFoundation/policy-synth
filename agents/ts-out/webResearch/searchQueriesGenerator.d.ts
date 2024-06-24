import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthScAgentBase } from "../base/baseScAgentBase.js";
export declare class SearchQueriesGenerator extends PolicySynthScAgentBase {
    systemPrompt: string;
    userPrompt: string;
    constructor(memory: PsSmarterCrowdsourcingMemoryData, numberOfQueriesToGenerate: number, question: string, overRideSystemPrompt?: string, overRideUserPrompt?: string);
    renderMessages(): Promise<(SystemMessage | HumanMessage)[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map