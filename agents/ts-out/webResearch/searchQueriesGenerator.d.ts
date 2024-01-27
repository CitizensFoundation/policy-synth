import { HumanMessage, SystemMessage } from "langchain/schema";
import { PolicySynthAgentBase } from "../baseAgent.js";
export declare class SearchQueriesGenerator extends PolicySynthAgentBase {
    systemPrompt: string;
    userPrompt: string;
    constructor(memory: PsBaseMemoryData, numberOfQueriesToGenerate: number, question: string, overRideSystemPrompt?: string, overRideUserPrompt?: string);
    renderMessages(): Promise<(SystemMessage | HumanMessage)[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map