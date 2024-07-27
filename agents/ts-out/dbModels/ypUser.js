import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class User extends Model {
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
User.associate = (models) => {
    User.belongsToMany(models.PsAgentClass, {
        through: "AgentClassUsers",
        foreignKey: "user_id",
        otherKey: "agent_class_id",
        as: "AgentClassesAsUser",
    });
    User.belongsToMany(models.PsAgentClass, {
        through: "AgentClassAdmins",
        foreignKey: "user_id",
        otherKey: "agent_class_id",
        as: "AgentClassesAsAdmin",
    });
};
//# sourceMappingURL=ypUser.js.map