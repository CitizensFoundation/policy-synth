import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class SearchQueriesGenerator extends PolicySynthAgentBase {
    systemPrompt: string;
    userPrompt: string;
    memory: PsEngineerMemoryData;
    constructor(memory: PsEngineerMemoryData, numberOfQueriesToGenerate: number, instructions: string, overRideSystemPrompt?: string, overRideUserPrompt?: string);
    renderMessages(): Promise<(SystemMessage | HumanMessage)[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map