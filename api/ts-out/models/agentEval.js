import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsEval extends Model {
}
PsEval.init({
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
    agent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    overall_score: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    results: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: "ps_agent_evals",
    indexes: [
        {
            fields: ["user_id"],
        },
        {
            fields: ["agent_id"],
        }
    ],
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=agentEval.js.map