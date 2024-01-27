import express from "express";
export class BaseController {
    constructor(wsClients) {
        this.router = express.Router();
        this.wsClients = new Map();
        this.wsClients = wsClients;
    }
}
//# sourceMappingURL=baseController.js.map