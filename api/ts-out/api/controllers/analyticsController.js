import express from "express";
import { createClient } from "redis";
let redisClient;
if (process.env.REDIS_URL) {
    redisClient = createClient({
        url: process.env.REDIS_URL,
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
    constructor(wsClients) {
        this.path = "/api/analytics";
        this.router = express.Router();
        this.wsClients = new Map();
        this.createActivityFromApp = async (req, res) => {
            res.sendStatus(200);
        };
        this.wsClients = wsClients;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(this.path + "/createActivityFromApp", this.createActivityFromApp);
    }
}
