import express from "express";
import WebSocket from "ws";
export declare class ProjectsController {
    path: string;
    router: import("express-serve-static-core").Router;
    private evidenceWebPageVectorStore;
    wsClients: Map<string, WebSocket>;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): Promise<void>;
    getMiddleSolutions: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    getRawEvidence: (req: express.Request, res: express.Response) => Promise<void>;
    getProject: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
}
//# sourceMappingURL=projectsController.d.ts.map