import { PsAgent, PsAgentClass, PsAgentConnector } from "../dbModels/index.js";
export declare class AgentConnectorManager {
    createConnector(agentId: number, connectorClassId: number, userId: number, name: string, type: "input" | "output"): Promise<PsAgentConnector | null>;
    createYourPrioritiesGroupAndUpdateAgent(agent: PsAgent, agentClass: PsAgentClass, agentConnector: PsAgentConnector): Promise<YpGroupData>;
    getHeaders(): {
        [key: string]: string;
    };
    createGroup(currentGroupId: number, communityId: number, userId: number, name: string, description: string, structuredQuestions: any[]): Promise<unknown>;
    updateConnectorConfiguration(connectorId: number, updatedConfig: Partial<PsAgentConnectorConfiguration>): Promise<void>;
    addExistingConnector(groupId: number, agentId: number, connectorId: number, type: 'input' | 'output'): Promise<void>;
}
//# sourceMappingURL=agentConnectorManager.d.ts.map