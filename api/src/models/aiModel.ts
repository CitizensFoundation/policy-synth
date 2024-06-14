import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "./index.js";

interface PsAiModelCreationAttributes
  extends Optional<
    PsAiModelAttributes,
    "id" | "uuid" | "created_at" | "updated_at"
  > {}

export class PsAiModelClass
  extends Model<PsAiModelAttributes, PsAiModelCreationAttributes>
  implements PsAiModelAttributes
{
  public id!: number;
  public uuid!: string;
  public user_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public name!: string;
  public configuration!: PsAiModelConfiguration;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PsAiModelClass.init(
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
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_ai_model_classes",
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
