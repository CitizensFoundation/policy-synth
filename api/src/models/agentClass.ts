import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index.js";

interface PsAgentClassAttributesCreation
  extends Optional<
    PsAgentClassAttributes,
    "id" | "uuid" | "created_at" | "updated_at"
  > {}

export class PsAgentClass
  extends Model<PsAgentClassAttributes, PsAgentClassAttributesCreation>
  implements PsAgentClassAttributes
{
  public id!: number;
  public uuid!: string;
  public user_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public name!: string;
  public version!: number;
  public configuration!: PsAgentClassAttributesConfiguration;
  public available!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      },
      {
        fields: ["user_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);