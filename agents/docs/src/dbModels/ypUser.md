# User Class

The `User` class represents a user in the system and extends the Sequelize `Model` class. It implements the `YpUserData` interface, which defines the attributes of a user.

## Properties

| Name        | Type   | Description               |
|-------------|--------|---------------------------|
| id          | number | The unique identifier for the user. |
| name        | string | The name of the user.     |
| email       | string | The email address of the user. |
| created_at  | Date   | The date and time when the user was created. |
| updated_at  | Date   | The date and time when the user was last updated. |

## Example

```typescript
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

interface YpUserDataAttributes {
  id: number;
  name: string;
  email: string;
}

interface YpUserDataCreationAttributes
  extends Optional<YpUserData, "id" | "created_at" | "updated_at"> {}

export class User
  extends Model<YpUserData, YpUserDataCreationAttributes>
  implements YpUserData
{
  declare id: number;
  declare name: string;
  declare email: string;

  // timestamps!
  declare created_at: Date;
  declare updated_at: Date;
}

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

This example demonstrates how to define and initialize the `User` class using Sequelize. The class includes properties for the user's ID, name, email, creation date, and last update date. The `init` method is used to configure the model, including setting up the table name, indexes, and other options.