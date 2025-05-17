import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";

// Note: No Optional interface needed if no auto-generated fields like id, createdAt, updatedAt
export interface AgentClassUsersAttributes {
  agent_class_id: number;
  user_id: number;
}

export class AgentClassUsers
  extends Model<AgentClassUsersAttributes, AgentClassUsersAttributes>
  // Creation attributes are same as model attributes
  implements AgentClassUsersAttributes
{
  declare agent_class_id: number;
  declare user_id: number;
}

AgentClassUsers.init(
  {
    agent_class_id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Part of a composite primary key
      allowNull: false,
      references: {
        model: "ps_agent_classes",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Part of a composite primary key
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
    tableName: "AgentClassUsers",
    timestamps: false, // As per migration
    underscored: true,
    indexes: [{ fields: ["agent_class_id"] }, { fields: ["user_id"] }],
  }
);
