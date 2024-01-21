import WebSocket from "ws";
export declare abstract class BaseController {
    router: import("express-serve-static-core").Router;
    wsClients: Map<string, WebSocket>;
    prompts: Map<number, string> | undefined;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): Promise<void>;
}
//# sourceMappingURL=baseController.d.ts.map