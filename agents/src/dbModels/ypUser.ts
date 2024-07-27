import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface YpUserDataAttributes {
  id: number;
  name: string;
  email: string;
}

interface YpUserDataCreationAttributes
  extends Optional<YpUserData, "id" | "created_at" | "updated_at"> {}

export class User
  extends Model<YpUserData, YpUserDataCreationAttributes>
  implements YpUserData
{
  declare id: number;
  declare name: string;
  declare email: string;

  // timestamps!
  declare created_at: Date;
  declare updated_at: Date;
}

User.init(
  {
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
  },
  {
    sequelize,
    tableName: "users",
    indexes: [
      {
        fields: ["email"],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);

(User as any).associate = (models: any) => {
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