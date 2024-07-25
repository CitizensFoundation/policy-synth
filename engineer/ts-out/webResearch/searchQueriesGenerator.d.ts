import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class SearchQueriesGenerator extends PolicySynthScAgentBase {
    systemPrompt: string;
    userPrompt: string;
    memory: PsEngineerMemoryData;
    constructor(memory: PsEngineerMemoryData, numberOfQueriesToGenerate: number, instructions: string);
    renderMessages(): Promise<(SystemMessage | HumanMessage)[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map