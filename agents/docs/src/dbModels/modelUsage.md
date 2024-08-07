# PsModelUsage

The `PsModelUsage` class represents the usage of AI models within the system. It tracks the number of tokens processed by the models, as well as the associated user, agent, and connector information.

## Properties

| Name                        | Type     | Description                                                                 |
|-----------------------------|----------|-----------------------------------------------------------------------------|
| id                          | number   | The unique identifier for the model usage record.                           |
| user_id                     | number   | The ID of the user associated with this model usage.                        |
| created_at                  | Date     | The date and time when the record was created.                              |
| updated_at                  | Date     | The date and time when the record was last updated.                         |
| model_id                    | number   | The ID of the AI model being used.                                          |
| token_in_count              | number   | The number of input tokens processed by the model.                          |
| token_out_count             | number   | The number of output tokens generated by the model.                         |
| token_in_cached_context_count | number | The number of input tokens from cached context processed by the model.      |
| agent_id                    | number   | The ID of the agent associated with this model usage (optional).            |
| connector_id                | number   | The ID of the connector associated with this model usage (optional).        |

## Example

```typescript
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface PsModelUsageCreationAttributes
  extends Optional<
  PsModelUsageAttributes,
    "id" | "created_at" | "updated_at"
  > {}

export class PsModelUsage
  extends Model<PsModelUsageAttributes, PsModelUsageCreationAttributes>
  implements PsModelUsageAttributes
{
  declare id: number;
  declare user_id: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare model_id: number;
  declare token_in_count: number;
  declare token_out_count: number;
  declare token_in_cached_context_count: number;
  declare agent_id: number;
  declare connector_id: number;
}

PsModelUsage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    model_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_in_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_out_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_in_cached_context_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    connector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "ps_model_usage",
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["model_id"],
      },
      {
        fields: ["agent_id"],
      },
      {
        fields: ["connector_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);
```

This example demonstrates how to define the `PsModelUsage` class using Sequelize, including the properties and their types, as well as the initialization of the model with the necessary configurations.