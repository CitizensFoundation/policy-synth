import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";

export interface AgentConnectorClassAdminsAttributes {
  agent_connector_class_id: number;
  user_id: number;
}

export class AgentConnectorClassAdmins
  extends Model<AgentConnectorClassAdminsAttributes, AgentConnectorClassAdminsAttributes>
  implements AgentConnectorClassAdminsAttributes
{
  declare agent_connector_class_id: number;
  declare user_id: number;
}

AgentConnectorClassAdmins.init(
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
    tableName: "AgentConnectorClassAdmins",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["agent_connector_class_id"] },
      { fields: ["user_id"] },
    ],
  }
);