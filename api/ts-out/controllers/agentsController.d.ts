import express from "express";
import WebSocket from "ws";
export declare class AgentsController {
    path: string;
    router: import("express-serve-static-core").Router;
    wsClients: Map<string, WebSocket>;
    private agentManager;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): void;
    getActiveAiModels: (req: express.Request, res: express.Response) => Promise<void>;
    getActiveAgentClasses: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
    getActiveConnectorClasses: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
    controlAgent: () => (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
    updateNodeConfiguration: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
    getAgentStatus: (req: express.Request, res: express.Response) => Promise<void>;
    updateAgentStatus: (req: express.Request, res: express.Response) => Promise<void>;
    startAgentProcessing: (req: express.Request, res: express.Response) => Promise<void>;
    pauseAgentProcessing: (req: express.Request, res: express.Response) => Promise<void>;
    getAgentCosts(req: express.Request, res: express.Response): Promise<void>;
    getAgent: (req: express.Request, res: express.Response) => Promise<void>;
    fetchAgentWithSubAgents(agentId: string): Promise<{
        Class?: PsAgentClassAttributes | undefined;
        parent_agent_id?: number | undefined;
        parentAgent?: PsAgentAttributes | undefined;
        SubAgents?: PsAgentAttributes[] | undefined;
        Connectors?: PsAgentConnectorAttributes[] | undefined;
        AiModels?: PsAiModelAttributes[] | undefined;
        Evals?: PsAgentEvalAttributes[] | undefined;
        configuration: PsAgentBaseConfiguration;
        class_id: number;
        group_id: number;
        User?: YpUserData | undefined;
        Group?: YpGroupData | undefined;
        ApiUsage?: PsExternalApiUsageAttributes[] | undefined;
        ModelUsage?: PsModelUsageAttributes[] | undefined;
        ExternalApis?: PsExternalApiAttributes[] | undefined;
        id: number;
        uuid: string;
        user_id: number;
        created_at: Date;
        updated_at: Date;
    }>;
    fetchNestedSubAgents(parentAgentId: number): Promise<any[]>;
}
//# sourceMappingURL=agentsController.d.ts.map