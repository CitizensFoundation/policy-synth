import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsEngineerAgentBase } from "../agentBase.js";
export declare class SearchQueriesGenerator extends PsEngineerAgentBase {
    systemPrompt: string;
    userPrompt: string;
    memory: PsEngineerMemoryData;
    constructor(memory: PsEngineerMemoryData, agent: PsAgent, startProgress: number, endProgress: number, numberOfQueriesToGenerate: number, instructions: string);
    renderMessages(): Promise<PsModelMessage[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map