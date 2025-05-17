import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

// import { PsAgentRegistry } from "./agentRegistry.js";
// import { PsAgentConnectorClass } from "./agentConnectorClass.js"; // Assuming this model exists

export interface AgentRegistryConnectorsAttributes {
  id: number;
  ps_agent_registry_id: number;
  ps_agent_connector_class_id: number;
  created_at: Date;
  updated_at: Date;
}

interface AgentRegistryConnectorsCreationAttributes
  extends Optional<AgentRegistryConnectorsAttributes, "id" | "created_at" | "updated_at"> {}

export class AgentRegistryConnectors
  extends Model<AgentRegistryConnectorsAttributes, AgentRegistryConnectorsCreationAttributes>
  implements AgentRegistryConnectorsAttributes
{
  declare id: number;
  declare ps_agent_registry_id: number;
  declare ps_agent_connector_class_id: number;
  declare created_at: Date;
  declare updated_at: Date;
}

AgentRegistryConnectors.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ps_agent_registry_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ps_agent_registries", // Table name
        key: "id",
      },
      onDelete: "CASCADE", // Matches migration
    },
    ps_agent_connector_class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ps_agent_connector_classes", // Table name, assumed from migration
        key: "id",
      },
      onDelete: "CASCADE", // Matches migration
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
    tableName: "AgentRegistryConnectors",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["ps_agent_registry_id"],
      },
      {
        fields: ["ps_agent_connector_class_id"],
      },
    ],
  }
);