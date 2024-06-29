import express from "express";
import { createClient } from "redis";
import WebSocket from "ws";
import {
  PsAgent,
  PsAgentConnector,
  PsAgentClass,
  User,
  Group,
  PsExternalApiUsage,
  PsModelUsage,
  PsAiModel,
  PsAgentConnectorClass,
  sequelize
} from "../models/index.js";
import { AgentManagerService } from "../operations/agentManager.js";
import { Queue } from "bullmq";
import { QueryTypes } from "sequelize";

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
  private agentManager: AgentManagerService;

  constructor(wsClients: Map<string, WebSocket>) {
    this.wsClients = wsClients;
    this.agentManager = new AgentManagerService();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path + "/:id", this.getAgent);
    this.router.put(this.path + "/:agentId/:nodeType/:nodeId/configuration", this.updateNodeConfiguration);

    this.router.post(this.path + "/:id/control", this.controlAgent());
    this.router.get(this.path + "/:id/status", this.getAgentStatus);
    this.router.get(this.path + "/:id/costs", this.getAgentCosts);
  }

  controlAgent = () => async (req: express.Request, res: express.Response) => {
    const agentId = parseInt(req.params.id);
    const action = req.body.action;

    try {
      const agent = await PsAgent.findByPk(agentId, {
        include: [{ model: PsAgentClass, as: "Class" }],
      });

      if (!agent || !agent.Class) {
        return res.status(404).send('Agent or Agent Class not found');
      }

      const queueName = agent.Class.configuration.queueName;
      if (!queueName) {
        return res.status(400).send('Queue name not defined for this agent class');
      }

      const queue = new Queue(queueName);

      await queue.add(`${action}Agent`, { agentId, action });

      res.json({ message: `${action.charAt(0).toUpperCase() + action.slice(1)} request for agent ${agentId} queued in ${queueName}` });
    } catch (error) {
      console.error(`Error ${action}ing agent:`, error);
      res.status(500).send("Internal Server Error");
    }
  };

  updateNodeConfiguration = async (req: express.Request, res: express.Response) => {
    const agentId = parseInt(req.params.agentId);
    const nodeId = parseInt(req.params.nodeId);
    const nodeType = req.params.nodeType as 'agent' | 'connector';
    const updatedConfig = req.body;

    try {
      let node;
      if (nodeType === 'agent') {
        node = await PsAgent.findByPk(nodeId);
      } else if (nodeType === 'connector') {
        node = await PsAgentConnector.findByPk(nodeId);
      }

      if (!node) {
        return res.status(404).send(`${nodeType} not found`);
      }

      // Update the node's configuration
      node.configuration = {
        ...node.configuration,
        ...updatedConfig
      };

      await node.save();

      res.json({ message: `${nodeType} configuration updated successfully` });
    } catch (error) {
      console.error(`Error updating ${nodeType} configuration:`, error);
      res.status(500).send("Internal Server Error");
    }
  };


  getAgentStatus = async (req: express.Request, res: express.Response) => {
    const agentId = parseInt(req.params.id);

    try {
      const status = await this.agentManager.getAgentStatus(agentId);
      if (status) {
        res.json(status);
      } else {
        res.status(404).send('Agent status not found');
      }
    } catch (error) {
      console.error("Error getting agent status:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  updateAgentStatus = async (req: express.Request, res: express.Response) => {
    const agentId = parseInt(req.params.id);
    const { state, details } = req.body;

    try {
      const success = await this.agentManager.updateAgentStatus(agentId, state, details);
      if (success) {
        res.json({ message: 'Agent status updated successfully' });
      } else {
        res.status(404).send('Agent not found');
      }
    } catch (error) {
      console.error("Error updating agent status:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  startAgentProcessing = async (req: express.Request, res: express.Response) => {
    const agentId = parseInt(req.params.id);

    try {
      const success = await this.agentManager.startAgentProcessing(agentId);
      if (success) {
        res.json({ message: 'Agent processing started successfully' });
      } else {
        res.status(404).send('Agent not found');
      }
    } catch (error) {
      console.error("Error starting agent processing:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  pauseAgentProcessing = async (req: express.Request, res: express.Response) => {
    const agentId = parseInt(req.params.id);

    try {
      const success = await this.agentManager.pauseAgentProcessing(agentId);
      if (success) {
        res.json({ message: 'Agent processing paused successfully' });
      } else {
        res.status(404).send('Agent not found');
      }
    } catch (error) {
      console.error("Error pausing agent processing:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  public async getAgentCosts(req: express.Request, res: express.Response) {
    const agentId = parseInt(req.params.id);

    try {
      const results = await sequelize.query(`
        SELECT
          COALESCE(SUM(
            (COALESCE(mu.token_in_count, 0) * COALESCE(CAST(am.configuration#>>'{prices,costInTokensPerMillion}' AS FLOAT), 0) +
             COALESCE(mu.token_out_count, 0) * COALESCE(CAST(am.configuration#>>'{prices,costOutTokensPerMillion}' AS FLOAT), 0)) / 1000000.0
          ), 0) as total_cost
        FROM ps_agents a
        LEFT JOIN "AgentModels" am_join ON a.id = am_join.agent_id
        LEFT JOIN ps_ai_models am ON am_join.ai_model_id = am.id
        LEFT JOIN ps_model_usage mu ON mu.model_id = am.id AND mu.agent_id = a.id
        WHERE a.id = :agentId
      `, {
        replacements: { agentId },
        type: QueryTypes.SELECT
      });

      const totalCost = (results[0] as { total_cost: string }).total_cost;
      res.json({ totalCost: parseFloat(totalCost).toFixed(2) });
    } catch (error) {
      console.error('Error calculating agent costs:', error);
      res.status(500).send('Internal Server Error');
    }
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

  async fetchNestedSubAgents(parentAgentId: number): Promise<any[]> {
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

    return Promise.all(
      subAgents.map(async (subAgent) => {
        const nestedSubAgents = await this.fetchNestedSubAgents(subAgent.id);
        return {
          ...subAgent.toJSON(),
          SubAgents: nestedSubAgents,
        };
      })
    );
  }
}
