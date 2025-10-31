# addUserToAgentClasses Utility

This script provides a command-line utility to add a user to all agent classes with a given `class_base_id` as either a regular user or an admin. It is intended for administrative or setup tasks in the PolicySynth Agents system.

**File:** `@policysynth/agents/tools/addUserToAgentClass.js`

---

## Function

### addUserToAgentClasses

Adds a user to all agent classes matching a given `class_base_id`, with the specified role (`user` or `admin`).

#### Parameters

| Name              | Type                | Description                                                                 |
|-------------------|---------------------|-----------------------------------------------------------------------------|
| agentClassBaseId  | `string`            | The `class_base_id` to match agent classes.                                 |
| userId            | `number`            | The ID of the user to add.                                                  |
| role              | `"user" \| "admin"` | The role to assign to the user in the agent class (`user` or `admin`).      |

#### Behavior

- Initializes database models.
- Finds all agent classes with the given `class_base_id`.
- Looks up the user by `userId`.
- For each matching agent class:
  - Checks if the user already has the specified role.
  - If not, adds the user as either a user or admin.
  - Logs the action.
- Handles errors and closes the database connection.

#### Returns

- No explicit return value. Logs actions and errors to the console.

---

## Command-Line Usage

This script is intended to be run from the command line using `ts-node` or similar tools.

### Arguments

1. `agentClassBaseId` (string): The base ID of the agent class.
2. `userId` (number): The user ID to add.
3. `role` (`user` or `admin`): The role to assign.

### Example

```bash
ts-node addUserToAgentClasses.ts smarter_crowdsourcing 42 admin
```

---

## Example Usage in Code

```typescript
import { addUserToAgentClasses } from '@policysynth/agents/tools/addUserToAgentClass.js';

// Add user 42 as an admin to all agent classes with base ID 'smarter_crowdsourcing'
await addUserToAgentClasses('smarter_crowdsourcing', 42, 'admin');
```

---

## Implementation Details

- **Database Models:** Uses Sequelize models for `PsAgentClass` and `User`.
- **Role Assignment:** Uses `addUser` and `addAdmin` methods on agent class instances.
- **Logging:** Uses `PolicySynthAgentBase.logger` for info and error messages.
- **Error Handling:** Catches and logs errors, ensures the database connection is closed.
- **CLI Argument Parsing:** Validates arguments and role, provides usage instructions if invalid.

---

## Related Types

- **PsAgentClass**: Represents an agent class in the system.
- **User**: Represents a user in the system.
- **PolicySynthAgentBase**: Provides logging utilities.

---

## Full Example

```typescript
import { addUserToAgentClasses } from '@policysynth/agents/tools/addUserToAgentClass.js';

// Add user 101 as a regular user to all agent classes with base ID 'root_causes'
await addUserToAgentClasses('root_causes', 101, 'user');
```

---

## Notes

- This script is typically used for administrative setup or migration tasks.
- Ensure you have the correct permissions and environment variables set for database access.
- The script will exit with an error if arguments are missing or invalid.

---

## Error Handling

- Logs and exits if:
  - No agent classes are found for the given `class_base_id`.
  - The user is not found.
  - The role is not `"user"` or `"admin"`.
  - Any other error occurs during execution.

---

## See Also

- [PsAgentClass](../dbModels/agentClass.js)
- [User](../dbModels/ypUser.js)
- [PolicySynthAgentBase](../base/agentBase.js)
