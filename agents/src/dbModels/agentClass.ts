import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";
import { User } from "./ypUser.js";

interface PsAgentClassAttributesCreation
  extends Optional<
    PsAgentClassAttributes,
    "id" | "uuid" | "class_base_id" | "created_at" | "updated_at"
  > {}

export class PsAgentClass
  extends Model<PsAgentClassAttributes, PsAgentClassAttributesCreation>
  implements PsAgentClassAttributes
{
  declare id: number;
  declare uuid: string;
  declare class_base_id: string;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare name: string;
  declare version: number;
  declare configuration: PsAgentClassAttributesConfiguration;
  declare available: boolean;

  // Associations
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
 declare hasAdmin: (user: User) => Promise<boolean>;

 declare addAdmin: (user: User, obj?: any | undefined) => Promise<void>;
 declare addAdmins: (users: User[]) => Promise<void>;
 declare getAdmins: () => Promise<User[]>;
 declare setAdmins: (users: User[]) => Promise<void>;
 declare removeAdmin: (user: User) => Promise<void>;
 declare removeAdmins: (users: User[]) => Promise<void>;
}

PsAgentClass.init(
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
    tableName: "ps_agent_classes",
    indexes: [
      {
        fields: ["uuid"],
        unique: true,
      },
      {
        fields: ["class_base_id"],
      },
      {
        fields: ["class_base_id", "version"],
      },
      {
        fields: ["user_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);

(PsAgentClass as any).associate = (models: any) => {
  // Define associations
  PsAgentClass.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "Owner",
  });

  PsAgentClass.belongsToMany(models.User, {
    through: "AgentClassUsers",
    foreignKey: "agent_class_id",
    otherKey: "user_id",
    as: "Users",
    timestamps: false,
  });

  PsAgentClass.belongsToMany(models.User, {
    through: "AgentClassAdmins",
    foreignKey: "agent_class_id",
    otherKey: "user_id",
    as: "Admins",
    timestamps: false,
  });

  PsAgentClass.belongsToMany(models.PsAgentRegistry, {
    through: "AgentRegistryAgents",
    as: "Registry",
    foreignKey: "ps_agent_class_id",
    otherKey: "ps_agent_registry_id",
    timestamps: true,
  });

  PsAgentClass.hasMany(models.PsAgent, {
    foreignKey: "class_id",
    as: "Agents",
  });
};