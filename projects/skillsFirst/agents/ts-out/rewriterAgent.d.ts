import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class JobDescriptionRewriterAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    static readonly JOB_DESCRIPTION_REWRITER_AGENT_CLASS_VERSION = 1;
    static readonly JOB_DESCRIPTION_REWRITER_AGENT_CLASS_BASE_ID = "f340db77-476b-4195-bd51-6ea2a1610833";
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    runRewritingPipeline(): Promise<void>;
    process(): Promise<void>;
    static getAgentClass(): PsAgentClassCreationAttributes;
    static getConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=rewriterAgent.d.ts.map