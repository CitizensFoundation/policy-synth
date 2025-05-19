# AgentClassUsers

Represents the many-to-many relationship between agent classes and users in the PolicySynth Agents system. This model links users to agent classes, indicating which users have access to or are associated with which agent classes.

**File:** `@policysynth/agents/dbModels/agentClassUser.js`

## Properties

| Name            | Type   | Description                                                                                 |
|-----------------|--------|---------------------------------------------------------------------------------------------|
| agent_class_id  | number | The ID of the agent class. References the `ps_agent_classes` table. Part of the primary key.|
| user_id         | number | The ID of the user. References the `users` table. Part of the primary key.                  |

## Sequelize Model Definition

- **Table Name:** `AgentClassUsers`
- **Primary Key:** Composite of `agent_class_id` and `user_id`
- **Timestamps:** Disabled (`timestamps: false`)
- **Indexes:** Indexes on both `agent_class_id` and `user_id`
- **Foreign Keys:**
  - `agent_class_id` references `ps_agent_classes(id)` (on delete: CASCADE)
  - `user_id` references `users(id)` (on delete: CASCADE)
- **Naming Convention:** Uses underscored column names

## Example

```typescript
import { AgentClassUsers } from '@policysynth/agents/dbModels/agentClassUser.js';

// Associate a user with an agent class
await AgentClassUsers.create({
  agent_class_id: 42,
  user_id: 7,
});

// Query all users for a given agent class
const usersForAgentClass = await AgentClassUsers.findAll({
  where: { agent_class_id: 42 }
});

// Query all agent classes for a given user
const agentClassesForUser = await AgentClassUsers.findAll({
  where: { user_id: 7 }
});
```

## Usage Notes

- This model is typically used as a join table in Sequelize associations (e.g., `belongsToMany`).
- Both `agent_class_id` and `user_id` are required and together form a composite primary key.
- Deleting an agent class or user will automatically remove the corresponding associations due to `onDelete: "CASCADE"`.

---

**See also:**  
- [PsAgentClassAttributes](#) (for agent class details)  
- [YpUserData](#) (for user details)