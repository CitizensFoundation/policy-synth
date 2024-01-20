import express from "express";
import WebSocket from "ws";
export declare class AnalyticsController {
    path: string;
    router: import("express-serve-static-core").Router;
    wsClients: Map<string, WebSocket>;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): void;
    createActivityFromApp: (req: express.Request, res: express.Response) => Promise<void>;
}
//# sourceMappingURL=analyticsController.d.ts.map