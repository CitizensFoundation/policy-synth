import { PsAgentConnector } from "@policysynth/agents/dbModels/agentConnector.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModel } from "@policysynth/agents/dbModels/aiModel.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class AgentsManager {
    private redisClient;
    constructor();
    private initializeRedisClient;
    getActiveAiModels(): Promise<PsAiModel[]>;
    getActiveAgentClasses(): Promise<PsAgentClassAttributes[] | undefined>;
    getActiveConnectorClasses(): Promise<PsAgentConnectorClassAttributes[] | undefined>;
    createAgent(name: string, agentClassId: number, aiModels: Record<string, number>, parentAgentId?: number): Promise<PsAgent | null>;
    createConnector(agentId: number, connectorClassId: number, name: string, type: "input" | "output"): Promise<PsAgentConnector | null>;
    controlAgent(agentId: number, action: string): Promise<string>;
    getAgentStatus(agentId: number): Promise<any>;
    updateAgentStatus(agentId: number, state: string, details: any): Promise<boolean>;
    startAgentProcessing(agentId: number): Promise<boolean>;
    pauseAgentProcessing(agentId: number): Promise<boolean>;
    getAgentCosts(agentId: number): Promise<{
        agentCosts: {
            agentId: any;
            level: any;
            cost: string;
        }[];
        totalCost: string;
    }>;
    getSingleAgentCosts(agentId: number): Promise<{
        totalCost: string;
    }>;
    getAgent(groupId: number): Promise<PsAgentAttributes>;
    fetchAgentWithSubAgents(agentId: number): Promise<PsAgentAttributes>;
    fetchNestedSubAgents(parentAgentId: number): Promise<any[]>;
    updateNodeConfiguration(agentId: number, nodeType: "agent" | "connector", nodeId: number, updatedConfig: any): Promise<void>;
    getAgentAiModels(agentId: number): Promise<PsAiModelAttributes[] | undefined>;
    removeAgentAiModel(agentId: number, modelId: number): Promise<void>;
    addAgentAiModel(agentId: number, modelId: number, size: PsAiModelSize): Promise<void>;
}
//# sourceMappingURL=agentsManager.d.ts.map