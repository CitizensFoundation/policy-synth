import { PsAgentConnectorClass } from "./agentConnectorClass.js"; // Adjust the path as needed
import { User } from "./ypUser.js";
import { Group } from "./ypGroup.js";
import { PsAgentClass } from "./agentClass.js";
import { PsAgentConnector } from "./agentConnector.js";
import { PsAgent } from "./agent.js";
import { PsExternalApiUsage } from "./externalApiUsage.js";
import { PsModelUsage } from "./modelUsage.js";
import { PsAgentAuditLog } from "./agentAuditLog.js";
import { PsAgentRegistry } from "./agentRegistry.js";
import { PsAiModel } from "./aiModel.js";
import { PsExternalApi } from "./externalApis.js";

import { sequelize } from "./sequelize.js";

interface Models {
  [key: string]: any;
}

const models: Models = {
  PsAgentClass,
  User,
  Group,
  PsExternalApiUsage,
  PsModelUsage,
  PsAgentConnector,
  PsAgent,
  PsAgentAuditLog,
  PsAgentConnectorClass,
  PsAgentRegistry,
  PsAiModel,
  PsExternalApi
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

  } catch (error) {
    console.error("Error initializing models:", error);
    process.exit(1); // Exit the process with failure
  }
};

export {
  models,
  initializeModels,
  sequelize,
  PsAgentConnectorClass,
  User,
  Group,
  PsAgentClass,
  PsAgentConnector,
  PsAgent,
  PsExternalApiUsage,
  PsModelUsage,
  PsAgentAuditLog,
  PsAgentRegistry,
  PsAiModel,
  PsExternalApi
 };
