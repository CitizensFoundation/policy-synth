# AgentConnectorClassUsers

Represents the association between users and agent connector classes in the PolicySynth Agents system. This model is used to define which users have access to or are associated with specific agent connector classes.

## Properties

| Name                      | Type   | Description                                                                                 |
|---------------------------|--------|---------------------------------------------------------------------------------------------|
| agent_connector_class_id  | number | The ID of the agent connector class. References the `ps_agent_connector_classes` table.     |
| user_id                   | number | The ID of the user. References the `users` table.                                           |

## Sequelize Model Definition

- **Table Name:** `AgentConnectorClassUsers`
- **Primary Key:** Composite of `agent_connector_class_id` and `user_id`
- **Timestamps:** Disabled (`timestamps: false`)
- **Indexes:** Indexed on both `agent_connector_class_id` and `user_id`
- **Foreign Keys:**
  - `agent_connector_class_id` references `ps_agent_connector_classes(id)` (on delete: CASCADE)
  - `user_id` references `users(id)` (on delete: CASCADE)
- **Naming Convention:** Uses underscored column names

## Example

```typescript
import { AgentConnectorClassUsers } from '@policysynth/agents/dbModels/agentConnectorClassUser.js';

// Creating a new association between a user and an agent connector class
await AgentConnectorClassUsers.create({
  agent_connector_class_id: 5,
  user_id: 42,
});

// Querying associations for a specific user
const userConnectorClasses = await AgentConnectorClassUsers.findAll({
  where: { user_id: 42 }
});

// Removing an association (will cascade on delete)
await AgentConnectorClassUsers.destroy({
  where: {
    agent_connector_class_id: 5,
    user_id: 42
  }
});
```

## Usage Notes

- This model is typically used as a join table in a many-to-many relationship between users and agent connector classes.
- Deleting a user or an agent connector class will automatically remove the corresponding associations due to the `CASCADE` delete rule.
- No timestamps are tracked for this association.

---

**File:** `@policysynth/agents/dbModels/agentConnectorClassUser.js`