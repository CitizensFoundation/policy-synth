import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";
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
  declare id: number;
  declare uuid: string;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare class_id: number;
  declare group_id: number;
  declare configuration: PsAgentConnectorsBaseConfiguration;

  // Associations
  declare User?: YpUserData;
  declare Group?: YpGroupData;
  declare Class?: PsAgentConnectorClassAttributes;

  declare InputAgents?: PsAgentAttributes[];
  declare OutputAgents?: PsAgentAttributes[];
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
        unique: true
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

(PsAgentConnector as any).associate = (models: any) => {
  console.log(`PsAgentConnector.associate ${JSON.stringify(models.PsAgentConnectorClass)}`)
  // Define associations
  PsAgentConnector.belongsTo(models.PsAgentConnectorClass, {
    foreignKey: "class_id",
    as: "Class",
  });
  PsAgentConnector.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "User",
  });
  PsAgentConnector.belongsTo(models.Group, {
    foreignKey: "group_id",
    as: "Group",
  });

  PsAgentConnector.hasMany(models.PsExternalApiUsage, {
    foreignKey: "connector_id",
    as: "ExternalApiUsage",
  });

  PsAgentConnector.hasMany(models.PsModelUsage, {
    foreignKey: "connector_id",
    as: "ModelUsage",
  });

  // Through a join table
  PsAgentConnector.belongsToMany(models.PsAgent, {
    through: "AgentInputConnectors",
    foreignKey: "connector_id",
    otherKey: "agent_id",
    as: "InputAgents",
    timestamps: false,
  });

  PsAgentConnector.belongsToMany(models.PsAgent, {
    through: "AgentOutputConnectors",
    foreignKey: "connector_id",
    otherKey: "agent_id",
    as: "OutputAgents",
    timestamps: false,
  });
};
