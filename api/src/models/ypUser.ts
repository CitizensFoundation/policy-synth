import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index.js";

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
  public id!: number;
  public name!: string;
  public email!: string;

  // timestamps!
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
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