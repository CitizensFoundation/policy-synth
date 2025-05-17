import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";

export interface AgentInputConnectorsAttributes {
  agent_id: number;
  connector_id: number;
}

export class AgentInputConnectors
  extends Model<AgentInputConnectorsAttributes, AgentInputConnectorsAttributes>
  implements AgentInputConnectorsAttributes
{
  declare agent_id: number;
  declare connector_id: number;
}

AgentInputConnectors.init(
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
    tableName: "AgentInputConnectors",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["agent_id"] },
      { fields: ["connector_id"] },
    ],
  }
);