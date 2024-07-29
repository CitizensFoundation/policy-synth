# PsAgentClass

The `PsAgentClass` class represents an agent class in the system. It extends the Sequelize `Model` and implements the `PsAgentClassAttributes` interface. This class includes properties and methods for managing agent classes, including associations with users and registries.

## Properties

| Name            | Type                                      | Description                                      |
|-----------------|-------------------------------------------|--------------------------------------------------|
| id              | number                                    | The unique identifier for the agent class.       |
| uuid            | string                                    | The UUID for the agent class.                    |
| class_base_id   | string                                    | The base UUID for the agent class.               |
| user_id         | number                                    | The ID of the user who created the agent class.  |
| created_at      | Date                                      | The date when the agent class was created.       |
| updated_at      | Date                                      | The date when the agent class was last updated.  |
| name            | string                                    | The name of the agent class.                     |
| version         | number                                    | The version of the agent class.                  |
| configuration   | PsAgentClassAttributesConfiguration       | The configuration of the agent class.            |
| available       | boolean                                   | Indicates if the agent class is available.       |
| Users           | User[]                                    | The users associated with the agent class.       |
| Admins          | User[]                                    | The admins associated with the agent class.      |

## Methods

### Association Methods

| Name         | Parameters                | Return Type | Description                                      |
|--------------|---------------------------|-------------|--------------------------------------------------|
| addUser      | user: User, obj?: any     | Promise<void> | Adds a user to the agent class.                  |
| addUsers     | users: User[]             | Promise<void> | Adds multiple users to the agent class.          |
| getUsers     |                           | Promise<User[]> | Retrieves the users associated with the agent class. |
| setUsers     | users: User[]             | Promise<void> | Sets the users for the agent class.              |
| removeUser   | user: User                | Promise<void> | Removes a user from the agent class.             |
| removeUsers  | users: User[]             | Promise<void> | Removes multiple users from the agent class.     |
| hasUser      | user: User                | Promise<boolean> | Checks if a user is associated with the agent class. |
| hasAdmin     | user: User                | Promise<boolean> | Checks if a user is an admin of the agent class. |
| addAdmin     | user: User, obj?: any     | Promise<void> | Adds an admin to the agent class.                |
| addAdmins    | users: User[]             | Promise<void> | Adds multiple admins to the agent class.         |
| getAdmins    |                           | Promise<User[]> | Retrieves the admins associated with the agent class. |
| setAdmins    | users: User[]             | Promise<void> | Sets the admins for the agent class.             |
| removeAdmin  | user: User                | Promise<void> | Removes an admin from the agent class.           |
| removeAdmins | users: User[]             | Promise<void> | Removes multiple admins from the agent class.    |

## Example

```typescript
import { PsAgentClass } from '@policysynth/agents/dbModels/agentClass.js';
import { User } from './ypUser.js';

// Example usage of PsAgentClass
async function exampleUsage() {
  const agentClass = await PsAgentClass.create({
    name: 'Example Agent Class',
    user_id: 1,
    version: 1,
    configuration: {
      category: 'exampleCategory',
      subCategory: 'exampleSubCategory',
      description: 'This is an example agent class.',
      queueName: 'exampleQueue',
      imageUrl: 'https://example.com/image.png',
      iconName: 'exampleIcon',
      capabilities: ['exampleCapability'],
      questions: [],
      supportedConnectors: [],
      hasPublicAccess: true,
    },
    available: true,
  });

  const user = await User.findByPk(1);
  if (user) {
    await agentClass.addUser(user);
    const users = await agentClass.getUsers();
    console.log(users);
  }
}

exampleUsage();
```

This example demonstrates how to create an instance of `PsAgentClass`, associate a user with it, and retrieve the associated users.