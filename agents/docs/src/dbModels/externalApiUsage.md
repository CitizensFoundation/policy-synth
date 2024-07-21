# PsExternalApiUsage

The `PsExternalApiUsage` class represents the usage of external APIs by agents or connectors in the system. It extends the Sequelize `Model` class and implements the `PsExternalApiUsageAttributes` interface.

## Properties

| Name           | Type     | Description                                      |
|----------------|----------|--------------------------------------------------|
| id             | number   | Primary key, auto-incremented.                   |
| user_id        | number   | ID of the user associated with the API usage.    |
| created_at     | Date     | Timestamp when the record was created.           |
| updated_at     | Date     | Timestamp when the record was last updated.      |
| external_api_id| number   | ID of the external API being used.               |
| call_count     | number   | Number of times the external API was called.     |
| agent_id       | number   | ID of the agent using the external API. Nullable.|
| connector_id   | number   | ID of the connector using the external API. Nullable.|

## Associations

| Name      | Type                    | Description                                      |
|-----------|-------------------------|--------------------------------------------------|
| Agent     | PsAgentAttributes       | Association to the `PsAgent` model.              |
| Connector | PsAgentConnectorAttributes | Association to the `PsAgentConnector` model. |

## Initialization

The `PsExternalApiUsage` model is initialized with the following schema:

```typescript
PsExternalApiUsage.init(
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
    external_api_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    call_count: {
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
    tableName: "ps_external_api_usage",
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["external_api_id"],
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

## Associations

The `PsExternalApiUsage` model has the following associations:

```typescript
(PsExternalApiUsage as any).associate = (models: any) => {
  PsExternalApiUsage.belongsTo(models.PsAgent, {
    foreignKey: 'agent_id',
    as: 'Agent',
  });
  PsExternalApiUsage.belongsTo(models.PsAgentConnector, {
    foreignKey: 'connector_id',
    as: 'Connector',
  });
};
```

## Example

```typescript
import { PsExternalApiUsage } from '@policysynth/agents/dbModels/externalApiUsage.js';

// Example usage of PsExternalApiUsage
const apiUsage = await PsExternalApiUsage.create({
  user_id: 1,
  external_api_id: 2,
  call_count: 5,
  agent_id: 3,
  connector_id: 4,
});

console.log(apiUsage);
```

This example demonstrates how to create a new record in the `ps_external_api_usage` table using the `PsExternalApiUsage` model.