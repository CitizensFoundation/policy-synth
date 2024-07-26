import { PsAgent } from "../dbModels/index.js";
export declare class AgentManager {
    getAgent(groupId: string): Promise<PsAgentAttributes>;
    createAgent(name: string, agentClassId: number, aiModels: Record<string, number | string>, groupId: number, userId: number, parentAgentId?: number): Promise<PsAgent | null>;
    updateAgentConfiguration(agentId: number, updatedConfig: Partial<YpPsAgentConfiguration>): Promise<void>;
    removeAgentAiModel(agentId: number, modelId: number): Promise<void>;
    getAgentAiModels(agentId: number): Promise<PsAiModelAttributes[] | undefined>;
    addAgentAiModel(agentId: number, modelId: number, size: string): Promise<void>;
    private createTopLevelAgent;
    private fetchAgentWithSubAgents;
}
//# sourceMappingURL=agentManager.d.ts.map