import express from "express";
export class BaseController {
    router = express.Router();
    wsClients = new Map();
    prompts;
    constructor(wsClients) {
        this.wsClients = wsClients;
        this.initializeRoutes();
    }
    async initializeRoutes() {
        throw new Error("Method not implemented.");
    }
}
