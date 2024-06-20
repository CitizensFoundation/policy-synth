import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface PsAgentAuditLogCreationAttributes
  extends Optional<
    PsAgentAuditLogAttributes,
    "id" | "created_at" | "updated_at" | "details"
  > {}

export class PsAgentAuditLog
  extends Model<PsAgentAuditLogAttributes, PsAgentAuditLogCreationAttributes>
  implements PsAgentAuditLogAttributes
{
  declare id: number;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare agent_id: number;
  declare connector_id: number;
  declare action: string;
  declare details?: PsAgentAuditLogDetails;
}

PsAgentAuditLog.init(
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
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    connector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: "ps_agent_audit_logs",
    indexes: [
      {
        fields: ["user_id"],
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