import express from "express";
import WebSocket from "ws";
export declare class AgentsController {
    path: string;
    router: import("express-serve-static-core").Router;
    wsClients: Map<string, WebSocket>;
    private agentQueueManager;
    private agentCostManager;
    private agentManager;
    private agentConnectorManager;
    private agentRegistryManager;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): void;
    getAgent: (req: express.Request, res: express.Response) => Promise<void>;
    getAgentAiModels: (req: express.Request, res: express.Response) => Promise<void>;
    removeAgentAiModel: (req: express.Request, res: express.Response) => Promise<void>;
    addAgentAiModel: (req: express.Request, res: express.Response) => Promise<void>;
    updateNodeConfiguration: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
    createInputConnector: (req: express.Request, res: express.Response) => Promise<void>;
    createOutputConnector: (req: express.Request, res: express.Response) => Promise<void>;
    createConnector: (req: express.Request, res: express.Response, type: "input" | "output") => Promise<express.Response<any, Record<string, any>> | undefined>;
    getActiveAiModels: (req: express.Request, res: express.Response) => Promise<void>;
    getActiveAgentClasses: (req: express.Request, res: express.Response) => Promise<void>;
    getActiveConnectorClasses: (req: express.Request, res: express.Response) => Promise<void>;
    createAgent: (req: express.Request, res: express.Response) => Promise<void>;
    controlAgent: (req: express.Request, res: express.Response) => Promise<void>;
    getAgentStatus: (req: express.Request, res: express.Response) => Promise<void>;
    updateAgentStatus: (req: express.Request, res: express.Response) => Promise<void>;
    startAgentProcessing: (req: express.Request, res: express.Response) => Promise<void>;
    pauseAgentProcessing: (req: express.Request, res: express.Response) => Promise<void>;
    getAgentCosts: (req: express.Request, res: express.Response) => Promise<void>;
}
//# sourceMappingURL=agentsController.d.ts.map