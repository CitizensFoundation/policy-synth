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
        return res.send({
            isAdmin: true,
            name: "Collective Policy Synth - Democracy",
            currentMemory: memoryData,
            configuration: {}
        });
    };
}
exports.ProjectsController = ProjectsController;
