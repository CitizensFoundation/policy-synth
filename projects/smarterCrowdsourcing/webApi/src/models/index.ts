import { PsAgentConnectorClass } from "@policysynth/agents/dbModels/agentConnectorClass.js"; // Adjust the path as needed
import { User } from "@policysynth/agents/dbModels/ypUser.js";
import { Group } from "@policysynth/agents/dbModels/ypGroup.js";
import { PsAgentClass } from "@policysynth/agents/dbModels/agentClass.js";
import { PsAgentConnector } from "@policysynth/agents/dbModels/agentConnector.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsExternalApiUsage } from "@policysynth/agents/dbModels/externalApiUsage.js";
import { PsModelUsage } from "@policysynth/agents/dbModels/modelUsage.js";
import { PsAgentAuditLog } from "@policysynth/agents/dbModels/agentAuditLog.js";
import { PsAgentRegistry } from "@policysynth/agents/dbModels/agentRegistry.js";
import { PsAiModel } from "@policysynth/agents/dbModels/aiModel.js";
import { PsExternalApi } from "@policysynth/agents/dbModels/externalApis.js";

import { sequelize } from "@policysynth/agents/dbModels/sequelize.js";

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
