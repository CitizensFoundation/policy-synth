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
  public id!: number;
  public uuid!: string;
  public user_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public organization_id!: number;
  public type!: string;
  public priceAdapter!: PsBaseApiPriceAdapter;
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