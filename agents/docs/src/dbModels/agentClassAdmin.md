# AgentClassAdmins

Represents the mapping between agent classes and their administrators in the PolicySynth Agents system. This model is used to define which users have administrative rights over specific agent classes.

**File:** `@policysynth/agents/dbModels/agentClassAdmin.js`

## Properties

| Name            | Type   | Description                                                                                 |
|-----------------|--------|---------------------------------------------------------------------------------------------|
| agent_class_id  | number | The unique identifier of the agent class. References the `id` field in the `ps_agent_classes` table. |
| user_id         | number | The unique identifier of the user. References the `id` field in the `users` table.                |

## Table Structure

- **Table Name:** `AgentClassAdmins`
- **Primary Key:** Composite of `agent_class_id` and `user_id`
- **Foreign Keys:**
  - `agent_class_id` → `ps_agent_classes.id` (on delete: CASCADE)
  - `user_id` → `users.id` (on delete: CASCADE)
- **Indexes:** 
  - `agent_class_id`
  - `user_id`
- **Timestamps:** Disabled (`timestamps: false`)
- **Naming Convention:** Underscored (`underscored: true`)

## Example

```typescript
import { AgentClassAdmins } from '@policysynth/agents/dbModels/agentClassAdmin.js';

// Assign user 42 as an admin for agent class 7
await AgentClassAdmins.create({
  agent_class_id: 7,
  user_id: 42,
});

// Find all admins for a given agent class
const admins = await AgentClassAdmins.findAll({
  where: { agent_class_id: 7 }
});

// Remove admin rights for a user from an agent class
await AgentClassAdmins.destroy({
  where: { agent_class_id: 7, user_id: 42 }
});
```

## Usage Notes

- This model is typically used to check or assign administrative privileges for agent classes.
- Deleting an agent class or user will automatically remove the corresponding admin mappings due to the `CASCADE` delete rule.
- There are no timestamp fields in this table.
- The combination of `agent_class_id` and `user_id` must be unique.