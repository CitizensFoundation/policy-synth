import { initializeModels, models } from "../dbModels/index.js";

import { PsAgentConnectorClass } from "../dbModels/agentConnectorClass.js";
import { User } from "../dbModels/ypUser.js";
import { Group } from "../dbModels/ypGroup.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { PsAgentConnector } from "../dbModels/agentConnector.js";
import { PsAgent } from "../dbModels/agent.js";
import { PsExternalApiUsage } from "../dbModels/externalApiUsage.js";
import { PsModelUsage } from "../dbModels/modelUsage.js";
import { PsAgentAuditLog } from "../dbModels/agentAuditLog.js";
import { PsAgentRegistry } from "../dbModels/agentRegistry.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { PsExternalApi } from "../dbModels/externalApis.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
import { PsAiModelType } from "../aiModelTypes.js";

await connectToDatabase();
await initializeModels();

// Create a user
const user = await User.create({ email: "user@example.com", name: "Example User" });

const anthropicSonnetConfig: PsAiModelConfiguration = {
  type: PsAiModelType.Text,
  provider: "anthropic",
  prices: {
    costInTokensPerMillion: 3,
    costOutTokensPerMillion: 15,
    currency: "USD"
  },
  maxTokensOut: 4096,
  defaultTemperature: 0.7,
  model: "claude-3-sonnet-20240229",
};

const anthropicSonnet = await PsAiModel.create({
  name: "Anthropic Sonnet 3.5",
  organization_id: 1,
  user_id: user.id,
  configuration: anthropicSonnetConfig,
});

const openAiGpt4Config: PsAiModelConfiguration = {
  type: PsAiModelType.Text,
  provider: "openai",
  prices: {
    costInTokensPerMillion: 5,
    costOutTokensPerMillion: 15,
    currency: "USD"
  },
  maxTokensOut: 4096,
  defaultTemperature: 0.7,
  model: "gpt-4o",
};

const openAiGpt4 = await PsAiModel.create({
  name: "OpenAI GPT-4o",
  organization_id: 1,
  user_id: user.id,
  configuration: openAiGpt4Config,
});

// Create a group with both AI model API keys
await Group.create({
  name: "Example Group",
  user_id: user.id,
  private_access_configuration: [
/*    {
      aiModelId: anthropicSonnet.id,
      apiKey: process.env.ANTHROPIC_CLAUDE_SONNET_API_KEY || "",
    },*/
    {
      aiModelId: openAiGpt4.id,
      apiKey: process.env.OPENAI_API_KEY || "",
    }
  ]
});

// Create Top-Level Agent Class
const topLevelAgentClassConfig: PsAgentClassAttributesConfiguration = {
  description: "A top-level agent that coordinates other agents",
  queueName: "noqueue",
  imageUrl: "https://aoi-storage-production.citizens.is/ypGenAi/community/1/6d4368ce-ecaf-41ab-abb3-65ceadbdb2a6.png",
  iconName: "coordinator",
  capabilities: ["process coordination", "task management", "result aggregation"],
  inputJsonInterface: "{}",
  outputJsonInterface: "{}",
  questions: [],
  supportedConnectors: [],
};

// Fetch the existing Problems Agent Class
const problemsAgentClassInstance = await PsAgentClass.findByPk(1);

if (!problemsAgentClassInstance) {
  throw new Error("Problems Agent Class not found with id 1");
}

const topLevelAgentClassInstance = await PsAgentClass.create({
  class_base_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  name: "Smarter Crowdsourcing Coordinator Agent",
  version: 1,
  available: true,
  configuration: topLevelAgentClassConfig,
  user_id: user.id,
});

// Create Agents
const topLevelAgentInstance = await PsAgent.create({
  class_id: topLevelAgentClassInstance.id,
  user_id: user.id,
  group_id: 1,
  configuration: {
    name: "Smarter Crowdsourcing Coordinator",
    graphPosX: 0,
    graphPosY: 0,
  },
});

const subAgentInstance = await PsAgent.create({
  class_id: 1, // Using the existing Problems Agent Class with id 1
  user_id: user.id,
  group_id: 1,
  configuration: {
    name: "Root Causes Agent",
    graphPosX: 0,
    graphPosY: 100,
  },
  parent_agent_id: topLevelAgentInstance.id,
});

// Add sub-agent to the top-level agent
await topLevelAgentInstance.addSubAgents([subAgentInstance]);

// Associate both AI models with all agents
//await topLevelAgentInstance.addAiModel(anthropicSonnet);
await topLevelAgentInstance.addAiModel(openAiGpt4);
//await subAgentInstance.addAiModel(anthropicSonnet);
await subAgentInstance.addAiModel(openAiGpt4);

console.log("Database seeded successfully!");