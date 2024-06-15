import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsApiCost extends Model {
    id;
    uuid;
    user_id;
    created_at;
    updated_at;
    cost_class_id;
    cost;
    agent_id;
    connector_id;
    // Associations
    Agent;
    Connector;
}
PsApiCost.init({
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
    cost_class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cost: {
        type: DataTypes.FLOAT,
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
    tableName: "ps_api_costs",
    indexes: [
        {
            fields: ["uuid"],
        },
        {
            fields: ["user_id"],
        },
        {
            fields: ["cost_class_id"],
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
PsApiCost.associate = (models) => {
    PsApiCost.belongsTo(models.PsAgent, {
        foreignKey: 'agent_id',
        as: 'Agent',
    });
    PsApiCost.belongsTo(models.PsAgentConnector, {
        foreignKey: 'connector_id',
        as: 'Connector',
    });
};
//# sourceMappingURL=apiCost.js.map