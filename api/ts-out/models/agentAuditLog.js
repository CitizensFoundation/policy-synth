import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index.js";
export class PsAgentAuditLog extends Model {
    id;
    uuid;
    user_id;
    created_at;
    updated_at;
    agent_id;
    connector_id;
    action;
    details;
    timestamp;
}
PsAgentAuditLog.init({
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
    agent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    connector_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: "ps_agent_audit_logs",
    indexes: [
        {
            fields: ["uuid"],
        },
        {
            fields: ["user_id"],
        },
        {
            fields: ["agent_id"],
        },
        {
            fields: ["connector_id"],
        },
    ],
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=agentAuditLog.js.map