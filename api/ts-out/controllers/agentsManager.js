import { QueryTypes } from "sequelize";
import { createClient } from "redis";
import { PsAgentConnectorClass } from "@policysynth/agents/dbModels/agentConnectorClass.js"; // Adjust the path as needed
import { User } from "@policysynth/agents/dbModels/ypUser.js";
import { Group } from "@policysynth/agents/dbModels/ypGroup.js";
import { PsAgentClass } from "@policysynth/agents/dbModels/agentClass.js";
import { PsAgentConnector } from "@policysynth/agents/dbModels/agentConnector.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsExternalApiUsage } from "@policysynth/agents/dbModels/externalApiUsage.js";
import { PsModelUsage } from "@policysynth/agents/dbModels/modelUsage.js";
import { PsAgentRegistry } from "@policysynth/agents/dbModels/agentRegistry.js";
import { PsAiModel } from "@policysynth/agents/dbModels/aiModel.js";
import { sequelize, } from "../models/index.js";
import { Queue } from "bullmq";
export class AgentsManager {
    redisClient;
    constructor() {
        this.initializeRedisClient();
    }
    async initializeRedisClient() {
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
        await this.redisClient.connect();
    }
    async getActiveAiModels() {
        return await PsAiModel.findAll({
            where: { "configuration.active": true },
        });
    }
    async getActiveAgentClasses() {
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
            throw new Error("Agent registry not found");
        }
        return registry.Agents;
    }
    async getActiveConnectorClasses() {
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
            throw new Error("Agent registry not found");
        }
        return registry.Connectors;
    }
    async createAgent(name, agentClassId, aiModels, parentAgentId) {
        const transaction = await sequelize.transaction();
        try {
            const agentClass = await PsAgentClass.findByPk(agentClassId);
            if (!agentClass) {
                await transaction.rollback();
                throw new Error("Agent class not found");
            }
            const aiModelPromises = Object.entries(aiModels).map(async ([size, id]) => {
                if (typeof id !== "number" && typeof id !== "string") {
                    throw new Error(`Invalid AI model ID for size ${size}`);
                }
                const model = await PsAiModel.findByPk(id);
                if (!model) {
                    throw new Error(`AI model with id ${id} for size ${size} not found`);
                }
                return { size, model };
            });
            const foundAiModels = await Promise.all(aiModelPromises);
            const newAgent = await PsAgent.create({
                class_id: agentClassId,
                user_id: 1, // TODO: Make this dynamic
                group_id: 1, // TODO: Make this dynamic
                parent_agent_id: parentAgentId,
                configuration: {
                    name,
                },
            }, { transaction });
            await Promise.all(foundAiModels.map(({ size, model }) => newAgent.addAiModel(model, { through: { size: size }, transaction })));
            await transaction.commit();
            return await PsAgent.findByPk(newAgent.id, {
                include: [
                    { model: PsAgentClass, as: "Class" },
                    { model: PsAiModel, as: "AiModels" },
                ],
            });
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async createConnector(agentId, connectorClassId, name, type) {
        const transaction = await sequelize.transaction();
        try {
            const agent = await PsAgent.findByPk(agentId);
            const connectorClass = await PsAgentConnectorClass.findByPk(connectorClassId);
            if (!agent || !connectorClass) {
                await transaction.rollback();
                throw new Error("Agent or connector class not found");
            }
            const newConnector = await PsAgentConnector.create({
                class_id: connectorClassId,
                user_id: 1, // TODO: Make dynamic
                group_id: agent.group_id,
                configuration: {
                    name: name,
                    graphPosX: 200,
                    graphPosY: 200,
                    permissionNeeded: "readWrite",
                },
            }, { transaction });
            if (type === "input") {
                await agent.addInputConnector(newConnector, { transaction });
            }
            else {
                await agent.addOutputConnector(newConnector, { transaction });
            }
            await transaction.commit();
            return await PsAgentConnector.findByPk(newConnector.id, {
                include: [
                    { model: PsAgentConnectorClass, as: "Class" },
                    {
                        model: PsAgent,
                        as: type === "input" ? "InputAgents" : "OutputAgents",
                        through: { attributes: [] },
                    },
                ],
            });
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async controlAgent(agentId, action) {
        const agent = await PsAgent.findByPk(agentId, {
            include: [{ model: PsAgentClass, as: "Class" }],
        });
        if (!agent || !agent.Class) {
            throw new Error("Agent or Agent Class not found");
        }
        const queueName = agent.Class.configuration.queueName;
        if (!queueName) {
            throw new Error("Queue name not defined for this agent class");
        }
        const queue = new Queue(queueName);
        await queue.add(`${action}Agent`, { agentId, action });
        return `${action.charAt(0).toUpperCase() + action.slice(1)} request for agent ${agentId} queued in ${queueName}`;
    }
    async getAgentStatus(agentId) {
        const status = await this.redisClient.get(`agent:${agentId}:status`);
        return status ? JSON.parse(status) : null;
    }
    async updateAgentStatus(agentId, state, details) {
        const agent = await PsAgent.findByPk(agentId);
        if (!agent) {
            return false;
        }
        const status = { state, details };
        await this.redisClient.set(`agent:${agentId}:status`, JSON.stringify(status));
        return true;
    }
    async startAgentProcessing(agentId) {
        const agent = await PsAgent.findByPk(agentId);
        if (!agent) {
            return false;
        }
        await this.updateAgentStatus(agentId, "processing", { message: "Agent processing started" });
        // Add any additional logic needed to start the agent's processing
        return true;
    }
    async pauseAgentProcessing(agentId) {
        const agent = await PsAgent.findByPk(agentId);
        if (!agent) {
            return false;
        }
        await this.updateAgentStatus(agentId, "paused", { message: "Agent processing paused" });
        // Add any additional logic needed to pause the agent's processing
        return true;
    }
    async getAgentCosts(agentId) {
        const results = await sequelize.query(`
      WITH RECURSIVE agent_hierarchy AS (
        SELECT id, parent_agent_id, 0 as level
        FROM ps_agents
        WHERE id = :agentId
        UNION ALL
        SELECT a.id, a.parent_agent_id, ah.level + 1
        FROM ps_agents a
        JOIN agent_hierarchy ah ON a.parent_agent_id = ah.id
      )
      SELECT
        ah.id as agent_id,
        ah.level,
        COALESCE(SUM(
          (COALESCE(mu.token_in_count, 0) * COALESCE(CAST(am.configuration#>>'{prices,costInTokensPerMillion}' AS FLOAT), 0) +
           COALESCE(mu.token_out_count, 0) * COALESCE(CAST(am.configuration#>>'{prices,costOutTokensPerMillion}' AS FLOAT), 0)) / 1000000.0
        ), 0) as agent_cost
      FROM agent_hierarchy ah
      LEFT JOIN "AgentModels" am_join ON ah.id = am_join.agent_id
      LEFT JOIN ps_ai_models am ON am_join.ai_model_id = am.id
      LEFT JOIN ps_model_usage mu ON mu.model_id = am.id AND mu.agent_id = ah.id
      GROUP BY ah.id, ah.level
      ORDER BY ah.level, ah.id
      `, {
            replacements: { agentId },
            type: QueryTypes.SELECT,
        });
        const agentCosts = results.map((row) => ({
            agentId: row.agent_id,
            level: row.level,
            cost: parseFloat(row.agent_cost).toFixed(2),
        }));
        const totalCost = agentCosts
            .reduce((sum, agent) => sum + parseFloat(agent.cost), 0)
            .toFixed(2);
        return { agentCosts, totalCost };
    }
    async getSingleAgentCosts(agentId) {
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
        return { totalCost: parseFloat(totalCost).toFixed(2) };
    }
    async getAgent(groupId) {
        const group = await Group.findByPk(groupId, {
            attributes: ["id", "user_id", "configuration", "name"],
        });
        if (!group) {
            throw new Error("Group not found");
        }
        const groupData = group.toJSON();
        const configuration = groupData.configuration;
        let topLevelAgentId = configuration?.agents?.topLevelAgentId;
        let topLevelAgent = null;
        if (topLevelAgentId) {
            topLevelAgent = await PsAgent.findByPk(topLevelAgentId);
        }
        if (!topLevelAgent) {
            const defaultAgentClassUuid = process.env.CLASS_ID_FOR_TOP_LEVEL_AGENT;
            if (!defaultAgentClassUuid) {
                throw new Error("Default agent class UUID is not configured");
            }
            const agentClass = await PsAgentClass.findOne({
                where: { class_base_id: defaultAgentClassUuid },
            });
            if (!agentClass) {
                throw new Error("Default agent class not found");
            }
            const transaction = await sequelize.transaction();
            try {
                topLevelAgent = await PsAgent.create({
                    class_id: agentClass.id,
                    user_id: group.user_id,
                    group_id: group.id,
                    configuration: {
                        name: `${group.name} Top-Level Agent`,
                    },
                }, { transaction });
                const [updateCount] = await sequelize.query(`UPDATE groups
           SET configuration = jsonb_set(
             COALESCE(configuration, '{}')::jsonb,
             '{agents,topLevelAgentId}',
             :topLevelAgentId::jsonb
           )
           WHERE id = :groupId`, {
                    replacements: {
                        topLevelAgentId: JSON.stringify(topLevelAgent.id),
                        groupId: group.id,
                    },
                    type: QueryTypes.UPDATE,
                    transaction,
                });
                if (updateCount === 0) {
                    throw new Error(`Failed to update configuration for group ${group.id}`);
                }
                await transaction.commit();
            }
            catch (error) {
                await transaction.rollback();
                throw error;
            }
        }
        return await this.fetchAgentWithSubAgents(topLevelAgent.id);
    }
    async fetchAgentWithSubAgents(agentId) {
        const agent = await PsAgent.findByPk(agentId, {
            include: [
                {
                    model: PsAgent,
                    as: "SubAgents",
                    include: [
                        {
                            model: PsAgentConnector,
                            as: "InputConnectors",
                            include: [{ model: PsAgentConnectorClass, as: "Class" }],
                        },
                        {
                            model: PsAgentConnector,
                            as: "OutputConnectors",
                            include: [{ model: PsAgentConnectorClass, as: "Class" }],
                        },
                        { model: PsAgentClass, as: "Class" },
                        { model: PsAiModel, as: "AiModels" },
                    ],
                },
                {
                    model: PsAgentConnector,
                    as: "InputConnectors",
                    include: [{ model: PsAgentConnectorClass, as: "Class" }],
                },
                {
                    model: PsAgentConnector,
                    as: "OutputConnectors",
                    include: [{ model: PsAgentConnectorClass, as: "Class" }],
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
        return agent.toJSON();
    }
    async fetchNestedSubAgents(parentAgentId) {
        if (!parentAgentId) {
            return [];
        }
        const subAgents = await PsAgent.findAll({
            where: { parent_agent_id: parentAgentId },
            include: [
                {
                    model: PsAgent,
                    as: "SubAgents",
                    include: [
                        { model: PsAgentConnector, as: "InputConnectors" },
                        { model: PsAgentConnector, as: "OutputConnectors" },
                        { model: PsAgentClass, as: "Class" },
                        { model: PsAiModel, as: "AiModels" },
                    ],
                },
                { model: PsAgentConnector, as: "InputConnectors" },
                { model: PsAgentConnector, as: "OutputConnectors" },
                { model: PsAgentClass, as: "Class" },
                { model: User, as: "User" },
                { model: Group, as: "Group" },
                { model: PsExternalApiUsage, as: "ExternalApiUsage" },
                { model: PsModelUsage, as: "ModelUsage" },
                { model: PsAiModel, as: "AiModels" },
            ],
        });
        return Promise.all(subAgents.map(async (subAgent) => {
            const nestedSubAgents = await this.fetchNestedSubAgents(subAgent.id);
            return {
                ...subAgent.toJSON(),
                SubAgents: nestedSubAgents,
            };
        }));
    }
    async updateNodeConfiguration(agentId, nodeType, nodeId, updatedConfig) {
        let node;
        if (nodeType === "agent") {
            node = await PsAgent.findByPk(nodeId);
        }
        else if (nodeType === "connector") {
            node = await PsAgentConnector.findByPk(nodeId);
        }
        if (!node) {
            throw new Error(`${nodeType} not found`);
        }
        // Merge the updated configuration with the existing one
        node.configuration = {
            ...node.configuration,
            ...updatedConfig,
        };
        await node.save();
    }
    async getAgentAiModels(agentId) {
        const agent = await PsAgent.findByPk(agentId, {
            include: [{ model: PsAiModel, as: "AiModels" }],
        });
        if (!agent) {
            throw new Error("Agent not found");
        }
        return agent.AiModels;
    }
    async removeAgentAiModel(agentId, modelId) {
        const agent = await PsAgent.findByPk(agentId);
        if (!agent) {
            throw new Error("Agent not found");
        }
        const aiModel = await PsAiModel.findByPk(modelId);
        if (!aiModel) {
            throw new Error("AI model not found");
        }
        const removed = await agent.removeAiModel(aiModel);
        if (!removed) {
            throw new Error("AI model not found for this agent");
        }
    }
    async addAgentAiModel(agentId, modelId, size) {
        const agent = await PsAgent.findByPk(agentId);
        if (!agent) {
            throw new Error("Agent not found");
        }
        const aiModel = await PsAiModel.findByPk(modelId);
        if (!aiModel) {
            throw new Error("AI model not found");
        }
        await agent.addAiModel(aiModel, { through: { size } });
    }
}
//# sourceMappingURL=agentsManager.js.map