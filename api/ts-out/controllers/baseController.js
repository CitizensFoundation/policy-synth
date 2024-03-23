import express from "express";
export class BaseController {
    router = express.Router();
    wsClients = new Map();
    basePromptOverrides;
    constructor(wsClients) {
        this.wsClients = wsClients;
    }
}
//# sourceMappingURL=baseController.js.map