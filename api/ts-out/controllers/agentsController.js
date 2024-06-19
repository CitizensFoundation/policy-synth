import express from "express";
import { createClient } from "redis";
import { PsAgent, PsAgentConnector, PsAgentClass, User, Group, PsExternalApiUsage, PsModelUsage, PsAiModel, PsAgentConnectorClass, } from "../models/index.js";
let redisClient;
// TODO: Share this do not start on each controller
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
export class AgentsController {
    path = "/api/agents";
    router = express.Router();
    wsClients = new Map();
    constructor(wsClients) {
        this.wsClients = wsClients;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path + "/:id", this.getAgent);
    }
    getAgent = async (req, res) => {
        const agentId = req.params.id;
        try {
            const agent = await this.fetchAgentWithSubAgents(agentId);
            res.json(agent);
        }
        catch (error) {
            console.error("Error fetching agent:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    async fetchAgentWithSubAgents(agentId) {
        console.log("Fetching agent with ID:", agentId); // Debug logging
        const agent = await PsAgent.findByPk(agentId, {
            include: [
                {
                    model: PsAgent,
                    as: "SubAgents",
                    include: [
                        {
                            model: PsAgentConnector,
                            as: "Connectors",
                            include: [
                                {
                                    model: PsAgentConnectorClass,
                                    as: "Class",
                                },
                            ],
                        },
                        { model: PsAgentClass, as: "Class" },
                    ],
                },
                {
                    model: PsAgentConnector,
                    as: "Connectors",
                    include: [
                        {
                            model: PsAgentConnectorClass,
                            as: "Class",
                        },
                    ],
                },
                { model: PsAgentClass, as: "Class" },
                { model: User, as: "User" },
                { model: Group, as: "Group" },
                { model: PsExternalApiUsage, as: "ExternalApiUsage" },
                { model: PsModelUsage, as: "ModelUsage" },
                { model: PsAiModel, as: "AiModels" },
            ],
        });
        if (!agent) {
            throw new Error("Agent not found");
        }
        console.log("Agent found:", agent.toJSON()); // Debug logging
        //const subAgents = await this.fetchNestedSubAgents(agent.id);
        //console.log("Sub-agents fetched:", subAgents); // Debug logging
        return {
            ...agent.toJSON(),
            //  SubAgents: subAgents,
        };
    }
    async fetchNestedSubAgents(parentAgentId) {
        if (!parentAgentId) {
            return [];
        }
        console.log("Fetching sub-agents for parent ID:", parentAgentId); // Debug logging
        const subAgents = await PsAgent.findAll({
            where: { parent_agent_id: parentAgentId },
            include: [
                {
                    model: PsAgent,
                    as: "SubAgents",
                    include: [{ model: PsAgentConnector, as: "Connectors" }],
                },
                { model: PsAgentConnector, as: "Connectors" },
                { model: PsAgentClass, as: "Class" },
                { model: User, as: "User" },
                { model: Group, as: "Group" },
                { model: PsExternalApiUsage, as: "ExternalApiUsage" },
                { model: PsModelUsage, as: "ModelUsage" },
                { model: PsAiModel, as: "AiModels" },
            ],
        });
        console.log("Sub-agents found:", subAgents); // Debug logging
        return Promise.all(subAgents.map(async (subAgent) => {
            const nestedSubAgents = await this.fetchNestedSubAgents(subAgent.id);
            return {
                ...subAgent.toJSON(),
                SubAgents: nestedSubAgents,
            };
        }));
    }
}
//# sourceMappingURL=agentsController.js.map