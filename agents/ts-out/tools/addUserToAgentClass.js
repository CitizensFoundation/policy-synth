import { PsAgentClass } from "../dbModels/agentClass.js";
import { initializeModels } from "../dbModels/index.js";
import { sequelize } from "../dbModels/sequelize.js";
import { User } from "../dbModels/ypUser.js";
// Function to add a user to an agent class as a regular user or admin
async function addUserToAgentClass(agentClassBaseId, userId, role) {
    try {
        await initializeModels();
        // Find the agent class
        const agentClass = await PsAgentClass.findOne({
            where: {
                class_base_id: agentClassBaseId,
            },
            attributes: ["id"],
        });
        if (!agentClass) {
            console.error("Agent class not found");
            return;
        }
        // Find the user
        const user = await User.findByPk(userId);
        if (!user) {
            console.error("User not found");
            return;
        }
        console.log('Available methods on agentClass instance:');
        console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(agentClass)));
        // Add the user to the agent class with the specified role
        if (role === "user") {
            await agentClass.addUser(user);
            console.log(`User ${userId} added as user to agent class ${agentClassBaseId}`);
        }
        else if (role === "admin") {
            await agentClass.addAdmin(user);
            console.log(`User ${userId} added as admin to agent class ${agentClassBaseId}`);
        }
    }
    catch (error) {
        console.error("Error adding user to agent class:", error);
    }
    finally {
        await sequelize.close();
    }
}
// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 3) {
    console.error("Usage: ts-node addUserToAgentClass.ts <agentClassBaseId> <userId> <role>");
    process.exit(1);
}
const [agentClassBaseId, userId, role] = args;
if (role !== "user" && role !== "admin") {
    console.error('Role must be either "user" or "admin"');
    process.exit(1);
}
// Run the function
addUserToAgentClass(agentClassBaseId, Number(userId), role);
//# sourceMappingURL=addUserToAgentClass.js.map