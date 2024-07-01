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

  declare addAgent: (agent: PsAgentClass) => Promise<void>;
  declare addConnector: (connector: PsAgentConnectorClass) => Promise<void>;
  declare removeAgent: (agent: PsAgentClass) => Promise<void>;
  declare removeConnector: (connector: PsAgentConnectorClass) => Promise<void>;
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
        unique: true,
      },
      {
        fields: ["user_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);

(PsAgentRegistry as any).associate = (models: any) => {
  PsAgentRegistry.belongsToMany(models.PsAgentClass, {
    through: "AgentRegistryAgents",
    as: "Agents",
    foreignKey: "ps_agent_registry_id",
    otherKey: "ps_agent_class_id",
    timestamps: true,
  });

  PsAgentRegistry.belongsToMany(models.PsAgentConnectorClass, {
    through: "AgentRegistryConnectors",
    as: "Connectors",
    foreignKey: "ps_agent_registry_id",
    otherKey: "ps_agent_connector_class_id",
    timestamps: true,
  });
};