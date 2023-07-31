import express from "express";
import axios from "axios";
import { models } from "../models";
import {
  RedisFunctions,
  RedisModules,
  RedisScripts,
  createClient,
} from "redis";
import { RedisClientType } from "@redis/client";

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

const memoryCache: { [key: string]: { data: any; timer: NodeJS.Timeout } } = {};


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

    const filteredRedisCacheKey = `st_mem_filtered_v3:${req.params.id}:id`;

    if (
      process.env.NODE_ENV === "production" &&
      !process.env.FORCE_BACKUP_MEMORY_URL
    ) {
      try {
        // Try to get from memory cache first
        if (memoryCache[filteredRedisCacheKey]) {
          console.log("Using memory cache data");
          return res.send(memoryCache[filteredRedisCacheKey].data);
        }

        const cachedData = await redisClient.get(filteredRedisCacheKey);
        if (cachedData) {
          console.log("Using cached Redis data");
          return res.send(JSON.parse(cachedData));
        }
      } catch (err) {
        console.error(err);
      }
    }
    320.751

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
        await redisClient.set(
          `st_mem:${req.params.id}:id`,
          JSON.stringify(memoryData)
        );
      } catch (err) {
        console.error(err);
        return res.sendStatus(500);
      }
    }

    if (!memoryData) {
      return res.sendStatus(404);
    }

    if (memoryData.subProblems) {
      memoryData.subProblems.forEach((subProblem: IEngineSubProblem) => {
        if (subProblem.solutions) {
          subProblem.solutions.populations =
            subProblem.solutions.populations.map(
              (population: IEngineSolution[]) =>
                population.filter(
                  (solution: IEngineSolution) => !solution.reaped
                )
            );
        }
      });
    }

    const filterSearchResults = (searchResults: IEngineSearchResults) => {
      if (searchResults && searchResults.pages) {
        for (const key in searchResults.pages) {
          searchResults.pages[key as IEngineWebPageTypes] = searchResults.pages[
            key as IEngineWebPageTypes
          ].map(
            (result) =>
              ({
                url: result.url || result.link,
                title: result.title,
                //@ts-ignore
                description: result.description || result.snippet,
              } as any)
          );
        }
      }
      return searchResults;
    };

    if (memoryData.problemStatement) {
      memoryData.problemStatement.searchResults = filterSearchResults(
        memoryData.problemStatement.searchResults
      );
    }

    if (memoryData.subProblems) {
      memoryData.subProblems.forEach((subProblem: IEngineSubProblem) => {
        subProblem.searchResults = filterSearchResults(
          subProblem.searchResults
        );
        if (subProblem.searchResults) {
          //@ts-ignore
          delete subProblem.searchResults.knowledgeGraph;
        }
      });
    }

    if (false && process.env.NODE_ENV === "production") {
      try {
        await redisClient.set(
          filteredRedisCacheKey,
          JSON.stringify({
            isAdmin: true,
            name: "Policy Synth - Democracy",
            currentMemory: memoryData,
            configuration: {},
          }),
          {
            EX: 60,
          }
        );

        console.log("Caching memory data to redis");
      } catch (err) {
        console.error(err);
      }
    }

    const response = {
      isAdmin: true,
      name: "Policy Synth - Save Democracy!",
      currentMemory: memoryData,
      configuration: {},
    };

    // Add to memory cache
    memoryCache[filteredRedisCacheKey] = {
      data: response,
      timer: setTimeout(() => {
        console.log("Deleting memory cache data");
        delete memoryCache[filteredRedisCacheKey];
      }, 60*60*1000),
    };

    console.log("Caching data to memory")

    return res.send(response);
  };
}
