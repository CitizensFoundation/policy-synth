import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";
import { PsAgent } from "./agent.js";
import { PsAgentConnector } from "./agentConnector.js";

interface PsExternalApiUsageCreationAttributes
  extends Optional<
  PsExternalApiUsageAttributes,
    "id" | "created_at" | "updated_at"
  > {}

export class PsExternalApiUsage
  extends Model<PsExternalApiUsageAttributes, PsExternalApiUsageCreationAttributes>
  implements PsExternalApiUsageAttributes
{
  public id!: number;
  public user_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public external_api_id!: number;
  public callCount!: number;
  public agent_id!: number;
  public connector_id!: number;

  // Associations
  public Agent?: PsAgentAttributes;
  public Connector?: PsAgentConnectorAttributes;
}

PsExternalApiUsage.init(
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
    external_api_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    callCount: {
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
    tableName: "ps_api_usage",
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["external_api_id"],
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

(PsExternalApiUsage as any).associate = (models: any) => {
  PsExternalApiUsage.belongsTo(models.PsAgent, {
    foreignKey: 'agent_id',
    as: 'Agent',
  });
  PsExternalApiUsage.belongsTo(models.PsAgentConnector, {
    foreignKey: 'connector_id',
    as: 'Connector',
  });
};
