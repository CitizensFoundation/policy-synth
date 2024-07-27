import { initializeModels } from "../dbModels/index.js";
import { User } from "../dbModels/ypUser.js";
import { Group } from "../dbModels/ypGroup.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";
import { PsAgentClassCategories } from "../agentCategories.js";
await connectToDatabase();
await initializeModels();
const user = await User.create({ email: "example@example.com", name: "Example User" });
const anthropicSonnetConfig = {
    type: PsAiModelType.Text,
    modelSize: PsAiModelSize.Medium,
    provider: "anthropic",
    prices: {
        costInTokensPerMillion: 3,
        costOutTokensPerMillion: 15,
        currency: "USD"
    },
    maxTokensOut: 8000,
    defaultTemperature: 0.7,
    model: "claude-3-5-sonnet-20240620",
    active: true
};
const anthropicSonnet = await PsAiModel.create({
    name: "Anthropic Sonnet 3.5",
    organization_id: 1,
    user_id: user.id,
    configuration: anthropicSonnetConfig,
});
const openAiGpt4oConfig = {
    type: PsAiModelType.Text,
    modelSize: PsAiModelSize.Medium,
    provider: "openai",
    prices: {
        costInTokensPerMillion: 5,
        costOutTokensPerMillion: 15,
        currency: "USD"
    },
    maxTokensOut: 4096,
    defaultTemperature: 0.7,
    model: "gpt-4o",
    active: true
};
const openAiGpt4oMiniConfig = {
    type: PsAiModelType.Text,
    modelSize: PsAiModelSize.Small,
    provider: "openai",
    prices: {
        costInTokensPerMillion: 0.15,
        costOutTokensPerMillion: 0.6,
        currency: "USD"
    },
    maxTokensOut: 16000,
    defaultTemperature: 0.0,
    model: "gpt-4o-mini",
    active: true
};
const openAiGpt4 = await PsAiModel.create({
    name: "GPT-4o",
    organization_id: 1,
    user_id: user.id,
    configuration: openAiGpt4oConfig,
});
const openAiGpt4Mini = await PsAiModel.create({
    name: "GPT-4o Mini",
    organization_id: 1,
    user_id: user.id,
    configuration: openAiGpt4oMiniConfig,
});
// Create a group with both AI model API keys
await Group.create({
    name: "Example Group",
    user_id: user.id,
    configuration: {
        agents: {}
    },
    private_access_configuration: [
        {
            aiModelId: anthropicSonnet.id,
            apiKey: process.env.ANTHROPIC_CLAUDE_API_KEY || "",
        },
        {
            aiModelId: openAiGpt4.id,
            apiKey: process.env.OPENAI_API_KEY || "",
        },
        {
            aiModelId: openAiGpt4Mini.id,
            apiKey: process.env.OPENAI_API_KEY || "",
        }
    ]
});
// Create Top-Level Agent Class
const topLevelAgentClassConfig = {
    category: PsAgentClassCategories.PolicySynthTopLevel,
    subCategory: "group",
    hasPublicAccess: true,
    description: "A top-level agent that coordinates other agents",
    queueName: "noqueue",
    imageUrl: "https://yrpri-eu-direct-assets.s3.eu-west-1.amazonaws.com/topLevelAgent.png",
    iconName: "coordinator",
    capabilities: ["process coordination", "task management", "result aggregation"],
    questions: [],
    requestedAiModelSizes: ["large", "medium", "small"],
    supportedConnectors: [],
};
await PsAgentClass.create({
    class_base_id: "c375c1fb-58ca-4372-a567-0e02b2c3d479",
    name: "Operations",
    version: 1,
    available: true,
    configuration: topLevelAgentClassConfig,
    user_id: user.id,
});
//# sourceMappingURL=seedAiModels.js.map