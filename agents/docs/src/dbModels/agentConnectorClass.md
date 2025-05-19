# PsAgentConnectorClass

Represents a connector class for PolicySynth agents, defining the metadata, configuration, and associations for a type of agent connector. This class is used to manage reusable connector definitions, including their configuration, versioning, and user/admin access.

**File:** `@policysynth/agents/dbModels/agentConnectorClass.js`

## Properties

| Name             | Type                                | Description                                                                                 |
|------------------|-------------------------------------|---------------------------------------------------------------------------------------------|
| id               | number                              | Primary key. Auto-incremented integer ID.                                                   |
| uuid             | string                              | Universally unique identifier for the connector class instance.                             |
| class_base_id    | string                              | UUID representing the base class identity (for versioning and grouping).                    |
| user_id          | number                              | ID of the user who created/owns this connector class.                                       |
| created_at       | Date                                | Timestamp when the connector class was created.                                             |
| updated_at       | Date                                | Timestamp when the connector class was last updated.                                        |
| name             | string                              | Name of the connector class.                                                                |
| version          | number                              | Version number of the connector class (for versioning/upgrades).                            |
| configuration    | PsAgentConnectorConfiguration       | JSON configuration object describing the connector (see below for structure).               |
| available        | boolean                             | Indicates if the connector class is available for use.                                      |
| Users            | User[] (optional)                   | Users with access to this connector class (many-to-many association).                       |
| Admins           | User[] (optional)                   | Admin users for this connector class (many-to-many association).                            |

### Association Methods

| Name           | Parameters                | Return Type         | Description                                                      |
|----------------|--------------------------|---------------------|------------------------------------------------------------------|
| addUser        | user: User, obj?: any     | Promise<void>       | Add a user to the connector class.                               |
| addUsers       | users: User[]             | Promise<void>       | Add multiple users.                                              |
| getUsers       |                          | Promise<User[]>     | Get all users associated.                                        |
| setUsers       | users: User[]             | Promise<void>       | Set the users (replace all).                                     |
| removeUser     | user: User                | Promise<void>       | Remove a user.                                                   |
| removeUsers    | users: User[]             | Promise<void>       | Remove multiple users.                                           |
| hasUser        | user: User                | Promise<boolean>    | Check if a user is associated.                                   |
| addAdmin       | user: User, obj?: any     | Promise<void>       | Add an admin user.                                               |
| addAdmins      | users: User[]             | Promise<void>       | Add multiple admin users.                                        |
| getAdmins      |                          | Promise<User[]>     | Get all admin users.                                             |
| setAdmins      | users: User[]             | Promise<void>       | Set the admin users (replace all).                               |
| removeAdmin    | user: User                | Promise<void>       | Remove an admin user.                                            |
| removeAdmins   | users: User[]             | Promise<void>       | Remove multiple admin users.                                     |
| hasAdmin       | user: User                | Promise<boolean>    | Check if a user is an admin.                                     |

## Sequelize Model Options

- **Table Name:** `ps_agent_connector_classes`
- **Timestamps:** true (uses `created_at` and `updated_at`)
- **Indexes:** On `uuid` (unique), `class_base_id`, `class_base_id+version`, `user_id`, `name`, `version`
- **Associations:**
  - Belongs to `User` as `Owner`
  - Many-to-many with `User` as `Users` (via `AgentConnectorClassUsers`)
  - Many-to-many with `User` as `Admins` (via `AgentConnectorClassAdmins`)
  - Many-to-many with `PsAgentRegistry` as `Registry` (via `AgentRegistryConnectors`)
  - Has many `PsAgentConnector` as `Connectors`

## PsAgentConnectorConfiguration Structure

The `configuration` property is a JSON object with the following structure:

| Name         | Type                       | Description                                                      |
|--------------|----------------------------|------------------------------------------------------------------|
| name         | string                     | Name of the connector.                                           |
| classType    | string                     | Type of the connector class.                                     |
| description  | string                     | Description of the connector.                                    |
| imageUrl     | string                     | URL to an image representing the connector.                      |
| iconName     | string                     | Icon name for UI display.                                        |
| questions    | YpStructuredQuestionData[] | Array of structured questions for configuration.                 |
| hasPublicAccess | boolean                 | Whether the connector is public.                                 |

## Example

```typescript
import { PsAgentConnectorClass } from '@policysynth/agents/dbModels/agentConnectorClass.js';
import { User } from '@policysynth/agents/dbModels/ypUser.js';

// Creating a new connector class
const connectorClass = await PsAgentConnectorClass.create({
  name: "Google Docs Connector",
  user_id: 1,
  version: 1,
  configuration: {
    name: "Google Docs",
    classType: "googleDocs",
    description: "Connector for Google Docs",
    imageUrl: "https://example.com/image.png",
    iconName: "docs",
    questions: [
      {
        uniqueId: "googleDocsId",
        text: "Document ID",
        type: "textField",
        maxLength: 200,
        required: false
      }
    ],
    hasPublicAccess: true
  },
  available: true
});

// Adding a user to the connector class
const user = await User.findByPk(2);
await connectorClass.addUser(user);

// Getting all admin users
const admins = await connectorClass.getAdmins();
```

## Notes

- The class supports versioning via `class_base_id` and `version`.
- Associations allow for flexible user/admin management and registry inclusion.
- The `configuration` field is extensible and supports structured questions for UI-driven configuration.
- All timestamps are managed by Sequelize.
