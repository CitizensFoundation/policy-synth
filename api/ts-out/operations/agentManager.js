import { QueryTypes } from "sequelize";
import { PsAgent, PsAgentConnector, PsAgentClass, User, Group, PsExternalApiUsage, PsModelUsage, PsAiModel, PsAgentConnectorClass, sequelize, } from "../models/index.js";
export class AgentManager {
    async getAgent(groupId) {
        if (!groupId) {
            throw new Error("Group ID is required");
        }
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
            topLevelAgent = await this.createTopLevelAgent(group);
        }
        return this.fetchAgentWithSubAgents(topLevelAgent.id);
    }
    async createAgent(name, agentClassId, aiModels, parentAgentId) {
        if (!agentClassId ||
            !aiModels ||
            typeof aiModels !== "object" ||
            Object.keys(aiModels).length === 0) {
            throw new Error("Agent class ID and at least one AI model ID are required");
        }
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
            await Promise.all(foundAiModels.map(({ size, model }) => newAgent.addAiModel(model, { through: { size }, transaction })));
            await transaction.commit();
            // Fetch the created agent with its associations
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
    async updateAgentConfiguration(agentId, updatedConfig) {
        const agent = await PsAgent.findByPk(agentId);
        if (!agent) {
            throw new Error("Agent not found");
        }
        // Merge the updated configuration with the existing one
        agent.configuration = {
            ...agent.configuration,
            ...updatedConfig,
        };
        await agent.save();
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
    async getAgentAiModels(agentId) {
        const agent = await PsAgent.findByPk(agentId, {
            include: [{ model: PsAiModel, as: "AiModels" }],
        });
        if (!agent) {
            throw new Error("Agent not found");
        }
        return agent.AiModels;
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
        await agent.addAiModel(aiModel, {
            through: { size: size },
        });
    }
    async createTopLevelAgent(group) {
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
            const topLevelAgent = await PsAgent.create({
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
            return topLevelAgent;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
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
                            include: [
                                {
                                    model: PsAgentConnectorClass,
                                    as: "Class",
                                },
                            ],
                        },
                        {
                            model: PsAgentConnector,
                            as: "OutputConnectors",
                            include: [
                                {
                                    model: PsAgentConnectorClass,
                                    as: "Class",
                                },
                            ],
                        },
                        { model: PsAgentClass, as: "Class" },
                        { model: PsAiModel, as: "AiModels" },
                    ],
                },
                {
                    model: PsAgentConnector,
                    as: "InputConnectors",
                    include: [
                        {
                            model: PsAgentConnectorClass,
                            as: "Class",
                        },
                    ],
                },
                {
                    model: PsAgentConnector,
                    as: "OutputConnectors",
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
        return agent.toJSON();
    }
}
//# sourceMappingURL=agentManager.js.map