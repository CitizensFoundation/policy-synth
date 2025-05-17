import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";

// No Optional interface needed as there are no auto-generated id or timestamps
export interface AgentModelsAttributes {
  agent_id: number;
  ai_model_id: number;
}

export class AgentModels
  extends Model<AgentModelsAttributes, AgentModelsAttributes> // Creation attributes are the same
  implements AgentModelsAttributes
{
  declare agent_id: number;
  declare ai_model_id: number;
}

AgentModels.init(
  {
    agent_id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Part of a composite primary key
      allowNull: false,
      references: {
        model: "ps_agents",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    ai_model_id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Part of a composite primary key
      allowNull: false,
      references: {
        model: "ps_ai_models",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "AgentModels",
    timestamps: false, // As per the migration (no created_at, updated_at)
    underscored: true,
    indexes: [
      { fields: ["agent_id"] },
      { fields: ["ai_model_id"] },
    ],
  }
);