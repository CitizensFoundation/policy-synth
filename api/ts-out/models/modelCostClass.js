import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class PsModelCostClass extends Model {
    id;
    uuid;
    user_id;
    created_at;
    updated_at;
    model_id;
    configuration;
}
PsModelCostClass.init({
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
    model_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    configuration: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "ps_model_cost_classes",
    indexes: [
        {
            fields: ["uuid"],
        },
        {
            fields: ["user_id"],
        },
        {
            fields: ["model_id"],
        },
    ],
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=modelCostClass.js.map