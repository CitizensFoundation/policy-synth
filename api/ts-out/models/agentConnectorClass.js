import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index.js";
export class PsAgentConnectorClass extends Model {
    id;
    uuid;
    user_id;
    created_at;
    updated_at;
    name;
    version;
    available;
    configuration;
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
//# sourceMappingURL=agentConnectorClass.js.map