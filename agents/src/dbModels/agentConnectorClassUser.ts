import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";

export interface AgentConnectorClassUsersAttributes {
  agent_connector_class_id: number;
  user_id: number;
}

export class AgentConnectorClassUsers
  extends Model<AgentConnectorClassUsersAttributes, AgentConnectorClassUsersAttributes>
  implements AgentConnectorClassUsersAttributes
{
  declare agent_connector_class_id: number;
  declare user_id: number;
}

AgentConnectorClassUsers.init(
  {
    agent_connector_class_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "ps_agent_connector_classes",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "AgentConnectorClassUsers",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["agent_connector_class_id"] },
      { fields: ["user_id"] },
    ],
  }
);