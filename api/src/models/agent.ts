import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index.js";
import { PsAgentClass } from "./agentClass.js";
import { User } from "./ypUser.js";
import { Group } from "./ypGroup.js";
import { PsApiCost } from "./apiCost.js";
import { PsModelCost } from "./modelCost.js";
import { PsAgentConnector } from "./agentConnector.js";

interface PsAgentCreationAttributes
  extends Optional<
    PsAgentAttributes,
    "id" | "uuid" | "created_at" | "updated_at" | "parent_agent_id"
  > {}

export class PsAgent
  extends Model<PsAgentAttributes, PsAgentCreationAttributes>
  implements PsAgentAttributes
{
  public id!: number;
  public uuid!: string;
  public user_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public class_id!: number;
  public group_id!: number;
  public configuration!: PsBaseNodeConfiguration;
  public parent_agent_id?: number;

  // Associations
  public Class?: PsAgentClassAttributes;
  public User?: YpUserData;
  public Group?: YpGroupData;
  public ApiCosts?: PsApiCostAttributes[];
  public ModelCosts?: PsModelCostAttributes[];
  public ParentAgent?: PsAgent;
  public SubAgents?: PsAgent[];
  public Connectors?: PsAgentConnectorAttributes[];
}

PsAgent.init(
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
    parent_agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "ps_agents",
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
      {
        fields: ["parent_agent_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);

// Define associations
PsAgent.belongsTo(PsAgentClass, { foreignKey: "class_id", as: "class" });

PsAgent.belongsTo(User, {
  foreignKey: "user_id",
  as: "User",
});
PsAgent.belongsTo(Group, {
  foreignKey: "group_id",
  as: "Group",
});
PsAgent.hasMany(PsApiCost, {
  foreignKey: "agent_id",
  as: "ApiCosts",
});
PsAgent.hasMany(PsModelCost, {
  foreignKey: "agent_id",
  as: "ModelCosts",
});
PsAgent.belongsTo(PsAgent, {
  foreignKey: "parent_agent_id",
  as: "ParentAgent",
});

PsAgent.hasMany(PsAgent, { foreignKey: "parent_agent_id", as: "SubAgents" });

// Through a join table
PsAgent.belongsToMany(PsAgentConnector, {
  through: "AgentConnectors",
  foreignKey: "agent_id",
  as: "Connectors",
});
