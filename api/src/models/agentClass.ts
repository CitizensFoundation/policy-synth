import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface PsAgentClassAttributesCreation
  extends Optional<
    PsAgentClassAttributes,
    "id" | "uuid" | "created_at" | "updated_at"
  > {}

export class PsAgentClass
  extends Model<PsAgentClassAttributes, PsAgentClassAttributesCreation>
  implements PsAgentClassAttributes
{
  declare id: number;
  declare uuid: string;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare name: string;
  declare version: number;
  declare configuration: PsAgentClassAttributesConfiguration;
  declare available: boolean;
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
        unique: true
      },
      {
        fields: ["user_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);