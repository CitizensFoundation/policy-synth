import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index.js";
export class User extends Model {
    id;
    name;
    email;
    // timestamps!
    created_at;
    updated_at;
}
User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
}, {
    sequelize,
    tableName: "users",
    indexes: [
        {
            fields: ["email"],
        },
    ],
    timestamps: false,
    underscored: true,
});
//# sourceMappingURL=ypUser.js.map