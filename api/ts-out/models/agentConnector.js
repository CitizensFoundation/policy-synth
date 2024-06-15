import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsAgentConnector extends Model {
    id;
    uuid;
    user_id;
    created_at;
    updated_at;
    class_id;
    group_id;
    configuration;
    // Associations
    User;
    Group;
    Class;
}
PsAgentConnector.init({
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
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    configuration: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "ps_agent_connectors",
    indexes: [
        {
            fields: ["uuid"],
        },
        {
            fields: ["user_id"],
        },
        {
            fields: ["class_id"],
        },
        {
            fields: ["group_id"],
        },
    ],
    timestamps: true,
    underscored: true,
});
PsAgentConnector.associate = (models) => {
    console.log(`PsAgentConnector.associate ${JSON.stringify(models.PsAgentConnectorClass)}`);
    // Define associations
    PsAgentConnector.belongsTo(models.PsAgentConnectorClass, {
        foreignKey: "class_id",
        as: "Class",
    });
    PsAgentConnector.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "User",
    });
    PsAgentConnector.belongsTo(models.Group, {
        foreignKey: "group_id",
        as: "Group",
    });
    // Through a join table
    PsAgentConnector.belongsToMany(models.PsAgent, {
        through: "AgentConnectors",
        foreignKey: "connector_id",
        as: "Agents",
        timestamps: false
    });
};
//# sourceMappingURL=agentConnector.js.map