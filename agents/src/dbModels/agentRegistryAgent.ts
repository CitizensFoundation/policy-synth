import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

// These imports are for type checking and references, actual model instances
// for associations will come from the 'models' object in .associate() if needed.
// import { PsAgentRegistry } from "./agentRegistry.js";
// import { PsAgentClass } from "./agentClass.js";

export interface AgentRegistryAgentsAttributes {
  id: number;
  ps_agent_registry_id: number;
  ps_agent_class_id: number;
  created_at: Date;
  updated_at: Date;
}

interface AgentRegistryAgentsCreationAttributes
  extends Optional<AgentRegistryAgentsAttributes, "id" | "created_at" | "updated_at"> {}

export class AgentRegistryAgents
  extends Model<AgentRegistryAgentsAttributes, AgentRegistryAgentsCreationAttributes>
  implements AgentRegistryAgentsAttributes
{
  declare id: number;
  declare ps_agent_registry_id: number;
  declare ps_agent_class_id: number;
  declare created_at: Date;
  declare updated_at: Date;
}

AgentRegistryAgents.init(
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
    ps_agent_class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ps_agent_classes", // Table name
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
    tableName: "AgentRegistryAgents",
    timestamps: true, // Manages created_at and updated_at
    underscored: true, // For field names like ps_agent_registry_id
    indexes: [
      {
        fields: ["ps_agent_registry_id"],
      },
      {
        fields: ["ps_agent_class_id"],
      },
    ],
  }
);