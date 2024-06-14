import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index.js";

interface YpGroupDataCreationAttributes
  extends Optional<YpGroupData, "id" | "created_at" | "updated_at"> {}

export class Group
  extends Model<YpGroupData, YpGroupDataCreationAttributes>
  implements YpGroupData
{
  public id!: number;
  public name!: string;
  public user_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Group.init(
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
  },
  {
    sequelize,
    tableName: "groups",
    indexes: [
      {
        fields: ["user_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);