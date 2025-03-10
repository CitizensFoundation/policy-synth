import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class RewriteSubAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    rewriteJobDescription(jobDescription: JobDescription): Promise<string>;
}
//# sourceMappingURL=rewriteSubAgent.d.ts.map