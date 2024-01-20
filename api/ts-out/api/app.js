import express from "express";
import bodyParser from "body-parser";
import * as path from "path";
import { createServer } from "http";
import { createClient } from "redis";
import RedisStore from "connect-redis";
import session from "express-session";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from "uuid";
import { WebSocketServer } from 'ws';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Initialize client.
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
redisClient.connect().catch(console.error);
// Initialize store.
let redisStore = new RedisStore({
    client: redisClient,
    prefix: "cps:",
});
const app = express();
const httpServer = createServer(app);
export class App {
    app;
    port;
    ws;
    wsClients = new Map();
    constructor(controllers, port) {
        this.app = app;
        this.port = parseInt(process.env.PORT || "8000");
        this.ws = new WebSocketServer({ server: httpServer });
        this.ws.on('connection', (ws) => {
            console.log(`Connection established`);
            const clientId = uuidv4();
            this.wsClients.set(clientId, ws);
            ws.send(JSON.stringify({ clientId }));
            ws.on('message', (message) => {
                // Process incoming messages
            });
            ws.on('close', () => {
                this.wsClients.delete(clientId);
                console.log(`Connection closed for client ${clientId}`);
            });
            ws.on('error', () => {
                this.wsClients.delete(clientId);
                console.log(`Connection error for client ${clientId}`);
            });
        });
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }
    initializeMiddlewares() {
        this.app.use(bodyParser.json());
        const staticHomeHTMLPath = path.join(__dirname, "../../staticHomeHTML");
        if (fs.existsSync(staticHomeHTMLPath)) {
            console.log("Serving static home HTML");
            const filePath = path.join(staticHomeHTMLPath, "index.html");
            // Check if the index.html file exists
            if (fs.existsSync(filePath)) {
                this.app.get("/", (req, res) => {
                    res.sendFile(filePath);
                });
            }
            else {
                console.error("index.html does not exist");
            }
        }
        this.app.use(express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        this.app.use("/projects*", express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        this.app.use("/crt*", express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        this.app.use("/webResearch*", express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        this.app.use("/policies*", express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        this.app.use("/solutions*", express.static(path.join(__dirname, "../../webApps/policy-synth/dist")));
        app.use(session({
            store: redisStore,
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
    listen() {
        httpServer.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}
