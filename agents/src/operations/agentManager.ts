import { Identifier, QueryTypes, Transaction } from "sequelize";
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
  sequelize,
} from "../dbModels/index.js";

export class AgentManager {
  async getAgent(groupId: string) {
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

    let topLevelAgent: PsAgent | null = null;
    if (topLevelAgentId) {
      topLevelAgent = await PsAgent.findByPk(topLevelAgentId);
    }

    if (!topLevelAgent) {
      topLevelAgent = await this.createTopLevelAgent(group);
    }

    return this.fetchAgentWithSubAgents(topLevelAgent.id);
  }

  async getSubAgentMemoryKey(groupId: string, agentId: number): Promise<string | null> {
    console.log(`Searching for agent with id ${agentId} in group ${groupId}`);

    // Get the top-level agent for the group
    const topLevelAgent = await this.getAgent(groupId);

    if (!topLevelAgent) {
      console.error("Top-level agent not found for the given group");
      throw new Error("Top-level agent not found for the given group");
    }

    console.log("Top-level agent found:", topLevelAgent.id);

    // Helper function to recursively search for the agent
    const findAgent = (agent: any): any => {
      console.log(`Checking agent: ${agent.id}`);

      if (agent.id === agentId) {
        console.log(`Found matching agent: ${agent.id}`);
        return agent;
      }

      if (agent.SubAgents && agent.SubAgents.length > 0) {
        console.log(`Checking ${agent.SubAgents.length} sub-agents of agent ${agent.id}`);
        for (const subAgent of agent.SubAgents) {
          const found = findAgent(subAgent);
          if (found) return found;
        }
      } else {
        console.log(`Agent ${agent.id} has no sub-agents`);
      }

      return null;
    };

    // Search for the agent with the given agentId
    const foundAgent = findAgent(topLevelAgent) as PsAgent;

    if (!foundAgent) {
      console.error(`Agent with id ${agentId} not found in the group`);
      throw new Error(`Agent with id ${agentId} not found in the group`);
    }

    console.log(`Found agent: ${foundAgent.id}`);

    // Return the redisMemoryKey if it exists, otherwise return null
    const memoryKey = `ps:agent:memory:${foundAgent.id}:${foundAgent.uuid}`;
    console.log(`Memory key for agent ${foundAgent.id}: ${memoryKey}`);

    return memoryKey;
  }

  async createAgent(
    name: string,
    agentClassId: number,
    aiModels: Record<string, number | string>,
    groupId: number,
    userId: number,
    parentAgentId?: number
  ) {
    if (
      !agentClassId ||
      !aiModels ||
      typeof aiModels !== "object" ||
      Object.keys(aiModels).length === 0
    ) {
      throw new Error(
        "Agent class ID and at least one AI model ID are required"
      );
    }

    const transaction = await sequelize.transaction();

    try {
      const agentClass = await PsAgentClass.findByPk(agentClassId);
      if (!agentClass) {
        await transaction.rollback();
        throw new Error("Agent class not found");
      }

      const aiModelPromises = Object.entries(aiModels).map(
        async ([size, id]) => {
          if (typeof id !== "number" && typeof id !== "string") {
            throw new Error(`Invalid AI model ID for size ${size}`);
          }
          const model = await PsAiModel.findByPk(id as Identifier);
          if (!model) {
            throw new Error(
              `AI model with id ${id} for size ${size} not found`
            );
          }
          return { size, model };
        }
      );

      const foundAiModels = await Promise.all(aiModelPromises);

      const newAgent = await PsAgent.create(
        {
          class_id: agentClassId,
          user_id: userId,
          group_id: groupId,
          parent_agent_id: parentAgentId,
          configuration: {
            name,
          },
        },
        { transaction }
      );

      await Promise.all(
        foundAiModels.map(({ size, model }) =>
          newAgent.addAiModel(model, { through: { size }, transaction })
        )
      );

      await transaction.commit();

      // Fetch the created agent with its associations
      return await PsAgent.findByPk(newAgent.id, {
        include: [
          { model: PsAgentClass, as: "Class" },
          { model: PsAiModel, as: "AiModels" },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateAgentConfiguration(
    agentId: number,
    updatedConfig: Partial<YpPsAgentConfiguration>
  ): Promise<void> {
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

  async removeAgentAiModel(agentId: number, modelId: number) {
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

  async getAgentAiModels(agentId: number) {
    const agent = await PsAgent.findByPk(agentId, {
      include: [{ model: PsAiModel, as: "AiModels" }],
    });

    if (!agent) {
      throw new Error("Agent not found");
    }

    return agent.AiModels;
  }

  async addAgentAiModel(agentId: number, modelId: number, size: string) {
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

  async createTopLevelAgent(group: Group) {
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
      const topLevelAgent = await PsAgent.create(
        {
          class_id: agentClass.id,
          user_id: group.user_id,
          group_id: group.id,
          configuration: {
            name: `${group.name} Top-Level Agent`,
          },
        },
        { transaction }
      );

      // Ensure the 'agents' object exists in the configuration
      if (!group.configuration.agents) {
        //@ts-ignore //TODO: Get this working with types
        group.set("configuration.agents", {});
      }

      // Set the topLevelAgentId
      group.set(
        //@ts-ignore //TODO: Get this working with types
        "configuration.agents.topLevelAgentId",
        topLevelAgent.id
      );

      // Save the changes
      await group.save({ transaction });

      await transaction.commit();
      return topLevelAgent;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async fetchAgentWithSubAgents(agentId: number) {
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
        { model: User, as: "User", attributes: ["id", "email", "name"] },
        {
          model: Group,
          as: "Group",
          attributes: ["id", "user_id", "configuration", "name"],
        },
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
