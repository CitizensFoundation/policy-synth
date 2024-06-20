import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface YpOrganizationDataCreationAttributes
  extends Optional<YpOrganizationsData, "id" | "created_at" | "updated_at"> {}

export class Group
  extends Model<YpOrganizationsData, YpOrganizationDataCreationAttributes>
  implements YpOrganizationsData
{
  declare id: number;
  declare name: string;
  declare type: string;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare configuration: any;
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
  },
  {
    sequelize,
    tableName: "organizations",
    indexes: [
      {
        fields: ["name"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);
