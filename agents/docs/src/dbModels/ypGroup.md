# Group

The `Group` class represents a group within the system, extending the Sequelize `Model` class. It implements the `YpGroupData` interface and includes properties and methods for managing group data.

## Properties

| Name                        | Type                                | Description                                      |
|-----------------------------|-------------------------------------|--------------------------------------------------|
| id                          | number                              | The unique identifier for the group.             |
| name                        | string                              | The name of the group.                           |
| user_id                     | number                              | The ID of the user who created the group.        |
| community_id                | number                              | The ID of the community to which the group belongs. |
| created_at                  | Date                                | The date and time when the group was created.    |
| updated_at                  | Date                                | The date and time when the group was last updated. |
| private_access_configuration| YpGroupPrivateAccessConfiguration[] | Configuration for private access to the group.   |
| configuration               | YpGroupConfiguration                | Configuration settings for the group.            |

## Methods

The `Group` class inherits methods from the Sequelize `Model` class for interacting with the database, such as `create`, `update`, `destroy`, and `find`.

## Example

```typescript
import { Group } from '@policysynth/agents/dbModels/ypGroup.js';

// Example usage of Group model
async function createGroup() {
  const newGroup = await Group.create({
    name: "New Group",
    user_id: 1,
    community_id: 1,
    private_access_configuration: [],
    configuration: {}
  });

  console.log(newGroup);
}

createGroup();
```

## Sequelize Initialization

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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    community_id: {
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
    private_access_configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "groups",
    indexes: [
      {
        fields: ["user_id"],
      },
    ],
    timestamps: true,
    underscored: true,
  }
);
```

This schema defines the structure of the `groups` table in the database, including the data types and constraints for each column. The model also includes an index on the `user_id` field for optimized queries.