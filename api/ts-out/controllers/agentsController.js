import express from "express";
import { createClient } from "redis";
import { PsAgent, PsAgentConnector, PsAgentClass, User, Group, PsExternalApiUsage, PsModelUsage, PsAiModel, PsAgentConnectorClass, sequelize, PsAgentRegistry, } from "../models/index.js";
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
    agentManager;
    constructor(wsClients) {
        this.wsClients = wsClients;
        this.agentManager = new AgentManagerService();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path + "/:id", this.getAgent);
        this.router.put(this.path + "/:agentId/:nodeType/:nodeId/configuration", this.updateNodeConfiguration);
        this.router.post(this.path + "/:id/control", this.controlAgent());
        this.router.get(this.path + "/:id/status", this.getAgentStatus);
        this.router.get(this.path + "/:id/costs", this.getAgentCosts);
        this.router.get(this.path + "/registry/agentClasses", this.getActiveAgentClasses);
        this.router.get(this.path + "/registry/connectorClasses", this.getActiveConnectorClasses);
        this.router.get(this.path + "/registry/aiModels", this.getActiveAiModels);
        this.router.post(this.path, this.createAgent);
        this.router.post(this.path + "/:agentId/connectors", this.createConnector);
    }
    createAgent = async (req, res) => {
        const { agentClassId, aiModelId, parentAgentId } = req.body;
        if (!agentClassId || !aiModelId) {
            return res
                .status(400)
                .send("Agent class ID and AI model ID are required");
        }
        const transaction = await sequelize.transaction();
        try {
            const agentClass = await PsAgentClass.findByPk(agentClassId);
            const aiModel = await PsAiModel.findByPk(aiModelId);
            if (!agentClass || !aiModel) {
                await transaction.rollback();
                return res.status(404).send("Agent class or AI model not found");
            }
            const newAgent = await PsAgent.create({
                class_id: agentClassId,
                user_id: 1,
                group_id: 1,
                parent_agent_id: parentAgentId,
                configuration: {},
            }, { transaction });
            await newAgent.addAiModel(aiModel, { transaction });
            await transaction.commit();
            // Fetch the created agent with its associations
            const createdAgent = await PsAgent.findByPk(newAgent.id, {
                include: [
                    { model: PsAgentClass, as: "Class" },
                    { model: PsAiModel, as: "AiModels" },
                ],
            });
            res.status(201).json(createdAgent);
        }
        catch (error) {
            await transaction.rollback();
            console.error("Error creating agent:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    createConnector = async (req, res) => {
        const { agentId } = req.params;
        const { connectorClassId, name } = req.body;
        if (!agentId || !connectorClassId || !name) {
            return res
                .status(400)
                .send("Agent ID, connector class ID, and name are required");
        }
        const transaction = await sequelize.transaction();
        try {
            const agent = await PsAgent.findByPk(agentId);
            const connectorClass = await PsAgentConnectorClass.findByPk(connectorClassId);
            if (!agent || !connectorClass) {
                await transaction.rollback();
                return res.status(404).send("Agent or connector class not found");
            }
            const newConnector = await PsAgentConnector.create({
                class_id: connectorClassId,
                user_id: 1, //TODO: Make dynamic
                group_id: agent.group_id,
                configuration: {
                    name: name,
                    graphPosX: 200,
                    graphPosY: 200,
                    permissionNeeded: PsAgentConnectorPermissionTypes.ReadWrite,
                },
            }, { transaction });
            await agent.addConnector(newConnector, { transaction });
            await transaction.commit();
            // Fetch the created connector with its associations
            const createdConnector = await PsAgentConnector.findByPk(newConnector.id, {
                include: [
                    { model: PsAgentConnectorClass, as: "Class" },
                    { model: PsAgent, as: "Agent" },
                ],
            });
            res.status(201).json(createdConnector);
        }
        catch (error) {
            await transaction.rollback();
            console.error("Error creating connector:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    getActiveAiModels = async (req, res) => {
        try {
            const activeAiModels = await PsAiModel.findAll({
                where: { "configuration.active": true },
            });
            res.json(activeAiModels);
        }
        catch (error) {
            console.error("Error fetching active AI models:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    getActiveAgentClasses = async (req, res) => {
        try {
            const registry = await PsAgentRegistry.findOne({
                include: [
                    {
                        model: PsAgentClass,
                        as: "Agents",
                        where: { available: true },
                        through: { attributes: [] },
                    },
                ],
            });
            if (!registry) {
                return res.status(404).send("Agent registry not found");
            }
            res.json(registry.Agents);
        }
        catch (error) {
            console.error("Error fetching active agent classes:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    getActiveConnectorClasses = async (req, res) => {
        try {
            const registry = await PsAgentRegistry.findOne({
                include: [
                    {
                        model: PsAgentConnectorClass,
                        as: "Connectors",
                        where: { available: true },
                        through: { attributes: [] },
                    },
                ],
            });
            if (!registry) {
                return res.status(404).send("Agent registry not found");
            }
            res.json(registry.Connectors);
        }
        catch (error) {
            console.error("Error fetching active connector classes:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    controlAgent = () => async (req, res) => {
        const agentId = parseInt(req.params.id);
        const action = req.body.action;
        try {
            const agent = await PsAgent.findByPk(agentId, {
                include: [{ model: PsAgentClass, as: "Class" }],
            });
            if (!agent || !agent.Class) {
                return res.status(404).send("Agent or Agent Class not found");
            }
            const queueName = agent.Class.configuration.queueName;
            if (!queueName) {
                return res
                    .status(400)
                    .send("Queue name not defined for this agent class");
            }
            const queue = new Queue(queueName);
            await queue.add(`${action}Agent`, { agentId, action });
            res.json({
                message: `${action.charAt(0).toUpperCase() + action.slice(1)} request for agent ${agentId} queued in ${queueName}`,
            });
        }
        catch (error) {
            console.error(`Error ${action}ing agent:`, error);
            res.status(500).send("Internal Server Error");
        }
    };
    updateNodeConfiguration = async (req, res) => {
        const agentId = parseInt(req.params.agentId);
        const nodeId = parseInt(req.params.nodeId);
        const nodeType = req.params.nodeType;
        const updatedConfig = req.body;
        try {
            let node;
            if (nodeType === "agent") {
                node = await PsAgent.findByPk(nodeId);
            }
            else if (nodeType === "connector") {
                node = await PsAgentConnector.findByPk(nodeId);
            }
            if (!node) {
                return res.status(404).send(`${nodeType} not found`);
            }
            // Update the node's configuration
            node.configuration = {
                ...node.configuration,
                ...updatedConfig,
            };
            await node.save();
            res.json({ message: `${nodeType} configuration updated successfully` });
        }
        catch (error) {
            console.error(`Error updating ${nodeType} configuration:`, error);
            res.status(500).send("Internal Server Error");
        }
    };
    getAgentStatus = async (req, res) => {
        const agentId = parseInt(req.params.id);
        try {
            const status = await this.agentManager.getAgentStatus(agentId);
            if (status) {
                res.json(status);
            }
            else {
                res.status(404).send("Agent status not found");
            }
        }
        catch (error) {
            console.error("Error getting agent status:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    updateAgentStatus = async (req, res) => {
        const agentId = parseInt(req.params.id);
        const { state, details } = req.body;
        try {
            const success = await this.agentManager.updateAgentStatus(agentId, state, details);
            if (success) {
                res.json({ message: "Agent status updated successfully" });
            }
            else {
                res.status(404).send("Agent not found");
            }
        }
        catch (error) {
            console.error("Error updating agent status:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    startAgentProcessing = async (req, res) => {
        const agentId = parseInt(req.params.id);
        try {
            const success = await this.agentManager.startAgentProcessing(agentId);
            if (success) {
                res.json({ message: "Agent processing started successfully" });
            }
            else {
                res.status(404).send("Agent not found");
            }
        }
        catch (error) {
            console.error("Error starting agent processing:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    pauseAgentProcessing = async (req, res) => {
        const agentId = parseInt(req.params.id);
        try {
            const success = await this.agentManager.pauseAgentProcessing(agentId);
            if (success) {
                res.json({ message: "Agent processing paused successfully" });
            }
            else {
                res.status(404).send("Agent not found");
            }
        }
        catch (error) {
            console.error("Error pausing agent processing:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    async getAgentCosts(req, res) {
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
                type: QueryTypes.SELECT,
            });
            const totalCost = results[0].total_cost;
            res.json({ totalCost: parseFloat(totalCost).toFixed(2) });
        }
        catch (error) {
            console.error("Error calculating agent costs:", error);
            res.status(500).send("Internal Server Error");
        }
    }
    getAgent = async (req, res) => {
        const groupId = req.params.id;
        if (!groupId) {
            return res.status(400).send("Group ID is required");
        }
        try {
            const group = await Group.findByPk(groupId, {
                attributes: ["id", "user_id", "configuration"]
            });
            if (!group) {
                return res.status(404).send("Group not found");
            }
            console.log(`Fetching top-level agent for group ${group.id} ${group.user_id} ${group.configuration}`);
            let groupConfig = group.configuration;
            let topLevelAgentId = groupConfig
                ? groupConfig.agents?.topLevelAgentId
                : undefined;
            console.log(`Top-level agent ID: ${topLevelAgentId}`);
            let topLevelAgent = null;
            if (topLevelAgentId) {
                topLevelAgent = await PsAgent.findByPk(topLevelAgentId);
            }
            if (!topLevelAgent) {
                if (!group.configuration) {
                    group.configuration = {};
                }
                if (!group.configuration.agents) {
                    group.configuration.agents = {};
                }
                groupConfig = group.configuration;
                const defaultAgentClassUuid = process.env.CLASS_ID_FOR_TOP_LEVEL_AGENT;
                if (!defaultAgentClassUuid) {
                    return res
                        .status(500)
                        .send("Default agent class UUID is not configured");
                }
                // Create a new top-level agent
                const agentClass = await PsAgentClass.findOne({
                    where: { class_base_id: defaultAgentClassUuid },
                });
                if (!agentClass) {
                    return res.status(404).send("Default agent class not found");
                }
                const transaction = await sequelize.transaction();
                console.debug(`Creating top-level agent for group ${group.id}`);
                try {
                    topLevelAgent = await PsAgent.create({
                        class_id: agentClass.id,
                        user_id: group.user_id,
                        group_id: group.id,
                        configuration: {
                            name: `${group.name} Top-Level Agent`,
                        },
                    }, { transaction });
                    const newConfiguration = {
                        ...groupConfig,
                        agents: {
                            ...groupConfig.agents,
                            topLevelAgentId: topLevelAgent.id,
                        },
                    };
                    console.log(JSON.stringify(newConfiguration));
                    group.set("configuration", newConfiguration);
                    await group.save({ transaction });
                    await transaction.commit();
                }
                catch (error) {
                    await transaction.rollback();
                    throw error;
                }
            }
            // Fetch the agent with all its associations
            const fullAgent = await this.fetchAgentWithSubAgents(topLevelAgent.id);
            res.json(fullAgent);
        }
        catch (error) {
            console.error("Error in getAgent:", error);
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