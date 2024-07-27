import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsAgentClass extends Model {
}
PsAgentClass.init({
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
    configuration: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "ps_agent_classes",
    indexes: [
        {
            fields: ["uuid"],
            unique: true,
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
    ],
    timestamps: true,
    underscored: true,
});
PsAgentClass.associate = (models) => {
    // Define associations
    PsAgentClass.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "Owner",
    });
    PsAgentClass.belongsToMany(models.User, {
        through: "AgentClassUsers",
        foreignKey: "agent_class_id",
        otherKey: "user_id",
        as: "Users",
        timestamps: false,
    });
    PsAgentClass.belongsToMany(models.User, {
        through: "AgentClassAdmins",
        foreignKey: "agent_class_id",
        otherKey: "user_id",
        as: "Admins",
        timestamps: false,
    });
    PsAgentClass.belongsToMany(models.PsAgentRegistry, {
        through: "AgentRegistryAgents",
        as: "Registry",
        foreignKey: "ps_agent_class_id",
        otherKey: "ps_agent_registry_id",
        timestamps: true,
    });
    PsAgentClass.hasMany(models.PsAgent, {
        foreignKey: "class_id",
        as: "Agents",
    });
};
//# sourceMappingURL=agentClass.js.map