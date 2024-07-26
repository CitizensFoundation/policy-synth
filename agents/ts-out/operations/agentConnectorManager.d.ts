import { PsAgent, PsAgentClass, PsAgentConnector } from "../dbModels/index.js";
export declare class AgentConnectorManager {
    createConnector(agentId: number, connectorClassId: number, name: string, type: "input" | "output"): Promise<PsAgentConnector | null>;
    createGroupAndUpdateAgent(agent: PsAgent, agentClass: PsAgentClass): Promise<YpGroupData>;
    getHeaders(): {
        [key: string]: string;
    };
    createGroup(communityId: number, name: string, description: string, structuredQuestions: any[]): Promise<unknown>;
    updateConnectorConfiguration(connectorId: number, updatedConfig: Partial<PsAgentConnectorConfiguration>): Promise<void>;
}
//# sourceMappingURL=agentConnectorManager.d.ts.map