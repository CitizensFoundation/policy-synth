import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface YpOrganizationDataCreationAttributes
  extends Optional<YpOrganizationsData, "id" | "created_at" | "updated_at"> {}

export class Group
  extends Model<YpOrganizationsData, YpOrganizationDataCreationAttributes>
  implements YpOrganizationsData
{
  public id!: number;
  public name!: string;
  public type!: string;
  public user_id!: number;
  public created_at!: Date;
  public updated_at!: Date;

  public configuration!: any;
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
