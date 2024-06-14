import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index.js";
import { PsAgentClass } from "./agentClass.js";
import { PsAgentConnectorClass } from "./agentConnectorClass.js";
export class PsAgentRegistry extends Model {
    id;
    uuid;
    user_id;
    created_at;
    updated_at;
    configuration;
    Agents;
    Connectors;
}
PsAgentRegistry.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    configuration: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "ps_agent_registries",
    indexes: [
        {
            fields: ["uuid"],
        },
        {
            fields: ["user_id"],
        },
    ],
    timestamps: true,
    underscored: true,
});
// Define associations
PsAgentRegistry.belongsToMany(PsAgentClass, {
    through: "AgentRegistryAgents",
    as: "Agents",
});
PsAgentRegistry.belongsToMany(PsAgentConnectorClass, {
    through: "AgentRegistryConnectors",
    as: "Connectors",
});
//# sourceMappingURL=agentRegistry.js.map