import { PsAgentConnectorClass } from "./agentConnectorClass.js"; // Adjust the path as needed
import { User } from "./ypUser.js";
import { Group } from "./ypGroup.js";
import { PsAgentClass } from "./agentClass.js";
import { PsAgentConnector } from "./agentConnector.js";
import { PsAgent } from "./agent.js";
import { PsApiCost } from "./apiCost.js";
import { PsModelCost } from "./modelCost.js";
import { PsAgentAuditLog } from "./agentAuditLog.js";
import { PsAgentRegistry } from "./agentRegistry.js";
import { PsAiModelClass } from "./aiModel.js";
import { PsApiCostClass } from "./apiCostClass.js";
import { PsModelCostClass } from "./modelCostClass.js";
const models = {
    PsAgentClass,
    User,
    Group,
    PsApiCost,
    PsModelCost,
    PsAgentConnector,
    PsAgent,
    PsAgentAuditLog,
    PsAgentConnectorClass,
    PsAgentRegistry,
    PsAiModel: PsAiModelClass,
    PsApiCostClass,
    PsModelCostClass,
};
const initializeModels = async () => {
    try {
        console.log(`All Models Loaded Init`);
        // Call associate method to set up associations
        for (const modelName of Object.keys(models)) {
            if (models[modelName].associate) {
                await models[modelName].associate(models);
            }
        }
        console.log("All models initialized successfully.");
    }
    catch (error) {
        console.error("Error initializing models:", error);
        process.exit(1); // Exit the process with failure
    }
};
export { models, initializeModels };
//# sourceMappingURL=index.js.map