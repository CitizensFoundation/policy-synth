# User

The `User` class represents a user in the system. It includes properties such as `id`, `name`, `email`, `created_at`, and `updated_at`. This class is implemented using Sequelize, an ORM for Node.js.

## Properties

| Name        | Type   | Description               |
|-------------|--------|---------------------------|
| id          | number | The unique identifier for the user. |
| name        | string | The name of the user.     |
| email       | string | The email address of the user. |
| created_at  | Date   | The date and time when the user was created. |
| updated_at  | Date   | The date and time when the user was last updated. |

## Methods

### init

Initializes the `User` model with its attributes and options.

```typescript
User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
  },
  {
    sequelize,
    tableName: "users",
    indexes: [
      {
        fields: ["email"],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);
```

### associate

Defines the associations for the `User` model. A user can belong to many `PsAgentClass` models through the `AgentClassUsers` and `AgentClassAdmins` join tables.

```typescript
(User as any).associate = (models: any) => {
  User.belongsToMany(models.PsAgentClass, {
    through: "AgentClassUsers",
    foreignKey: "user_id",
    otherKey: "agent_class_id",
    as: "AgentClassesAsUser",
  });

  User.belongsToMany(models.PsAgentClass, {
    through: "AgentClassAdmins",
    foreignKey: "user_id",
    otherKey: "agent_class_id",
    as: "AgentClassesAsAdmin",
  });
};
```

## Example

```typescript
import { User } from '@policysynth/agents/dbModels/ypUser.js';

// Example usage of User model
const newUser = User.build({
  name: "John Doe",
  email: "john.doe@example.com",
});

await newUser.save();
console.log("User created:", newUser);
```

This example demonstrates how to create a new user instance and save it to the database using the `User` model.