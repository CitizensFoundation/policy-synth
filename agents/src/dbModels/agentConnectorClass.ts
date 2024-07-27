import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";
import { User } from "./ypUser.js";

interface PsAgentConnectorClassCreationAttributes
  extends Optional<
    PsAgentConnectorClassAttributes,
    "id" | "uuid" | "created_at" | "updated_at"
  > {}

export class PsAgentConnectorClass
  extends Model<PsAgentConnectorClassAttributes, PsAgentConnectorClassCreationAttributes>
  implements PsAgentConnectorClassAttributes
{
  declare id: number;
  declare uuid: string;
  declare user_id: number;
  declare class_base_id: string;
  declare created_at: Date;
  declare updated_at: Date;
  declare name: string;
  declare version: number;
  declare available: boolean;
  declare configuration: PsAgentConnectorConfiguration;

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

  declare addAdmin: (user: User, obj?: any | undefined) => Promise<void>;
  declare addAdmins: (users: User[]) => Promise<void>;
  declare getAdmins: () => Promise<User[]>;
  declare setAdmins: (users: User[]) => Promise<void>;
  declare removeAdmin: (user: User) => Promise<void>;
  declare removeAdmins: (users: User[]) => Promise<void>;
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
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_agent_connector_classes",
    indexes: [
      {
        fields: ["uuid"],
        unique: true
      },
      {
        fields: ["class_base_id"],
      },
      {
        fields: ["class_base_id","version"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["name"],
      },
      {
        fields: ["version"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);

(PsAgentConnectorClass as any).associate = (models: any) => {
  // Define associations
  PsAgentConnectorClass.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "Owner",
  });

  PsAgentConnectorClass.belongsToMany(models.User, {
    through: "AgentConnectorClassUsers",
    foreignKey: "agent_connector_class_id",
    otherKey: "user_id",
    as: "Users",
    timestamps: false,
  });

  PsAgentConnectorClass.belongsToMany(models.User, {
    through: "AgentConnectorClassAdmins",
    foreignKey: "agent_connector_class_id",
    otherKey: "user_id",
    as: "Admins",
    timestamps: false,
  });

  PsAgentConnectorClass.belongsToMany(models.PsAgentRegistry, {
    through: "AgentRegistryConnectors",
    as: "Registry",
    foreignKey: "ps_agent_connector_class_id",
    otherKey: "ps_agent_registry_id",
    timestamps: true,
  });

  PsAgentConnectorClass.hasMany(models.PsAgentConnector, {
    foreignKey: "class_id",
    as: "Connectors",
  });
};