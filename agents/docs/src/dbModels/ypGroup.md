# Group

The `Group` class represents a group entity in the database. It extends the Sequelize `Model` class and implements the `YpGroupData` interface.

## Properties

| Name                        | Type                                | Description                                      |
|-----------------------------|-------------------------------------|--------------------------------------------------|
| id                          | number                              | The unique identifier for the group.             |
| name                        | string                              | The name of the group.                           |
| user_id                     | number                              | The ID of the user who created the group.        |
| created_at                  | Date                                | The date and time when the group was created.    |
| updated_at                  | Date                                | The date and time when the group was last updated.|
| private_access_configuration| YpGroupPrivateAccessConfiguration[]| The private access configuration for the group.  |
| configuration               | YpGroupConfiguration                | The configuration settings for the group.        |

## Methods

The `Group` class inherits methods from the Sequelize `Model` class. These methods include, but are not limited to:

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| init       | attributes: object, options: object | void        | Initializes the model with attributes and options. |
| findAll    | options?: object  | Promise<Array<Group>> | Finds all instances that match the options. |
| findOne    | options?: object  | Promise<Group \| null> | Finds one instance that matches the options. |
| create     | values: object, options?: object | Promise<Group> | Creates a new instance with the given values. |
| update     | values: object, options?: object | Promise<[number, Group[]]> | Updates instances that match the options. |
| destroy    | options?: object  | Promise<number> | Deletes instances that match the options. |

## Example

```typescript
import { Group } from '@policysynth/agents/dbModels/ypGroup.js';

// Example usage of Group model
async function createGroup() {
  const newGroup = await Group.create({
    name: "New Group",
    user_id: 1,
    configuration: {
      theme: {
        primaryColor: "#0000FF",
      },
      hideAllTabs: true,
    },
    private_access_configuration: [
      {
        apiKey: "exampleApiKey",
      },
    ],
  });

  console.log("Group created:", newGroup);
}

createGroup();
```

This example demonstrates how to create a new group using the `Group` model. The `create` method is used to insert a new record into the database with the specified attributes.