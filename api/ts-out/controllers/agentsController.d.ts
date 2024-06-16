import express from "express";
import WebSocket from "ws";
export declare class AgentsController {
    path: string;
    router: import("express-serve-static-core").Router;
    wsClients: Map<string, WebSocket>;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): void;
    getAgent: (req: express.Request, res: express.Response) => Promise<void>;
    fetchAgentWithSubAgents(agentId: string): Promise<{
        SubAgents: any[];
        Class?: PsAgentClassAttributes | undefined;
        parent_agent_id?: number | undefined;
        parentAgent?: PsAgentAttributes | undefined;
        Connectors?: PsAgentConnectorAttributes[] | undefined;
        AiModels?: PsAiModelAttributes[] | undefined;
        configuration: PsAgentBaseConfiguration;
        class_id: number;
        group_id: number;
        User?: YpUserData | undefined;
        Group?: YpGroupData | undefined;
        ApiCosts?: PsApiCostAttributes[] | undefined;
        ModelCosts?: PsModelCostAttributes[] | undefined;
        id: number;
        uuid: string;
        user_id: number;
        created_at: Date;
        updated_at: Date;
    }>;
    fetchNestedSubAgents(parentAgentId: number): Promise<any[]>;
}
//# sourceMappingURL=agentsController.d.ts.map