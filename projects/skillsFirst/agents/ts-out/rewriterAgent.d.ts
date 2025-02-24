import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class JobDescriptionRewriterAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    runRewritingPipeline(): Promise<void>;
    processJobDescription(_jobDescription: JobDescription): Promise<void>;
}
//# sourceMappingURL=rewriterAgent.d.ts.map