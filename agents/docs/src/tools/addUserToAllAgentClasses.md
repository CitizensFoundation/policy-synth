# addUserToAllAgentClasses

A utility script to add a user (by email) as both a user and an admin to all agent classes in the PolicySynth system. This is typically used for administrative or onboarding purposes.

**File:** `@policysynth/agents/tools/addUserToAllAgentClasses.js`

---

## Description

This script connects to the database, finds all agent classes, and ensures that the specified user (by email) is added as both a user and an admin to each agent class. It logs the actions taken and handles errors gracefully. The script is intended to be run from the command line.

---

## Usage

```bash
ts-node addUserToAllAgentClasses.ts <userEmail>
```

- `<userEmail>`: The email address of the user to be added to all agent classes.

---

## Function

### addUserToAllAgentClasses

Adds a user to all agent classes as both a user and an admin.

#### Parameters

| Name      | Type     | Description                                 |
|-----------|----------|---------------------------------------------|
| userEmail | string   | The email address of the user to be added.  |

#### Returns

| Type      | Description                |
|-----------|---------------------------|
| Promise<void> | Resolves when complete. |

#### Behavior

- Initializes all database models.
- Retrieves all agent classes from the database.
- Finds the user by the provided email.
- For each agent class:
  - Adds the user as a user if not already present.
  - Adds the user as an admin if not already present.
  - Logs each action.
- Handles and logs errors.
- Closes the database connection at the end.

---

## Example

```typescript
// Run from the command line:
ts-node addUserToAllAgentClasses.ts alice@example.com

// Output (example):
// User alice@example.com added as user to agent class 1
// User alice@example.com added as admin to agent class 1
// User alice@example.com already has user access to agent class 2
// User alice@example.com already has admin access to agent class 2
```

---

## Implementation Details

- **Database Models Used:**
  - `PsAgentClass`: Represents agent classes.
  - `User`: Represents users.
- **Methods Used on AgentClass:**
  - `hasUser(user)`: Checks if the user is already a member.
  - `addUser(user)`: Adds the user as a member.
  - `hasAdmin(user)`: Checks if the user is already an admin.
  - `addAdmin(user)`: Adds the user as an admin.
- **Logging:** Uses `PolicySynthAgentBase.logger` for info and error messages.
- **Error Handling:** Logs errors and ensures the database connection is closed.
- **Command Line Arguments:** Expects exactly one argument (the user email).

---

## Code Reference

```typescript
import { PsAgentClass } from "../dbModels/agentClass.js";
import { initializeModels } from "../dbModels/index.js";
import { sequelize } from "../dbModels/sequelize.js";
import { User } from "../dbModels/ypUser.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";

// Function to add a user to all agent classes as both user and admin
async function addUserToAllAgentClasses(userEmail: string) {
  try {
    await initializeModels();

    // Find all agent classes
    const agentClasses = await PsAgentClass.findAll();

    if (agentClasses.length === 0) {
      PolicySynthAgentBase.logger.error("No agent classes found in the database");
      return;
    }

    // Find the user by email
    const user = await User.findOne({
      where: {
        email: userEmail,
      },
    });
    if (!user) {
      PolicySynthAgentBase.logger.error("User not found");
      return;
    }

    for (const agentClass of agentClasses) {
      // Check if the user already has user access
      const hasUserAccess = await agentClass.hasUser(user);
      if (!hasUserAccess) {
        // Add the user to the agent class as a user
        await agentClass.addUser(user);
        PolicySynthAgentBase.logger.info(
          `User ${user.email} added as user to agent class ${agentClass.id}`
        );
      } else {
        PolicySynthAgentBase.logger.info(
          `User ${user.email} already has user access to agent class ${agentClass.id}`
        );
      }

      // Check if the user already has admin access
      const hasAdminAccess = await agentClass.hasAdmin(user);
      if (!hasAdminAccess) {
        // Add the user to the agent class as an admin
        await agentClass.addAdmin(user);
        PolicySynthAgentBase.logger.info(
          `User ${user.email} added as admin to agent class ${agentClass.id}`
        );
      } else {
        PolicySynthAgentBase.logger.info(
          `User ${user.email} already has admin access to agent class ${agentClass.id}`
        );
      }
    }
  } catch (error) {
    PolicySynthAgentBase.logger.error("Error adding user to agent classes:", error);
  } finally {
    await sequelize.close();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  PolicySynthAgentBase.logger.error("Usage: ts-node addUserToAllAgentClasses.ts <userEmail>");
  process.exit(1);
}

const [userEmail] = args;

// Run the function
addUserToAllAgentClasses(userEmail);
```

---

## Notes

- This script is intended for administrative use and should be run with appropriate permissions.
- The script expects the database models to be properly configured and accessible.
- The user must already exist in the database; the script does not create new users.