import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index.js";

interface PsAgentConnectorClassCreationAttributes
  extends Optional<
    PsAgentConnectorClassAttributes,
    "id" | "uuid" | "created_at" | "updated_at"
  > {}

export class PsAgentConnectorClass
  extends Model<PsAgentConnectorClassAttributes, PsAgentConnectorClassCreationAttributes>
  implements PsAgentConnectorClassAttributes
{
  public id!: number;
  public uuid!: string;
  public user_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public name!: string;
  public version!: number;
  public available!: boolean;
  public configuration!: PsAgentConnectorConfiguration;
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