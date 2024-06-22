import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";
import { PsAgentClass } from "./agentClass.js";
import { PsAgentConnectorClass } from "./agentConnectorClass.js";

interface PsAgentRegistryCreationAttributes
  extends Optional<
    PsAgentRegistryAttributes,
    "id" | "uuid" | "created_at" | "updated_at"
  > {}

export class PsAgentRegistry
  extends Model<PsAgentRegistryAttributes, PsAgentRegistryCreationAttributes>
  implements PsAgentRegistryAttributes
{
  declare id: number;
  declare uuid: string;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare configuration: PsAgentRegistryConfiguration;

  declare Agents?: PsAgentClassAttributes[];
  declare Connectors?: PsAgentConnectorClassAttributes[];
}

PsAgentRegistry.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    tableName: "ps_agent_registries",
    indexes: [
      {
        fields: ["uuid"],
        unique: true
      },
      {
        fields: ["user_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);

// Define associations
PsAgentRegistry.belongsToMany(PsAgentClass, {
  through: "AgentRegistryAgents",
  as: "Agents",
  foreignKey: "agent_id",
  timestamps: false
});

PsAgentRegistry.belongsToMany(PsAgentConnectorClass, {
  through: "AgentRegistryConnectors",
  foreignKey: "connector_id",
  as: "Connectors",
  timestamps: false
});