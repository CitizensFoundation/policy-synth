import express from "express";
import axios from "axios";
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

export class ProjectsController {
  public path = "/api/projects";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public async intializeRoutes() {
    this.router.get(this.path + "/:id", this.getProject);
    await redisClient.connect();
  }

  getProject = async (req: express.Request, res: express.Response) => {
    let memoryData;

    if (!process.env.FORCE_BACKUP_MEMORY_URL) {
      try {
        const data = await redisClient.get(`st_mem:${req.params.id}:id`);
        memoryData = data ? JSON.parse(data) : null;
      } catch (err) {
        console.error(err);
      }
    }

    if (!memoryData && process.env.BACKUP_MEMORY_URL) {
      try {
        const response = await axios.get(process.env.BACKUP_MEMORY_URL);
        memoryData = response.data;
        await redisClient.set(`st_mem:${req.params.id}:id`, JSON.stringify(memoryData));
      } catch (err) {
        console.error(err);
        return res.sendStatus(500);
      }
    }

    if (!memoryData) {
      return res.sendStatus(404);
    }

    return res.send({
      isAdmin: true,
      name: "Collective Policy Synth - Democracy",
      currentMemory: memoryData,
      configuration: {}
    });
  };
}
