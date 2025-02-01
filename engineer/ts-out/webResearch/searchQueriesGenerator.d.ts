import { PolicySynthAgent } from "@policysynth/agents/base/agent";
import { PsAgent } from "@policysynth/agents/dbModels/agent";
export declare class SearchQueriesGenerator extends PolicySynthAgent {
    systemPrompt: string;
    userPrompt: string;
    memory: PsEngineerMemoryData;
    constructor(memory: PsEngineerMemoryData, agent: PsAgent, startProgress: number, endProgress: number, numberOfQueriesToGenerate: number, instructions: string);
    renderMessages(): Promise<PsModelMessage[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map