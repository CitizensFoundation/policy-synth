import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsAgent extends Model {
}
PsAgent.init({
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
    parent_agent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: "ps_agents",
    indexes: [
        {
            fields: ["uuid"],
            unique: true
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
        {
            fields: ["parent_agent_id"],
        },
    ],
    timestamps: true,
    underscored: true,
});
PsAgent.associate = (models) => {
    // Define associations
    PsAgent.belongsTo(models.PsAgentClass, {
        foreignKey: "class_id",
        as: "Class",
    });
    PsAgent.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "User",
    });
    PsAgent.belongsTo(models.Group, {
        foreignKey: "group_id",
        as: "Group",
    });
    PsAgent.hasMany(models.PsExternalApiUsage, {
        foreignKey: "agent_id",
        as: "ExternalApiUsage",
    });
    PsAgent.hasMany(models.PsModelUsage, {
        foreignKey: "agent_id",
        as: "ModelUsage",
    });
    PsAgent.belongsTo(models.PsAiModel, {
        foreignKey: "parent_agent_id",
        as: "AiModel",
    });
    PsAgent.hasMany(models.PsAgent, {
        foreignKey: "parent_agent_id",
        as: "SubAgents",
    });
    PsAgent.belongsTo(models.PsAgent, {
        foreignKey: 'parent_agent_id',
        as: 'ParentAgent',
    });
    // Through a join table
    PsAgent.belongsToMany(models.PsAgentConnector, {
        through: "AgentConnectors",
        foreignKey: "agent_id",
        as: "Connectors",
        timestamps: false,
    });
    // Through a join table
    PsAgent.belongsToMany(models.PsAiModel, {
        through: "AgentModels",
        foreignKey: "agent_id",
        otherKey: 'ai_model_id',
        as: "AiModels",
        timestamps: false,
    });
};
//# sourceMappingURL=agent.js.map