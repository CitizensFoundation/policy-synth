import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index.js";
import { PsAgentClass } from "./agentClass.js";
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
    ],
    timestamps: true,
    underscored: true,
});
// Define associations
PsAgent.belongsTo(PsAgentClass, { foreignKey: "class_id", as: "class" });
PsAgent.belongsTo(/*YpUserData*/ {}, {
    foreignKey: "user_id",
    as: "User",
});
PsAgent.belongsTo(/*YpGroupData*/ {}, {
    foreignKey: "group_id",
    as: "Group",
});
PsAgent.hasMany(/*PsApiCostAttributes*/ {}, {
    foreignKey: "agent_id",
    as: "ApiCosts",
});
PsAgent.hasMany(/*PsModelCostAttributes*/ {}, {
    foreignKey: "agent_id",
    as: "ModelCosts",
});
PsAgent.belongsTo(PsAgent, {
    foreignKey: "parent_agent_id",
    as: "ParentAgent",
});
PsAgent.hasMany(PsAgent, { foreignKey: "parent_agent_id", as: "subAgents" });
PsAgent.belongsToMany(/*PsAgentConnectorAttributes*/ {}, {
    through: "AgentConnectors",
    as: "Connectors",
});
//# sourceMappingURL=agent.js.map