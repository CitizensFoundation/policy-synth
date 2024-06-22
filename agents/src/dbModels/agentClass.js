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
            unique: true
        },
        {
            fields: ["user_id"],
        },
    ],
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=agentClass.js.map