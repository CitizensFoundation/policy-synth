import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "./sequelize.js";

interface PsAiModelCreationAttributes
  extends Optional<
    PsAiModelAttributes,
    "id" | "uuid" | "created_at" | "updated_at"
  > {}

export class PsAiModel
  extends Model<PsAiModelAttributes, PsAiModelCreationAttributes>
  implements PsAiModelAttributes
{
  declare id: number;
  declare uuid: string;
  declare user_id: number;
  declare organization_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare name: string;
  declare configuration: PsAiModelConfiguration;
}

PsAiModel.init(
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
    organization_id: {
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
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_ai_models",
    indexes: [
      {
        fields: ["uuid"],
        unique: true
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["organization_id"],
      }
    ],
    timestamps: true,
    underscored: true,
  }
);
