# PsAiModel

The `PsAiModel` class represents an AI model configuration in the system. It extends the Sequelize `Model` class and implements the `PsAiModelAttributes` interface.

## Properties

| Name            | Type                    | Description                                      |
|-----------------|-------------------------|--------------------------------------------------|
| id              | number                  | The unique identifier for the AI model.          |
| uuid            | string                  | The universally unique identifier for the model. |
| user_id         | number                  | The ID of the user who created the model.        |
| organization_id | number                  | The ID of the organization associated with the model. |
| created_at      | Date                    | The date and time when the model was created.    |
| updated_at      | Date                    | The date and time when the model was last updated. |
| name            | string                  | The name of the AI model.                        |
| configuration   | PsAiModelConfiguration  | The configuration details of the AI model.       |

## Initialization

The `PsAiModel` class is initialized with the following schema:

```typescript
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
```

## Example

```typescript
import { PsAiModel } from '@policysynth/agents/dbModels/aiModel.js';

// Example usage of PsAiModel
const newAiModel = PsAiModel.build({
  user_id: 1,
  organization_id: 1,
  name: "Example AI Model",
  configuration: {
    type: "openai",
    modelSize: "large",
    model: "gpt-3",
    provider: "OpenAI",
    active: true,
    prices: {
      costInTokensPerMillion: 1000,
      costOutTokensPerMillion: 2000,
      currency: "USD"
    },
    maxTokensOut: 2048,
    defaultTemperature: 0.7
  }
});

await newAiModel.save();
```

This example demonstrates how to create and save a new instance of the `PsAiModel` class.