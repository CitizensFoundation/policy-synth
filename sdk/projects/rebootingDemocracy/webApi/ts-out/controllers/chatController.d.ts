/// <reference types="node" />
import { BaseController } from "@policysynth/api/controllers/baseController.js";
import express from "express";
import WebSocket from "ws";
export declare class ChatController extends BaseController {
    path: string;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): Promise<void>;
    private getChatLog;
    rebootDemocracyChat: (req: express.Request, res: express.Response) => Promise<void>;
}
//# sourceMappingURL=chatController.d.ts.map