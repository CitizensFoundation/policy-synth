import { BaseController } from "@policysynth/api/dist/controllers/baseController.js";
import express from "express";
import WebSocket from "ws";
export declare class SimpleController extends BaseController {
    path: string;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): Promise<void>;
    simpleChat: (req: express.Request, res: express.Response) => Promise<void>;
}
//# sourceMappingURL=simpleController.d.ts.map