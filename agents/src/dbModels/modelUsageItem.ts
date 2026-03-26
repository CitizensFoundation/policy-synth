import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface PsModelUsageItemCreationAttributes
  extends Optional<
    PsModelUsageItemAttributes,
    "id" | "created_at" | "updated_at"
  > {}

export class PsModelUsageItem
  extends Model<
    PsModelUsageItemAttributes,
    PsModelUsageItemCreationAttributes
  >
  implements PsModelUsageItemAttributes
{
  declare id: number;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare model_id: number;
  declare agent_id: number;
  declare connector_id?: number;
  declare data: PsModelUsageItemData;
}

PsModelUsageItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    model_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    connector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_model_usage_item",
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["model_id"],
      },
      {
        fields: ["agent_id"],
      },
      {
        fields: ["connector_id"],
      },
      {
        fields: ["created_at"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);
