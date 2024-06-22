import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface PsModelUsageCreationAttributes
  extends Optional<
  PsModelUsageAttributes,
    "id" | "created_at" | "updated_at"
  > {}

export class PsModelUsage
  extends Model<PsModelUsageAttributes, PsModelUsageCreationAttributes>
  implements PsModelUsageAttributes
{
  declare id: number;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare model_id: number;
  declare token_in_count: number;
  declare token_out_count: number;
  declare token_in_cached_context_count: number;
  declare agent_id: number;
  declare connector_id: number;
}

PsModelUsage.init(
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
    token_in_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_out_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_in_cached_context_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    connector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "ps_model_usage",
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
    ],
    timestamps: true,
    underscored: true,
  }
);