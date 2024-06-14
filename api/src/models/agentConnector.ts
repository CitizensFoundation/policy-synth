import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index.js";
import { PsAgentConnectorClass } from "./agentConnectorClass.js";
import { User } from "./ypUser.js";
import { Group } from "./ypGroup.js";
import { PsAgent } from "./agent.js";

interface PsAgentConnectorCreationAttributes
  extends Optional<
    PsAgentConnectorAttributes,
    "id" | "uuid" | "created_at" | "updated_at"
  > {}

export class PsAgentConnector
  extends Model<PsAgentConnectorAttributes, PsAgentConnectorCreationAttributes>
  implements PsAgentConnectorAttributes
{
  public id!: number;
  public uuid!: string;
  public user_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public class_id!: number;
  public group_id!: number;
  public configuration!: PsAgentConnectorsBaseConfiguration;

  // Associations
  public User?: YpUserData;
  public Group?: YpGroupData;
  public Class?: PsAgentConnectorClassAttributes;
}

PsAgentConnector.init(
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
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_agent_connectors",
    indexes: [
      {
        fields: ["uuid"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["class_id"],
      },
      {
        fields: ["group_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);

// Define associations
PsAgentConnector.belongsTo(PsAgentConnectorClass, {
  foreignKey: "class_id",
  as: "Class",
});
PsAgentConnector.belongsTo(User, {
  foreignKey: "user_id",
  as: "User",
});
PsAgentConnector.belongsTo(Group, {
  foreignKey: "group_id",
  as: "Group",
});

// Through a join table
PsAgentConnector.belongsToMany(PsAgent, {
  through: "AgentConnectors",
  foreignKey: "connector_id",
  as: "Agents",
});
