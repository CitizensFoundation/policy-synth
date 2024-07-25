import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface PsExternalApiCreationAttributes
  extends Optional<
  PsExternalApiAttributes,
    "id" | "uuid" | "created_at" | "updated_at"
  > {}

export class PsExternalApi
  extends Model<PsExternalApiAttributes, PsExternalApiCreationAttributes>
  implements PsExternalApiAttributes
{
  declare id: number;
  declare uuid: string;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare organization_id: number;
  declare type: string;
  declare priceAdapter: PsBaseApiPriceAdapter;
}

PsExternalApi.init(
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
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priceAdapter: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ps_external_apis",
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
      },
      {
        fields: ["type"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);