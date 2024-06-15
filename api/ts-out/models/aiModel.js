import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsAiModel extends Model {
    id;
    uuid;
    user_id;
    created_at;
    updated_at;
    name;
    configuration;
}
PsAiModel.init({
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
    configuration: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "ps_ai_models",
    indexes: [
        {
            fields: ["uuid"],
        },
        {
            fields: ["user_id"],
        },
    ],
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=aiModel.js.map