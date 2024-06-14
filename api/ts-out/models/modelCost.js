import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index.js";
export class PsModelCost extends Model {
    id;
    uuid;
    user_id;
    created_at;
    updated_at;
    cost_class_id;
    cost;
    agent_id;
    connector_id;
}
PsModelCost.init({
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
        allowNull: false,
    },
    connector_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "ps_model_costs",
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
//# sourceMappingURL=modelCost.js.map