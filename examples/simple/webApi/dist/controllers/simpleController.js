import { BaseController } from "@policysynth/api/dist/controllers/baseController.js";
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
export class SimpleController extends BaseController {
    constructor(wsClients) {
        super(wsClients);
        this.path = "/api/simple";
        this.simpleChat = async (req, res) => {
            const treeId = req.params.id;
            const updatedNode = req.body;
        };
        this.initializeRoutes();
    }
    async initializeRoutes() {
        this.router.get(this.path + "/:id", this.simpleChat);
        await redisClient.connect();
    }
}
