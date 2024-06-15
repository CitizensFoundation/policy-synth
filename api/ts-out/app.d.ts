import express from "express";
import WebSocket, { WebSocketServer } from "ws";
export declare class PolicySynthApiApp {
    app: express.Application;
    port: number;
    httpServer: any;
    ws: WebSocketServer;
    redisClient: any;
    wsClients: Map<string, WebSocket>;
    constructor(controllers: Array<any>, port?: number | undefined);
    setupStaticPaths(): void;
    setupDb(): Promise<void>;
    initializeMiddlewares(): void;
    initializeControllers(controllers: Array<any>): void;
    listen(): Promise<void>;
}
//# sourceMappingURL=app.d.ts.map