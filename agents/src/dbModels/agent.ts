import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";
import { PsAgentClass } from "./agentClass.js";
import { User } from "./ypUser.js";
import { Group } from "./ypGroup.js";
import { PsAgentConnector } from "./agentConnector.js";
import { PsAiModel } from "./aiModel.js";

interface PsAgentCreationAttributes
  extends Optional<
    PsAgentAttributes,
    "id" | "uuid" | "created_at" | "updated_at" | "parent_agent_id"
  > {}

export class PsAgent
  extends Model<PsAgentAttributes, PsAgentCreationAttributes>
  implements PsAgentAttributes
{
  declare id: number;
  declare uuid: string;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare class_id: number;
  declare group_id: number;
  declare configuration: PsBaseNodeConfiguration;
  declare parent_agent_id?: number;

  // Associations
  declare Class?: PsAgentClass;
  declare User?: YpUserData;
  declare Group?: YpGroupData;
  declare ExternalApiUsage?: PsExternalApiUsageAttributes[];
  declare ModelUsage?: PsModelUsageAttributes[];
  declare ParentAgent?: PsAgent;
  declare SubAgents?: PsAgent[];
  declare Connectors?: PsAgentConnectorAttributes[];
  declare AiModels?: PsAiModelAttributes[];

  declare addConnector: (connector: PsAgentConnector) => Promise<void>;
  declare addConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
  declare getConnectors: () => Promise<PsAgentConnector[]>;
  declare setConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
  declare removeConnectors: (connectors: PsAgentConnector[]) => Promise<void>;

  declare addSubAgent: (agent: PsAgent) => Promise<void>;
  declare addSubAgents: (agents: PsAgent[]) => Promise<void>;
  declare getSubAgents: () => Promise<PsAgent[]>;
  declare setSubAgents: (agents: PsAgent[]) => Promise<void>;
  declare removeSubAgents: (agents: PsAgent[]) => Promise<void>;

  declare addAiModel: (model: PsAiModel) => Promise<void>;
  declare addAiModels: (models: PsAiModel[]) => Promise<void>;
  declare getAiModels: () => Promise<PsAiModel[]>;
  declare setAiModels: (models: PsAiModel[]) => Promise<void>;
  declare removeAiModels: (models: PsAiModel[]) => Promise<void>;

  get redisMemoryKey() {
    return "ps:agent:memory:"+this.id;
  }
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
      {
        fields: ["parent_agent_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);

(PsAgent as any).associate = (models: any) => {
  // Define associations
  PsAgent.belongsTo(models.PsAgentClass, {
    foreignKey: "class_id",
    as: "Class",
  });

  PsAgent.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "User",
  });

  PsAgent.belongsTo(models.Group, {
    foreignKey: "group_id",
    as: "Group",
  });

  PsAgent.hasMany(models.PsExternalApiUsage, {
    foreignKey: "agent_id",
    as: "ExternalApiUsage",
  });

  PsAgent.hasMany(models.PsModelUsage, {
    foreignKey: "agent_id",
    as: "ModelUsage",
  });

  PsAgent.belongsTo(models.PsAiModel, {
    foreignKey: "parent_agent_id",
    as: "AiModel",
  });

  PsAgent.hasMany(models.PsAgent, {
    foreignKey: "parent_agent_id",
    as: "SubAgents",
  });

  PsAgent.belongsTo(models.PsAgent, {
    foreignKey: 'parent_agent_id',
    as: 'ParentAgent',
  });

  // Through a join table
  PsAgent.belongsToMany(models.PsAgentConnector, {
    through: "AgentConnectors",
    foreignKey: "agent_id",
    as: "Connectors",
    timestamps: false,
  });

  // Through a join table
  PsAgent.belongsToMany(models.PsAiModel, {
    through: "AgentModels",
    foreignKey: "agent_id",
    otherKey: 'ai_model_id',
    as: "AiModels",
    timestamps: false,
  });
};
