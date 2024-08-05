import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
export declare class GoldPlatingResearchAgent extends PolicySynthAgentQueue {
    memory: GoldPlatingMemoryData;
    private static readonly GOLDPLATING_AGENT_CLASS_BASE_ID;
    private static readonly GOLDPLATING_AGENT_CLASS_VERSION;
    get agentQueueName(): string;
    get processors(): {
        processor: typeof GoldPlatingResearchAgent;
        weight: number;
    }[];
    setupMemoryIfNeeded(): Promise<void>;
    process(): Promise<void>;
    private processResearchItem;
    private cleanAndProcessNationalLawsAndRegulations;
    static getAgentClass(): PsAgentClassCreationAttributes;
    static getConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=goldPlatingResearchAgent.d.ts.map