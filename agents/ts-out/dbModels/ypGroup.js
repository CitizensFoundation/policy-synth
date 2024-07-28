import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class Group extends Model {
}
Group.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    community_id: {
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
    configuration: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    private_access_configuration: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "groups",
    indexes: [
        {
            fields: ["user_id"],
        },
    ],
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=ypGroup.js.map