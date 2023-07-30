"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const redis_1 = require("redis");
let redisClient;
if (process.env.REDIS_URL) {
    redisClient = (0, redis_1.createClient)({
        url: process.env.REDIS_URL,
        socket: {
            tls: true,
        },
    });
}
else {
    redisClient = (0, redis_1.createClient)({
        url: "redis://localhost:6379",
    });
}
class ProjectsController {
    path = "/api/projects";
    router = express_1.default.Router();
    constructor() {
        this.intializeRoutes();
    }
    async intializeRoutes() {
        this.router.get(this.path + "/:id", this.getProject);
        await redisClient.connect();
    }
    getProject = async (req, res) => {
        let memoryData;
        const filteredRedisCacheKey = `st_mem_filtered_v3:${req.params.id}:id`;
        if (process.env.NODE_ENV === "production" &&
            !process.env.FORCE_BACKUP_MEMORY_URL) {
            try {
                const cachedData = await redisClient.get(filteredRedisCacheKey);
                if (cachedData) {
                    console.log("Using cached memory data");
                    return res.send(JSON.parse(cachedData));
                }
            }
            catch (err) {
                console.error(err);
            }
        }
        if (!process.env.FORCE_BACKUP_MEMORY_URL) {
            try {
                const data = await redisClient.get(`st_mem:${req.params.id}:id`);
                memoryData = data ? JSON.parse(data) : null;
            }
            catch (err) {
                console.error(err);
            }
        }
        if (!memoryData && process.env.BACKUP_MEMORY_URL) {
            try {
                const response = await axios_1.default.get(process.env.BACKUP_MEMORY_URL);
                memoryData = response.data;
                await redisClient.set(`st_mem:${req.params.id}:id`, JSON.stringify(memoryData));
            }
            catch (err) {
                console.error(err);
                return res.sendStatus(500);
            }
        }
        if (!memoryData) {
            return res.sendStatus(404);
        }
        if (memoryData.subProblems) {
            memoryData.subProblems.forEach((subProblem) => {
                if (subProblem.solutions) {
                    subProblem.solutions.populations =
                        subProblem.solutions.populations.map((population) => population.filter((solution) => !solution.reaped));
                }
            });
        }
        const filterSearchResults = (searchResults) => {
            if (searchResults && searchResults.pages) {
                for (const key in searchResults.pages) {
                    searchResults.pages[key] = searchResults.pages[key].map((result) => ({
                        url: result.url || result.link,
                        title: result.title,
                        //@ts-ignore
                        description: result.description || result.snippet,
                    }));
                }
            }
            return searchResults;
        };
        if (memoryData.problemStatement) {
            memoryData.problemStatement.searchResults = filterSearchResults(memoryData.problemStatement.searchResults);
        }
        if (memoryData.subProblems) {
            memoryData.subProblems.forEach((subProblem) => {
                subProblem.searchResults = filterSearchResults(subProblem.searchResults);
            });
        }
        if (process.env.NODE_ENV === "production") {
            try {
                await redisClient.set(filteredRedisCacheKey, JSON.stringify({
                    isAdmin: true,
                    name: "Policy Synth - Democracy",
                    currentMemory: memoryData,
                    configuration: {},
                }), {
                    EX: 60,
                });
                console.log("Caching memory data");
            }
            catch (err) {
                console.error(err);
            }
        }
        return res.send({
            isAdmin: true,
            name: "Policy Synth - Democracy",
            currentMemory: memoryData,
            configuration: {},
        });
    };
}
exports.ProjectsController = ProjectsController;
