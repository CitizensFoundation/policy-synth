import { Transaction } from "sequelize";
import {
  PsAgent,
  PsAgentConnector,
  PsAgentConnectorClass,
  sequelize,
} from "../models/index.js";

export class AgentConnectorManager {
  public async createConnector(
    agentId: number,
    connectorClassId: number,
    name: string,
    type: "input" | "output"
  ): Promise<PsAgentConnector | null> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const agent = await PsAgent.findByPk(agentId);
      const connectorClass = await PsAgentConnectorClass.findByPk(connectorClassId);

      if (!agent || !connectorClass) {
        await transaction.rollback();
        throw new Error("Agent or connector class not found");
      }

      const newConnector = await PsAgentConnector.create(
        {
          class_id: connectorClassId,
          user_id: 1, //TODO: Make dynamic
          group_id: agent.group_id,
          configuration: {
            name: name,
            graphPosX: 200,
            graphPosY: 200,
            permissionNeeded: "readWrite" as PsAgentConnectorPermissionTypes,
          },
        },
        { transaction }
      );

      if (type === "input") {
        await agent.addInputConnector(newConnector, { transaction });
      } else {
        await agent.addOutputConnector(newConnector, { transaction });
      }

      await transaction.commit();

      // Fetch the created connector with its associations
      return await PsAgentConnector.findByPk(newConnector.id, {
        include: [
          { model: PsAgentConnectorClass, as: "Class" },
          {
            model: PsAgent,
            as: type === "input" ? "InputAgents" : "OutputAgents",
            through: { attributes: [] }, // This excludes join table attributes from the result
          },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async updateConnectorConfiguration(
    connectorId: number,
    updatedConfig: Partial<PsAgentConnectorConfiguration>
  ): Promise<void> {
    const connector = await PsAgentConnector.findByPk(connectorId);

    if (!connector) {
      throw new Error("Connector not found");
    }

    // Merge the updated configuration with the existing one
    connector.configuration = {
      ...connector.configuration,
      ...updatedConfig,
    };

    await connector.save();
  }
}