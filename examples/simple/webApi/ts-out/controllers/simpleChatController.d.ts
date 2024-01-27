import { BaseController } from "@policysynth/api/controllers/baseController.js";
import express from "express";
import WebSocket from "ws";
export declare class SimpleChatController extends BaseController {
    path: string;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): Promise<void>;
    simpleChat: (req: express.Request, res: express.Response) => Promise<void>;
}
//# sourceMappingURL=simpleChatController.d.ts.map