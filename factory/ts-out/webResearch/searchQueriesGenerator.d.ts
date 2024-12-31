import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
export declare class SearchQueriesGenerator extends PolicySynthScAgentBase {
    systemPrompt: string;
    userPrompt: string;
    memory: PsAgentFactoryMemoryData;
    constructor(memory: PsAgentFactoryMemoryData, numberOfQueriesToGenerate: number, instructions: string);
    renderMessages(): Promise<(SystemMessage | HumanMessage)[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map