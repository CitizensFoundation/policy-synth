import { PsAgent, Group } from "../dbModels/index.js";
export declare class AgentManager {
    getAgent(groupId: string): Promise<PsAgentAttributes>;
    getSubAgentMemoryKey(groupId: string, agentId: number): Promise<string | null>;
    createAgent(name: string, agentClassId: number, aiModels: Record<string, number | string>, groupId: number, userId: number, parentAgentId?: number): Promise<PsAgent | null>;
    updateAgentConfiguration(agentId: number, updatedConfig: Partial<YpPsAgentConfiguration>): Promise<void>;
    removeAgentAiModel(agentId: number, modelId: number): Promise<void>;
    getAgentAiModels(agentId: number): Promise<PsAiModelAttributes[] | undefined>;
    addAgentAiModel(agentId: number, modelId: number, size: string): Promise<void>;
    createTopLevelAgent(group: Group): Promise<PsAgent>;
    fetchAgentWithSubAgents(agentId: number): Promise<PsAgentAttributes>;
}
//# sourceMappingURL=agentManager.d.ts.map