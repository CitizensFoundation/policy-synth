import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class JobDescriptionAnalysisAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    private static readonly JOB_DESCRIPTION_AGENT_CLASS_BASE_ID;
    private static readonly JOB_DESCRIPTION_AGENT_CLASS_VERSION;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    process(): Promise<void>;
    private selectRandomJobDescriptions;
    private extractTextFromHtml;
    private processJobDescription;
    static getAgentClass(): PsAgentClassCreationAttributes;
    static getConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=classificationAgent.d.ts.map