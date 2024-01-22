import express from "express";
import { WebSocketServer } from 'ws';
export declare class App {
    app: express.Application;
    port: number;
    ws: WebSocketServer;
    wsClients: Map<string, WebSocket>;
    constructor(controllers: Array<any>, port: number);
    private initializeMiddlewares;
    private initializeControllers;
    listen(): void;
}
//# sourceMappingURL=app.d.ts.map