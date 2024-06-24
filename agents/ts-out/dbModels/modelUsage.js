import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsModelUsage extends Model {
}
PsModelUsage.init({
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
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    token_in_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    token_out_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    token_in_cached_context_count: {
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
    tableName: "ps_model_usage",
    indexes: [
        {
            fields: ["user_id"],
        },
        {
            fields: ["model_id"],
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
//# sourceMappingURL=modelUsage.js.map