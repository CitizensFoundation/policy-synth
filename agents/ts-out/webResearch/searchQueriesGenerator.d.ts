import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthScAgentBase } from "../baseAgent.js";
export declare class SearchQueriesGenerator extends PolicySynthScAgentBase {
    systemPrompt: string;
    userPrompt: string;
    constructor(memory: PsSmarterCrowdsourcingMemoryData, numberOfQueriesToGenerate: number, question: string, overRideSystemPrompt?: string, overRideUserPrompt?: string);
    renderMessages(): Promise<(HumanMessage | SystemMessage)[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map