import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";

export interface AgentClassAdminsAttributes {
  agent_class_id: number;
  user_id: number;
}

export class AgentClassAdmins
  extends Model<AgentClassAdminsAttributes, AgentClassAdminsAttributes>
  implements AgentClassAdminsAttributes
{
  declare agent_class_id: number;
  declare user_id: number;
}

AgentClassAdmins.init(
  {
    agent_class_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "ps_agent_classes",
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
    tableName: "AgentClassAdmins",
    timestamps: false,
    underscored: true,
    indexes: [{ fields: ["agent_class_id"] }, { fields: ["user_id"] }],
  }
);
