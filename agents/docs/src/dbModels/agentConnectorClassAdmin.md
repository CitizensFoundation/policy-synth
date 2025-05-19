# AgentConnectorClassAdmins

Represents the mapping between users and agent connector classes for admin permissions. This model is used to specify which users are administrators of specific agent connector classes.

**File:** `@policysynth/agents/dbModels/agentConnectorClassAdmin.js`

## Properties

| Name                      | Type   | Description                                                                                  |
|---------------------------|--------|----------------------------------------------------------------------------------------------|
| agent_connector_class_id  | number | The ID of the agent connector class. References `ps_agent_connector_classes.id`.             |
| user_id                   | number | The ID of the user who is an admin for the connector class. References `users.id`.           |

## Table Structure

- **Table Name:** `AgentConnectorClassAdmins`
- **Primary Key:** Composite of `agent_connector_class_id` and `user_id`
- **Foreign Keys:**
  - `agent_connector_class_id` → `ps_agent_connector_classes.id` (on delete: CASCADE)
  - `user_id` → `users.id` (on delete: CASCADE)
- **Indexes:** 
  - On `agent_connector_class_id`
  - On `user_id`
- **Timestamps:** Disabled (`timestamps: false`)
- **Naming Convention:** Underscored column names (`underscored: true`)

## Example

```typescript
import { AgentConnectorClassAdmins } from '@policysynth/agents/dbModels/agentConnectorClassAdmin.js';

// Assign user 42 as an admin for agent connector class 7
await AgentConnectorClassAdmins.create({
  agent_connector_class_id: 7,
  user_id: 42,
});

// Query all admins for a specific connector class
const admins = await AgentConnectorClassAdmins.findAll({
  where: { agent_connector_class_id: 7 }
});

// Remove admin rights for a user
await AgentConnectorClassAdmins.destroy({
  where: {
    agent_connector_class_id: 7,
    user_id: 42
  }
});
```

## Usage Notes

- This model is typically used in access control logic to determine which users have administrative privileges over agent connector classes.
- Deleting a user or an agent connector class will automatically remove the corresponding admin mappings due to the `CASCADE` delete policy.
- There are no timestamp fields in this table.

---

**See also:**  
- [PsAgentConnectorClassAttributes](#) (for the agent connector class definition)  
- [User](#) (for the user model)