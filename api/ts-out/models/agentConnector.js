import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index.js";
import { PsAgentConnectorClass } from "./agentConnectorClass.js";
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
// Define associations
PsAgentConnector.belongsTo(PsAgentConnectorClass, {
    foreignKey: "class_id",
    as: "Class",
});
PsAgentConnector.belongsTo(/*YpUserData*/ {}, {
    foreignKey: "user_id",
    as: "User",
});
PsAgentConnector.belongsTo(/*YpGroupData*/ {}, {
    foreignKey: "group_id",
    as: "Group",
});
//# sourceMappingURL=agentConnector.js.map