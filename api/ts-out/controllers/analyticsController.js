import express from "express";
import { createClient } from "redis";
let redisClient;
//TODO: Share this do not start on each controller
if (process.env.REDIS_AGENT_URL) {
    redisClient = createClient({
        url: process.env.REDIS_AGENT_URL,
        socket: {
            tls: true,
        },
    });
}
else {
    redisClient = createClient({
        url: "redis://localhost:6379",
    });
}
export class AnalyticsController {
    path = "/api/analytics";
    router = express.Router();
    wsClients = new Map();
    constructor(wsClients) {
        this.wsClients = wsClients;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(this.path + "/createActivityFromApp", this.createActivityFromApp);
    }
    createActivityFromApp = async (req, res) => {
        res.sendStatus(200);
    };
}
//# sourceMappingURL=analyticsController.js.map