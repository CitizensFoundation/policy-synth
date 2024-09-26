import { PsAgentClass } from "../dbModels/agentClass.js";
import { initializeModels } from "../dbModels/index.js";
import { sequelize } from "../dbModels/sequelize.js";
import { User } from "../dbModels/ypUser.js";

// Function to add a user to all agent classes as both user and admin
async function addUserToAllAgentClasses(userEmail: string) {
  try {
    await initializeModels();

    // Find all agent classes
    const agentClasses = await PsAgentClass.findAll();

    if (agentClasses.length === 0) {
      console.error("No agent classes found in the database");
      return;
    }

    // Find the user by email
    const user = await User.findOne({
      where: {
        email: userEmail,
      },
    });
    if (!user) {
      console.error("User not found");
      return;
    }

    for (const agentClass of agentClasses) {
      // Check if the user already has user access
      const hasUserAccess = await agentClass.hasUser(user);
      if (!hasUserAccess) {
        // Add the user to the agent class as a user
        await agentClass.addUser(user);
        console.log(
          `User ${user.email} added as user to agent class ${agentClass.id}`
        );
      } else {
        console.log(
          `User ${user.email} already has user access to agent class ${agentClass.id}`
        );
      }

      // Check if the user already has admin access
      const hasAdminAccess = await agentClass.hasAdmin(user);
      if (!hasAdminAccess) {
        // Add the user to the agent class as an admin
        await agentClass.addAdmin(user);
        console.log(
          `User ${user.email} added as admin to agent class ${agentClass.id}`
        );
      } else {
        console.log(
          `User ${user.email} already has admin access to agent class ${agentClass.id}`
        );
      }
    }
  } catch (error) {
    console.error("Error adding user to agent classes:", error);
  } finally {
    await sequelize.close();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: ts-node addUserToAllAgentClasses.ts <userEmail>");
  process.exit(1);
}

const [userEmail] = args;

// Run the function
addUserToAllAgentClasses(userEmail);
