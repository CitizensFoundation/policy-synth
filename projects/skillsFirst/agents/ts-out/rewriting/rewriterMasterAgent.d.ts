import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class JobDescriptionRewriterMasterAgent extends PolicySynthAgent {
    memory: any;
    constructor(agent: PsAgent, memory: any, startProgress: number, endProgress: number);
    processJobDescription(jobDescription: JobDescription): Promise<void>;
}
//# sourceMappingURL=rewriterMasterAgent.d.ts.map