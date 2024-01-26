import express from "express";
import WebSocket from "ws";
import { BaseController } from "./baseController.js";
export declare class TreeController extends BaseController {
    path: string;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): Promise<void>;
    updateNode: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    updateNodeChildren: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    deleteNode: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    runValidationChain: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    getRefinedCauses: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    addDirectCauses: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    getTree: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    addNode: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    reviewTreeConfiguration: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    createTree: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    createDirectCauses: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
    protected getData(key: string | number): Promise<LtpCurrentRealityTreeData | null>;
    protected setData(key: string | number, value: string): Promise<void>;
    protected createData(value: string | any): Promise<number | string>;
    protected deleteData(key: string | number): Promise<void>;
    private getParentNodes;
    private findNearestUde;
    private findParentNode;
    private isParentNode;
    private findNode;
}
//# sourceMappingURL=treeController.d.ts.map