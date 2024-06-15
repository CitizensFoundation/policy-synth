import express from "express";
import { createClient } from "redis";
import WebSocket from "ws";
import {
  PsAgent,
  PsAgentConnector,
  PsAgentClass,
  User,
  Group,
  PsApiCost,
  PsModelCost,
  PsAiModel,
} from "../models/index.js";

let redisClient;

// TODO: Share this do not start on each controller
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

export class AgentsController {
  public path = "/api/agents";
  public router = express.Router();
  public wsClients = new Map<string, WebSocket>();

  constructor(wsClients: Map<string, WebSocket>) {
    this.wsClients = wsClients;
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path + "/:id", this.getAgent);
  }

  getAgent = async (req: express.Request, res: express.Response) => {
    const agentId = req.params.id;

    try {
      const agent = await this.fetchAgentWithSubAgents(agentId);
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  async fetchAgentWithSubAgents(agentId: string) {
    const agent = await PsAgent.findByPk(agentId, {
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
        { model: PsApiCost, as: "ApiCosts" },
        { model: PsModelCost, as: "ModelCosts" },
        { model: PsAiModel, as: "AiModels" },
      ],
    });

    if (!agent) {
      throw new Error("Agent not found");
    }

    const subAgents = agent.SubAgents
      ? await this.fetchNestedSubAgents(agent.SubAgents)
      : [];

    return {
      ...agent.toJSON(),
      SubAgents: subAgents,
    };
  }

  async fetchNestedSubAgents(subAgents: PsAgent[]): Promise<any[]> {
    return Promise.all(
      subAgents.map(async (subAgent) => {
        const nestedSubAgent = await PsAgent.findByPk(subAgent.id, {
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
            { model: PsApiCost, as: "ApiCosts" },
            { model: PsModelCost, as: "ModelCosts" },
            { model: PsAiModel, as: "AiModels" },
          ],
        });

        if (!nestedSubAgent) {
          return null;
        }

        const subSubAgents = await this.fetchNestedSubAgents(
          nestedSubAgent.SubAgents || []
        );

        return {
          ...nestedSubAgent.toJSON(),
          SubAgents: subSubAgents,
        };
      })
    );
  }
}
