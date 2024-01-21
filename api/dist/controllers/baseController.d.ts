import WebSocket from "ws";
export declare abstract class BaseController {
    router: import("express-serve-static-core").Router;
    wsClients: Map<string, WebSocket>;
    basePromptOverrides: Map<number, string> | undefined;
    constructor(wsClients: Map<string, WebSocket>);
}
//# sourceMappingURL=baseController.d.ts.map