"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const express_1 = __importDefault(require("express"));
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
class ProjectController {
    path = "/api/project";
    router = express_1.default.Router();
    constructor() {
        this.intializeRoutes();
    }
    async intializeRoutes() {
        this.router.get(this.path + "/:id", this.getProject);
        await redisClient.connect();
    }
    getProject = async (req, res) => {
        const rawMemory = await redisClient.get(`st_mem:${req.params.id}:id`).catch((err) => console.error(err));
        if (rawMemory) {
            const memory = JSON.parse(rawMemory);
            res.send({
                isAdmin: true,
                name: "Collective Policy Synth - Democracy",
                currentMemory: memory,
                configuration: {}
            });
        }
        else {
            res.sendStatus(404);
        }
    };
}
exports.ProjectController = ProjectController;
