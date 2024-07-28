import { PsAgentClass } from "../dbModels/agentClass.js";
import { initializeModels } from "../dbModels/index.js";
import { sequelize } from "../dbModels/sequelize.js";
import { User } from "../dbModels/ypUser.js";

// Function to add a user to multiple agent classes as a regular user or admin
async function addUserToAgentClasses(
  agentClassBaseId: string,
  userId: number,
  role: "user" | "admin"
) {
  try {
    await initializeModels();

    // Find all agent classes with the given class_base_id
    const agentClasses = await PsAgentClass.findAll({
      where: {
        class_base_id: agentClassBaseId,
      },
    });

    if (agentClasses.length === 0) {
      console.error("No agent classes found with the given class_base_id");
      return;
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      console.error("User not found");
      return;
    }

    for (const agentClass of agentClasses) {
      // Check if the user already has access to this agent class
      const hasAccess = role === "user"
        ? await agentClass.hasUser(user)
        : await agentClass.hasAdmin(user);

      if (!hasAccess) {
        // Add the user to the agent class with the specified role
        if (role === "user") {
          await agentClass.addUser(user);
          console.log(
            `User ${userId} added as user to agent class ${agentClass.id}`
          );
        } else if (role === "admin") {
          await agentClass.addAdmin(user);
          console.log(
            `User ${userId} added as admin to agent class ${agentClass.id}`
          );
        }
      } else {
        console.log(
          `User ${userId} already has ${role} access to agent class ${agentClass.id}`
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
if (args.length !== 3) {
  console.error(
    "Usage: ts-node addUserToAgentClasses.ts <agentClassBaseId> <userId> <role>"
  );
  process.exit(1);
}

const [agentClassBaseId, userId, role] = args;

if (role !== "user" && role !== "admin") {
  console.error('Role must be either "user" or "admin"');
  process.exit(1);
}

// Run the function
addUserToAgentClasses(agentClassBaseId, Number(userId), role as "user" | "admin");