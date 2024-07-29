# PsAgentConnectorClass

The `PsAgentConnectorClass` class represents the agent connector class model in the database. It extends the Sequelize `Model` class and implements the `PsAgentConnectorClassAttributes` interface.

## Properties

| Name           | Type                             | Description                                      |
|----------------|----------------------------------|--------------------------------------------------|
| id             | number                           | Primary key, auto-incremented.                   |
| uuid           | string                           | Unique identifier for the agent connector class. |
| user_id        | number                           | ID of the user who created the agent connector class. |
| class_base_id  | string                           | Base ID for the class.                           |
| created_at     | Date                             | Timestamp when the record was created.           |
| updated_at     | Date                             | Timestamp when the record was last updated.      |
| name           | string                           | Name of the agent connector class.               |
| version        | number                           | Version of the agent connector class.            |
| available      | boolean                          | Availability status of the agent connector class.|
| configuration  | PsAgentConnectorConfiguration    | Configuration details of the agent connector class. |

## Methods

### Association Methods

| Name         | Parameters                | Return Type | Description                                      |
|--------------|---------------------------|-------------|--------------------------------------------------|
| addUser      | user: User, obj?: any     | Promise<void> | Adds a user to the agent connector class.        |
| addUsers     | users: User[]             | Promise<void> | Adds multiple users to the agent connector class.|
| getUsers     |                           | Promise<User[]> | Retrieves users associated with the agent connector class. |
| setUsers     | users: User[]             | Promise<void> | Sets users for the agent connector class.        |
| removeUser   | user: User                | Promise<void> | Removes a user from the agent connector class.   |
| removeUsers  | users: User[]             | Promise<void> | Removes multiple users from the agent connector class. |
| addAdmin     | user: User, obj?: any     | Promise<void> | Adds an admin to the agent connector class.      |
| addAdmins    | users: User[]             | Promise<void> | Adds multiple admins to the agent connector class. |
| getAdmins    |                           | Promise<User[]> | Retrieves admins associated with the agent connector class. |
| setAdmins    | users: User[]             | Promise<void> | Sets admins for the agent connector class.       |
| removeAdmin  | user: User                | Promise<void> | Removes an admin from the agent connector class. |
| removeAdmins | users: User[]             | Promise<void> | Removes multiple admins from the agent connector class. |

## Example

```typescript
import { PsAgentConnectorClass } from '@policysynth/agents/dbModels/agentConnectorClass.js';
import { User } from './ypUser.js';

// Example usage of PsAgentConnectorClass
async function exampleUsage() {
  // Create a new agent connector class
  const newConnectorClass = await PsAgentConnectorClass.create({
    name: 'Example Connector',
    user_id: 1,
    class_base_id: 'example-base-id',
    version: 1,
    available: true,
    configuration: {
      name: 'Example Connector',
      classType: 'exampleType',
      description: 'This is an example connector class.',
      imageUrl: 'https://example.com/image.png',
      iconName: 'exampleIcon',
      questions: [],
      hasPublicAccess: true,
    },
  });

  // Add a user to the connector class
  const user = await User.findByPk(1);
  if (user) {
    await newConnectorClass.addUser(user);
  }

  // Retrieve users associated with the connector class
  const users = await newConnectorClass.getUsers();
  console.log(users);
}

exampleUsage();
```

## Associations

The `PsAgentConnectorClass` model has the following associations:

- **Belongs to** `User` as `Owner`
- **Belongs to many** `User` as `Users` through `AgentConnectorClassUsers`
- **Belongs to many** `User` as `Admins` through `AgentConnectorClassAdmins`
- **Belongs to many** `PsAgentRegistry` as `Registry` through `AgentRegistryConnectors`
- **Has many** `PsAgentConnector` as `Connectors`

These associations allow the `PsAgentConnectorClass` to be linked with users, admins, agent registries, and agent connectors.