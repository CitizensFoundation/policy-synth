import express from "express";
import { models } from "../models";
import { createClient } from "redis";

let redisClient: any;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
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

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
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
