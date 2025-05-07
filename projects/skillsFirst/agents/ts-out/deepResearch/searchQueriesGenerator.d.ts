import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class SearchQueriesGenerator extends PolicySynthAgent {
    systemPrompt: string;
    userPrompt: string;
    memory: JobDescriptionMemoryData;
    licenseType: string;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, numberOfQueriesToGenerate: number, instructions: string, startProgress: number, endProgress: number, licenseType: string);
    renderMessages(): Promise<PsModelMessage[]>;
    generateSearchQueries(): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesGenerator.d.ts.map