# PsExternalApi

The `PsExternalApi` class represents an external API configuration in the system. It extends the Sequelize `Model` class and implements the `PsExternalApiAttributes` interface.

## Properties

| Name            | Type                  | Description                                      |
|-----------------|-----------------------|--------------------------------------------------|
| id              | number                | The unique identifier for the external API.      |
| uuid            | string                | The UUID for the external API.                   |
| user_id         | number                | The ID of the user who created the external API. |
| created_at      | Date                  | The date and time when the external API was created. |
| updated_at      | Date                  | The date and time when the external API was last updated. |
| organization_id | number                | The ID of the organization associated with the external API. |
| type            | string                | The type of the external API.                    |
| priceAdapter    | PsBaseApiPriceAdapter | The pricing adapter configuration for the external API. |

## Initialization

The `PsExternalApi` model is initialized with the following schema:

```typescript
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
```

## Example

```typescript
import { PsExternalApi } from '@policysynth/agents/dbModels/externalApis.js';

// Example usage of PsExternalApi
const newApi = await PsExternalApi.create({
  user_id: 1,
  organization_id: 1,
  type: 'exampleType',
  priceAdapter: {
    unitType: 'request',
    pricePerUnit: 0.01,
    currency: 'USD',
  },
});

console.log(newApi.id); // Outputs the ID of the newly created external API
```

This example demonstrates how to create a new instance of the `PsExternalApi` model and save it to the database.