import { HumanMessage, SystemMessage } from "langchain/schema";
import { PolicySynthAgentBase } from "../../base.js";
export declare class SearchQueriesGenerator extends PolicySynthAgentBase {
    systemPrompt: string;
    userPrompt: string;
    constructor(numberOfQueriesToGenerate: number, question: string, overRideSystemPrompt?: string, overRideUserPrompt?: string);
    renderMessages(): Promise<(SystemMessage | HumanMessage)[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map