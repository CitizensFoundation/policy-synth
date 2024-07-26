import express from "express";
import { createClient } from "redis";
import WebSocket from "ws";

let redisClient: any;

//TODO: Share this do not start on each controller
if (process.env.REDIS_AGENT_URL) {
  redisClient = createClient({
    url: process.env.REDIS_AGENT_URL,
    socket: {
      tls: true,
    },
  });
} else {
  redisClient = createClient({
    url: "redis://localhost:6379",
  });
}

export class AnalyticsController {
  public path = "/api/analytics";
  public router = express.Router();
  public wsClients = new Map<string, WebSocket>();

  constructor(wsClients: Map<string, WebSocket>) {
    this.wsClients = wsClients;
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      this.path + "/createActivityFromApp",
      this.createActivityFromApp
    );
  }

  createActivityFromApp = async (
    req: express.Request,
    res: express.Response
  ) => {
    res.sendStatus(200);
  };
}
