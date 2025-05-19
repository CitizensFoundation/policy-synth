# PsAgentClass

Represents an Agent Class in the PolicySynth Agents system. An Agent Class defines the configuration, capabilities, and metadata for a type of agent that can be instantiated and used within the platform. This model is mapped to the `ps_agent_classes` table in the database and supports associations with users (owners, users, admins), agent registries, and instantiated agents.

## Properties

| Name             | Type                                         | Description                                                                                 |
|------------------|----------------------------------------------|---------------------------------------------------------------------------------------------|
| id               | number                                       | Primary key. Auto-incremented integer.                                                      |
| uuid             | string                                       | Universally unique identifier for the agent class.                                          |
| class_base_id    | string                                       | Base UUID for the agent class, used for versioning.                                         |
| user_id          | number                                       | Foreign key referencing the owner (User) of the agent class.                                |
| created_at       | Date                                         | Timestamp when the agent class was created.                                                 |
| updated_at       | Date                                         | Timestamp when the agent class was last updated.                                            |
| name             | string                                       | Name of the agent class.                                                                    |
| version          | number                                       | Version number of the agent class.                                                          |
| configuration    | PsAgentClassAttributesConfiguration          | Configuration object describing the agent class (capabilities, questions, etc.).            |
| available        | boolean                                      | Indicates if the agent class is available for use.                                          |
| Users            | User[] \| undefined                          | Associated users who can use this agent class (many-to-many).                               |
| Admins           | User[] \| undefined                          | Associated admin users for this agent class (many-to-many).                                 |

## Association Methods

| Name            | Parameters                        | Return Type         | Description                                                      |
|-----------------|-----------------------------------|---------------------|------------------------------------------------------------------|
| addUser         | user: User, obj?: any             | Promise<void>       | Add a user to the agent class.                                   |
| addUsers        | users: User[]                     | Promise<void>       | Add multiple users to the agent class.                           |
| getUsers        |                                   | Promise<User[]>     | Get all users associated with the agent class.                   |
| setUsers        | users: User[]                     | Promise<void>       | Set the users for the agent class.                               |
| removeUser      | user: User                        | Promise<void>       | Remove a user from the agent class.                              |
| removeUsers     | users: User[]                     | Promise<void>       | Remove multiple users from the agent class.                      |
| hasUser         | user: User                        | Promise<boolean>    | Check if a user is associated with the agent class.              |
| addAdmin        | user: User, obj?: any             | Promise<void>       | Add an admin user to the agent class.                            |
| addAdmins       | users: User[]                     | Promise<void>       | Add multiple admin users to the agent class.                     |
| getAdmins       |                                   | Promise<User[]>     | Get all admin users associated with the agent class.             |
| setAdmins       | users: User[]                     | Promise<void>       | Set the admin users for the agent class.                         |
| removeAdmin     | user: User                        | Promise<void>       | Remove an admin user from the agent class.                       |
| removeAdmins    | users: User[]                     | Promise<void>       | Remove multiple admin users from the agent class.                |
| hasAdmin        | user: User                        | Promise<boolean>    | Check if a user is an admin for the agent class.                 |

## Sequelize Model Options

- **Table Name:** `ps_agent_classes`
- **Indexes:**  
  - Unique index on `uuid`
  - Index on `class_base_id`
  - Index on `class_base_id, version`
  - Index on `user_id`
- **Timestamps:** true (uses `created_at` and `updated_at`)
- **Underscored:** true (snake_case column names)

## Associations

- **Owner:** `belongsTo(User, as: "Owner")`  
  The user who owns the agent class.
- **Users:** `belongsToMany(User, through: AgentClassUsers, as: "Users")`  
  Users who can use this agent class.
- **Admins:** `belongsToMany(User, through: AgentClassAdmins, as: "Admins")`  
  Admin users for this agent class.
- **Registry:** `belongsToMany(PsAgentRegistry, through: AgentRegistryAgents, as: "Registry")`  
  Registries that include this agent class.
- **Agents:** `hasMany(PsAgent, as: "Agents")`  
  Instantiated agents of this class.

## Example

```typescript
import { PsAgentClass } from '@policysynth/agents/dbModels/agentClass.js';
import { User } from '@policysynth/agents/dbModels/ypUser.js';

// Creating a new agent class
const agentClass = await PsAgentClass.create({
  name: "Smarter Crowdsourcing Agent",
  user_id: 1,
  version: 1,
  configuration: {
    description: "An agent for running the Smarter Crowdsourcing process",
    imageUrl: "https://aoi-storage-production.citizens.is/ypGenAi/community/1/6d4368ce-ecaf-41ab-abb3-65ceadbdb2a6.png",
    iconName: "smarter_crowdsourcing",
    capabilities: ["research", "analysis"],
    questions: [
      {
        uniqueId: "name",
        text: "Name",
        type: "textField",
        maxLength: 200,
        required: false
      }
      // ... more questions
    ],
    supportedConnectors: []
  },
  available: true
});

// Adding a user to the agent class
const user = await User.findByPk(2);
await agentClass.addUser(user);

// Checking if a user is an admin
const isAdmin = await agentClass.hasAdmin(user);
```

---

**File:** `@policysynth/agents/dbModels/agentClass.js`