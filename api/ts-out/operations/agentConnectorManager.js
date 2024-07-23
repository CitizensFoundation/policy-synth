import { PsAgent, PsAgentConnector, PsAgentConnectorClass, sequelize, } from "../models/index.js";
export class AgentConnectorManager {
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
                user_id: 1, //TODO: Make dynamic
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
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async updateConnectorConfiguration(connectorId, updatedConfig) {
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
//# sourceMappingURL=agentConnectorManager.js.map