import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
export declare class GoldPlatingResearchAgent extends PolicySynthAgent {
    memory: GoldPlatingMemoryData;
    private static readonly GOLDPLATING_AGENT_CLASS_BASE_ID;
    private static readonly GOLDPLATING_AGENT_CLASS_VERSION;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    process(): Promise<void>;
    private processResearchItem;
    private cleanAndProcessNationalLawsAndRegulations;
    static getAgentClass(): PsAgentClassCreationAttributes;
    static getConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=goldPlatingResearchAgent.d.ts.map