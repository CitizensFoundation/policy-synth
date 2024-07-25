import { PsAgentConnector } from "../models/index.js";
export declare class AgentConnectorManager {
    createConnector(agentId: number, connectorClassId: number, name: string, type: "input" | "output"): Promise<PsAgentConnector | null>;
    updateConnectorConfiguration(connectorId: number, updatedConfig: Partial<PsAgentConnectorConfiguration>): Promise<void>;
}
//# sourceMappingURL=agentConnectorManager.d.ts.map