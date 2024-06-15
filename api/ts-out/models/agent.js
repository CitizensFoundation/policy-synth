import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsAgent extends Model {
    id;
    uuid;
    user_id;
    created_at;
    updated_at;
    class_id;
    group_id;
    configuration;
    parent_agent_id;
    // Associations
    Class;
    User;
    Group;
    ApiCosts;
    ModelCosts;
    ParentAgent;
    SubAgents;
    Connectors;
    addSubAgent;
    addConnector;
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
    PsAgent.belongsTo(models.PsAgentClass, { foreignKey: "class_id", as: "class" });
    PsAgent.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "User",
    });
    PsAgent.belongsTo(models.Group, {
        foreignKey: "group_id",
        as: "Group",
    });
    PsAgent.hasMany(models.PsApiCost, {
        foreignKey: "agent_id",
        as: "ApiCosts",
    });
    PsAgent.hasMany(models.PsModelCost, {
        foreignKey: "agent_id",
        as: "ModelCosts",
    });
    PsAgent.belongsTo(models.PsAgent, {
        foreignKey: "parent_agent_id",
        as: "ParentAgent",
    });
    PsAgent.hasMany(models.PsAgent, { foreignKey: "parent_agent_id", as: "SubAgents" });
    // Through a join table
    PsAgent.belongsToMany(models.PsAgentConnector, {
        through: "AgentConnectors",
        foreignKey: "agent_id",
        as: "Connectors",
    });
};
//# sourceMappingURL=agent.js.map