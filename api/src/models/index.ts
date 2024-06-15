import { sequelize } from "../models/sequelize.js";

import { PsAgentConnectorClass } from "../models/agentConnectorClass.js"; // Adjust the path as needed
import { User } from "../models/ypUser.js";
import { Group } from "../models/ypGroup.js";
import { PsAgentClass } from "../models/agentClass.js";
import { PsAgentConnector } from "../models/agentConnector.js";
import { PsAgent } from "../models/agent.js";
import { PsApiCost } from "../models/apiCost.js";
import { PsModelCost } from "../models/modelCost.js";
import { PsAgentAuditLog } from "../models/agentAuditLog.js";
import { PsAgentRegistry } from "../models/agentRegistry.js";
import { PsAiModelClass } from "../models/aiModel.js";
import { PsApiCostClass } from "../models/apiCostClass.js";
import { PsModelCostClass } from "../models/modelCostClass.js";

const models = {
  PsAgentClass: PsAgentClass,
  User: User,
  Group: Group,
  PsApiCost: PsApiCost,
  PsModelCost: PsModelCost,
  PsAgentConnector: PsAgentConnector,
  PsAgent: PsAgent,
  PsAgentAuditLog: PsAgentAuditLog,
  PsAgentConnectorClass: PsAgentConnectorClass,
  PsAgentRegistry: PsAgentRegistry,
  PsAiModel: PsAiModelClass,
  PsApiCostClass: PsApiCostClass,
  PsModelCostClass: PsModelCostClass,
} as any;

console.log(`All Models Loaded Init`);

Object.values(models).forEach((model: any) => {
  if (model.init) {
    console.log("INIIT");
    model.init(sequelize);
  }
});

// Call associate method to set up associations
Object.keys(models).forEach((modelName: any) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize, models };