import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsAgentRegistry extends Model {
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
            unique: true,
        },
        {
            fields: ["user_id"],
        },
    ],
    timestamps: true,
    underscored: true,
});
PsAgentRegistry.associate = (models) => {
    PsAgentRegistry.belongsToMany(models.PsAgentClass, {
        through: "AgentRegistryAgents",
        as: "Agents",
        foreignKey: "ps_agent_registry_id",
        otherKey: "ps_agent_class_id",
        timestamps: true,
    });
    PsAgentRegistry.belongsToMany(models.PsAgentConnectorClass, {
        through: "AgentRegistryConnectors",
        as: "Connectors",
        foreignKey: "ps_agent_registry_id",
        otherKey: "ps_agent_connector_class_id",
        timestamps: true,
    });
};
//# sourceMappingURL=agentRegistry.js.map