# AgentRegistryManager

The `AgentRegistryManager` class provides methods to retrieve the latest active agent and connector classes available to a specific user. It extends the `PolicySynthAgentBase` and interacts with the database models for agent registries, agent classes, connector classes, and users.

## Properties

| Name   | Type                  | Description                                 |
|--------|-----------------------|---------------------------------------------|
| logger | any (inherited)       | Logger instance for logging (from base).    |

## Methods

| Name                      | Parameters                | Return Type                                         | Description                                                                                                    |
|---------------------------|---------------------------|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| getActiveAgentClasses     | userId: number            | Promise<PsAgentClassAttributes[]>                   | Retrieves the latest version of all active agent classes accessible to the given user.                         |
| getActiveConnectorClasses | userId: number            | Promise<PsAgentConnectorClassAttributes[]>          | Retrieves the latest version of all active connector classes accessible to the given user.                     |

---

### Method Details

#### getActiveAgentClasses

**Signature:**
```typescript
async getActiveAgentClasses(userId: number): Promise<PsAgentClassAttributes[]>
```

**Description:**
Fetches all active agent classes that are either public or accessible to the specified user (as a user or admin). Only the latest version for each unique `class_base_id` is returned.

**Parameters:**
- `userId` (`number`): The ID of the user for whom to fetch accessible agent classes.

**Returns:**
- `Promise<PsAgentClassAttributes[]>`: An array of the latest active agent class attributes accessible to the user.

**Behavior:**
- Queries the `PsAgentClass` table for available agent classes.
- Includes agent classes that are public or where the user is listed as a user or admin.
- Returns only the latest version for each unique agent class.

---

#### getActiveConnectorClasses

**Signature:**
```typescript
async getActiveConnectorClasses(userId: number): Promise<PsAgentConnectorClassAttributes[]>
```

**Description:**
Fetches all active connector classes that are either public or accessible to the specified user (as a user or admin). Only the latest version for each unique `class_base_id` is returned.

**Parameters:**
- `userId` (`number`): The ID of the user for whom to fetch accessible connector classes.

**Returns:**
- `Promise<PsAgentConnectorClassAttributes[]>`: An array of the latest active connector class attributes accessible to the user.

**Behavior:**
- Queries the `PsAgentConnectorClass` table for available connector classes.
- Includes connector classes that are public or where the user is listed as a user or admin.
- Returns only the latest version for each unique connector class.

---

## Example

```typescript
import { AgentRegistryManager } from '@policysynth/agents/operations/agentRegistryManager.js';

const registryManager = new AgentRegistryManager();

// Example: Fetch active agent classes for a user
const userId = 42;
const activeAgentClasses = await registryManager.getActiveAgentClasses(userId);
console.log('Active agent classes:', activeAgentClasses);

// Example: Fetch active connector classes for a user
const activeConnectorClasses = await registryManager.getActiveConnectorClasses(userId);
console.log('Active connector classes:', activeConnectorClasses);
```

---

**Note:**  
- The returned agent and connector classes are filtered to only include the latest version for each unique class.
- Access is determined by public availability or user/admin association.
- The methods rely on Sequelize ORM and expect the relevant models and associations to be properly defined.