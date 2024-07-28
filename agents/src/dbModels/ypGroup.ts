import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface YpGroupDataCreationAttributes
  extends Optional<YpGroupData, "id" | "created_at" | "updated_at"> {}

export class Group
  extends Model<YpGroupData, YpGroupDataCreationAttributes>
  implements YpGroupData
{
  declare id: number;
  declare name: string;
  declare user_id: number;
  declare community_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare private_access_configuration: YpGroupPrivateAccessConfiguration[];
  declare configuration: YpGroupConfiguration;
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
