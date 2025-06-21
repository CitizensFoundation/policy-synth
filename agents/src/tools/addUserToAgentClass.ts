import { PsAgentClass } from "../dbModels/agentClass.js";
import { initializeModels } from "../dbModels/index.js";
import { sequelize } from "../dbModels/sequelize.js";
import { User } from "../dbModels/ypUser.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";

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
      PolicySynthAgentBase.logger.error("No agent classes found with the given class_base_id");
      return;
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      PolicySynthAgentBase.logger.error("User not found");
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
          PolicySynthAgentBase.logger.info(
            `User ${userId} added as user to agent class ${agentClass.id}`
          );
        } else if (role === "admin") {
          await agentClass.addAdmin(user);
          PolicySynthAgentBase.logger.info(
            `User ${userId} added as admin to agent class ${agentClass.id}`
          );
        }
      } else {
        PolicySynthAgentBase.logger.info(
          `User ${userId} already has ${role} access to agent class ${agentClass.id}`
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
if (args.length !== 3) {
  PolicySynthAgentBase.logger.error(
    "Usage: ts-node addUserToAgentClasses.ts <agentClassBaseId> <userId> <role>"
  );
  process.exit(1);
}

const [agentClassBaseId, userId, role] = args;

if (role !== "user" && role !== "admin") {
  PolicySynthAgentBase.logger.error('Role must be either "user" or "admin"');
  process.exit(1);
}

// Run the function
addUserToAgentClasses(agentClassBaseId, Number(userId), role as "user" | "admin");