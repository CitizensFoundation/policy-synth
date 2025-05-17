import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";
import { User } from "./ypUser.js";
import { AgentConnectorClassUsers } from "./agentConnectorClassUser.js";
import { AgentConnectorClassAdmins } from "./agentConnectorClassAdmin.js";
import { PsAgentRegistry } from "./agentRegistry.js";
import { AgentRegistryConnectors } from "./agentRegistryConnector.js";
import { PsAgentConnector } from "./agentConnector.js";

// Define attributes based on typical usage and migration tables
export interface PsAgentConnectorClassAttributes {
  id: number;
  uuid: string;
  class_base_id: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  version: number;
  configuration: PsAgentConnectorConfiguration;
  available: boolean;
}

interface PsAgentConnectorClassCreationAttributes
  extends Optional<
    PsAgentConnectorClassAttributes,
    "id" | "uuid" | "class_base_id" | "created_at" | "updated_at"
  > {}

export class PsAgentConnectorClass
  extends Model<
    PsAgentConnectorClassAttributes,
    PsAgentConnectorClassCreationAttributes
  >
  implements PsAgentConnectorClassAttributes
{
  declare id: number;
  declare uuid: string;
  declare class_base_id: string;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare name: string;
  declare version: number;
  declare configuration: PsAgentConnectorConfiguration;
  declare available: boolean;

  // Associations (adjust as needed)
  declare Users?: User[];
  declare Admins?: User[];

  // Association methods
  declare addUser: (user: User, obj?: any | undefined) => Promise<void>;
  declare addUsers: (users: User[]) => Promise<void>;
  declare getUsers: () => Promise<User[]>;
  declare setUsers: (users: User[]) => Promise<void>;
  declare removeUser: (user: User) => Promise<void>;
  declare removeUsers: (users: User[]) => Promise<void>;
  declare hasUser: (user: User) => Promise<boolean>;

  declare addAdmin: (user: User, obj?: any | undefined) => Promise<void>;
  declare addAdmins: (users: User[]) => Promise<void>;
  declare getAdmins: () => Promise<User[]>;
  declare setAdmins: (users: User[]) => Promise<void>;
  declare removeAdmin: (user: User) => Promise<void>;
  declare removeAdmins: (users: User[]) => Promise<void>;
  declare hasAdmin: (user: User) => Promise<boolean>;
}

PsAgentConnectorClass.init(
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
      unique: true,
    },
    class_base_id: {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_agent_connector_classes",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["uuid"], unique: true },
      { fields: ["class_base_id"] },
      { fields: ["class_base_id", "version"] },
      { fields: ["user_id"] },
      { fields: ["name"] },
      { fields: ["version"] },
    ],
  }
);

(PsAgentConnectorClass as any).associate = (models: any) => {
  PsAgentConnectorClass.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "Owner", // Assuming an Owner association
  });

  PsAgentConnectorClass.belongsToMany(models.User, {
    through: AgentConnectorClassUsers,
    foreignKey: "agent_connector_class_id",
    otherKey: "user_id",
    as: "Users",
    timestamps: false,
  });

  PsAgentConnectorClass.belongsToMany(models.User, {
    through: AgentConnectorClassAdmins,
    foreignKey: "agent_connector_class_id",
    otherKey: "user_id",
    as: "Admins",
    timestamps: false,
  });

  // Association with PsAgentRegistry through AgentRegistryConnectors
  PsAgentConnectorClass.belongsToMany(models.PsAgentRegistry, {
    through: AgentRegistryConnectors, // Use the imported model
    as: "Registry",
    foreignKey: "ps_agent_connector_class_id",
    otherKey: "ps_agent_registry_id",
    timestamps: false, // Join table model handles its own timestamps
  });

  // Add other associations if they exist, e.g., with PsAgentConnector
  PsAgentConnectorClass.hasMany(models.PsAgentConnector, {
    foreignKey: "class_id",
    as: "Connectors",
  });
};
