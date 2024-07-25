# Group

The `Group` class represents an organization within the system. It extends the Sequelize `Model` class and implements the `YpOrganizationsData` interface.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| id            | number | The unique identifier for the organization. |
| name          | string | The name of the organization. |
| type          | string | The type of the organization. |
| user_id       | number | The ID of the user associated with the organization. |
| created_at    | Date   | The date and time when the organization was created. |
| updated_at    | Date   | The date and time when the organization was last updated. |
| configuration | any    | The configuration settings for the organization. |

## Initialization

The `Group` model is initialized with the following schema:

```typescript
Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
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
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "organizations",
    indexes: [
      {
        fields: ["name"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);
```

## Example

```typescript
import { Group } from '@policysynth/agents/dbModels/ypOrganization.js';

// Example usage of Group model
const newGroup = await Group.create({
  name: "Example Organization",
  type: "Non-Profit",
  user_id: 1,
  configuration: {
    theme: "default",
    settings: {
      allowComments: true,
    },
  },
});

console.log(newGroup.id); // Outputs the ID of the newly created organization
```

This example demonstrates how to create a new organization using the `Group` model and log its ID.