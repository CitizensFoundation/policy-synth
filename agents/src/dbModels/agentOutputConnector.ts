import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";

export interface AgentOutputConnectorsAttributes {
  agent_id: number;
  connector_id: number;
}

export class AgentOutputConnectors
  extends Model<AgentOutputConnectorsAttributes, AgentOutputConnectorsAttributes>
  implements AgentOutputConnectorsAttributes
{
  declare agent_id: number;
  declare connector_id: number;
}

AgentOutputConnectors.init(
  {
    agent_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "ps_agents",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    connector_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "ps_agent_connectors",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "AgentOutputConnectors",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["agent_id"] },
      { fields: ["connector_id"] },
    ],
  }
);