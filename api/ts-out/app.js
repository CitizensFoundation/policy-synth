import express from "express";
import bodyParser from "body-parser";
import * as path from "path";
import { createServer } from "http";
import { createClient } from "redis";
import RedisStore from "connect-redis";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v4 as uuidv4 } from "uuid";
import { WebSocketServer } from "ws";
import { connectToDatabase } from "@policysynth/agents/dbModels/sequelize.js";
import { initializeModels } from "./models/index.js";
export class PolicySynthApiApp {
    app;
    port;
    httpServer;
    ws;
    redisClient;
    wsClients = new Map();
    constructor(controllers, port = undefined) {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.port = port || parseInt(process.env.PORT || "8000");
        this.ws = new WebSocketServer({ server: this.httpServer });
        if (process.env.REDIS_AGENT_URL) {
            this.redisClient = createClient({
                url: process.env.REDIS_AGENT_URL,
                socket: {
                    tls: true,
                },
            });
        }
        else {
            this.redisClient = createClient({
                url: "redis://localhost:6379",
            });
        }
        this.redisClient.connect().catch(console.error);
        this.ws.on("connection", (ws) => {
            console.log(`Connection established`);
            const clientId = uuidv4();
            this.wsClients.set(clientId, ws);
            ws.send(JSON.stringify({ clientId }));
            ws.on("message", (message) => {
                // Process incoming messages
            });
            ws.on("close", () => {
                this.wsClients.delete(clientId);
                console.log(`Connection closed for client ${clientId}`);
            });
            ws.on("error", () => {
                this.wsClients.delete(clientId);
                console.log(`Connection error for client ${clientId}`);
            });
        });
        this.initializeMiddlewares();
        this.setupStaticPaths();
        this.initializeControllers(controllers);
        this.setupDb();
    }
    setupStaticPaths() {
        console.log("Setting up static paths api original");
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        this.app.use(express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        this.app.use("/projects*", express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        this.app.use("/crt*", express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        this.app.use("/webResearch*", express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        this.app.use("/policies*", express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        this.app.use("/solutions*", express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
    }
    async setupDb() {
        await connectToDatabase();
        await initializeModels();
    }
    initializeMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(session({
            store: new RedisStore({
                client: this.redisClient,
                prefix: "ps:",
            }),
            secret: process.env.SESSION_SECRET
                ? process.env.SESSION_SECRET
                : "not so secret... use env var.",
            resave: false,
            saveUninitialized: false,
        }));
        if (process.env.NODE_ENV !== "development" &&
            !process.env.DISABLE_FORCE_HTTPS) {
            this.app.enable("trust proxy");
            this.app.use(function checkProtocol(req, res, next) {
                console.log(`Protocol ${req.protocol}`);
                if (!/https/.test(req.protocol)) {
                    res.redirect("https://" + req.headers.host + req.url);
                }
                else {
                    return next();
                }
            });
        }
    }
    initializeControllers(controllers) {
        controllers.forEach((ControllerClass) => {
            const controller = new ControllerClass(this.wsClients);
            this.app.use("/", controller.router);
        });
    }
    async listen() {
        this.httpServer.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}
//# sourceMappingURL=app.js.map