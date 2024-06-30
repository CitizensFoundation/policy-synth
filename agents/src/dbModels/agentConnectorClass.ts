import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

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