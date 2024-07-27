import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsAgentConnectorClass extends Model {
}
PsAgentConnectorClass.init({
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
    class_base_id: {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    configuration: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "ps_agent_connector_classes",
    indexes: [
        {
            fields: ["uuid"],
            unique: true
        },
        {
            fields: ["class_base_id"],
        },
        {
            fields: ["class_base_id", "version"],
        },
        {
            fields: ["user_id"],
        },
        {
            fields: ["name"],
        },
        {
            fields: ["version"],
        },
    ],
    timestamps: true,
    underscored: true,
});
PsAgentConnectorClass.associate = (models) => {
    // Define associations
    PsAgentConnectorClass.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "Owner",
    });
    PsAgentConnectorClass.belongsToMany(models.User, {
        through: "AgentConnectorClassUsers",
        foreignKey: "agent_connector_class_id",
        otherKey: "user_id",
        as: "Users",
        timestamps: false,
    });
    PsAgentConnectorClass.belongsToMany(models.User, {
        through: "AgentConnectorClassAdmins",
        foreignKey: "agent_connector_class_id",
        otherKey: "user_id",
        as: "Admins",
        timestamps: false,
    });
    PsAgentConnectorClass.belongsToMany(models.PsAgentRegistry, {
        through: "AgentRegistryConnectors",
        as: "Registry",
        foreignKey: "ps_agent_connector_class_id",
        otherKey: "ps_agent_registry_id",
        timestamps: true,
    });
    PsAgentConnectorClass.hasMany(models.PsAgentConnector, {
        foreignKey: "class_id",
        as: "Connectors",
    });
};
//# sourceMappingURL=agentConnectorClass.js.map