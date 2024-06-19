import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsExternalApiUsage extends Model {
    id;
    user_id;
    created_at;
    updated_at;
    external_api_id;
    callCount;
    agent_id;
    connector_id;
    // Associations
    Agent;
    Connector;
}
PsExternalApiUsage.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
    external_api_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    callCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    agent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    connector_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: "ps_api_usage",
    indexes: [
        {
            fields: ["user_id"],
        },
        {
            fields: ["external_api_id"],
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
PsExternalApiUsage.associate = (models) => {
    PsExternalApiUsage.belongsTo(models.PsAgent, {
        foreignKey: 'agent_id',
        as: 'Agent',
    });
    PsExternalApiUsage.belongsTo(models.PsAgentConnector, {
        foreignKey: 'connector_id',
        as: 'Connector',
    });
};
//# sourceMappingURL=externalApiUsage.js.map