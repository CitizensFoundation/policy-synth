import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class Group extends Model {
    id;
    name;
    type;
    user_id;
    created_at;
    updated_at;
    configuration;
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
    type: {
        type: DataTypes.STRING,
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
    configuration: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "organizations",
    indexes: [
        {
            fields: ["name"],
        },
    ],
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=ypOrganization.js.map