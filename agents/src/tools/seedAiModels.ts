import { initializeModels } from "../dbModels/index.js";
import { User } from "../dbModels/ypUser.js";
import { Group } from "../dbModels/ypGroup.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { PsAiModel } from "../dbModels/aiModel.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";
import { PsAgentClassCategories } from "../agentCategories.js";
import { isCliEntrypoint } from "./cliUtils.js";

type CreatedRecord = {
  id: number;
};

export interface SeedAiModelsDependencies {
  connectToDatabase: () => Promise<unknown>;
  initializeModels: () => Promise<unknown>;
  createUser: (values: { email: string; name: string }) => Promise<CreatedRecord>;
  createAiModel: (values: {
    name: string;
    organization_id: number;
    user_id: number;
    configuration: PsAiModelConfiguration;
  }) => Promise<CreatedRecord>;
  createGroup: (values: {
    name: string;
    user_id: number;
    configuration: Record<string, unknown>;
    private_access_configuration: Array<{ aiModelId: number; apiKey: string }>;
  }) => Promise<CreatedRecord>;
  createAgentClass: (values: {
    class_base_id: string;
    name: string;
    version: number;
    available: boolean;
    configuration: PsAgentClassAttributesConfiguration;
    user_id: number;
  }) => Promise<CreatedRecord>;
  env: NodeJS.ProcessEnv;
}

export const defaultSeedAiModelsDependencies: SeedAiModelsDependencies = {
  connectToDatabase,
  initializeModels,
  createUser: (values) => User.create(values),
  createAiModel: (values) => PsAiModel.create(values),
  createGroup: (values) => Group.create(values),
  createAgentClass: (values) => PsAgentClass.create(values),
  env: process.env,
};

export function buildSeedAiModelConfigurations() {
  const anthropicSonnetConfig: PsAiModelConfiguration = {
    type: PsAiModelType.Text,
    modelSize: PsAiModelSize.Medium,
    provider: "anthropic",
    prices: {
      costInTokensPerMillion: 3,
      costOutTokensPerMillion: 15,
      costInCachedContextTokensPerMillion: 1.5,
      currency: "USD",
    },
    maxTokensOut: 8000,
    defaultTemperature: 0.7,
    model: "claude-3-5-sonnet-20240620",
    active: true,
  };

  const openAiGpt4oConfig: PsAiModelConfiguration = {
    type: PsAiModelType.Text,
    modelSize: PsAiModelSize.Medium,
    provider: "openai",
    prices: {
      costInTokensPerMillion: 5,
      costOutTokensPerMillion: 15,
      costInCachedContextTokensPerMillion: 2.5,
      currency: "USD",
    },
    maxTokensOut: 4096,
    defaultTemperature: 0.7,
    model: "gpt-4o",
    active: true,
  };

  const openAiGpt4oMiniConfig: PsAiModelConfiguration = {
    type: PsAiModelType.Text,
    modelSize: PsAiModelSize.Small,
    provider: "openai",
    prices: {
      costInTokensPerMillion: 0.15,
      costOutTokensPerMillion: 0.6,
      costInCachedContextTokensPerMillion: 0.075,
      currency: "USD",
    },
    maxTokensOut: 16000,
    defaultTemperature: 0.0,
    model: "gpt-4o-mini",
    active: true,
  };

  const openAiGpt54Config: PsAiModelConfiguration = {
    type: PsAiModelType.TextReasoning,
    modelSize: PsAiModelSize.Large,
    provider: "openai",
    prices: {
      costInTokensPerMillion: 2.5,
      costOutTokensPerMillion: 15.0,
      costInCachedContextTokensPerMillion: 0.25,
      longContextTokenThreshold: 272_000,
      longContextCostInTokensPerMillion: 5.0,
      longContextCostInCachedContextTokensPerMillion: 0.5,
      longContextCostOutTokensPerMillion: 22.5,
      regionalProcessingMargin: 10,
      flexTokensIn: 1.25,
      flexTokensCachedIn: 0.125,
      flexTokensOut: 7.5,
      priorityTokensIn: 5.0,
      priorityTokensCachedIn: 0.5,
      priorityTokensOut: 30.0,
      flexPriorityTokensEnabledOnLongContext: false,
      currency: "USD",
    },
    maxTokensOut: 128000,
    maxContextTokens: 1050000,
    defaultTemperature: 0.7,
    model: "gpt-5.4",
    active: true,
  };

  const openAiGpt54ProConfig: PsAiModelConfiguration = {
    type: PsAiModelType.TextReasoning,
    modelSize: PsAiModelSize.Large,
    provider: "openai",
    prices: {
      costInTokensPerMillion: 30.0,
      costOutTokensPerMillion: 180.0,
      costInCachedContextTokensPerMillion: 0.0,
      longContextTokenThreshold: 272_000,
      longContextCostInTokensPerMillion: 60.0,
      longContextCostInCachedContextTokensPerMillion: 0.0,
      longContextCostOutTokensPerMillion: 270.0,
      regionalProcessingMargin: 10,
      flexTokensIn: 15.0,
      flexTokensCachedIn: 0.0,
      flexTokensOut: 90.0,
      priorityTokensIn: 60.0,
      priorityTokensCachedIn: 0.0,
      priorityTokensOut: 360.0,
      flexPriorityTokensEnabledOnLongContext: false,
      currency: "USD",
    },
    maxTokensOut: 128000,
    maxContextTokens: 1050000,
    defaultTemperature: 0.7,
    model: "gpt-5.4-pro",
    active: true,
  };

  return {
    anthropicSonnetConfig,
    openAiGpt4oConfig,
    openAiGpt4oMiniConfig,
    openAiGpt54Config,
    openAiGpt54ProConfig,
  };
}

export function buildTopLevelAgentClassConfig(): PsAgentClassAttributesConfiguration {
  return {
    category: PsAgentClassCategories.PolicySynthTopLevel,
    subCategory: "group",
    hasPublicAccess: true,
    description: "A top-level agent that coordinates other agents",
    queueName: "noqueue",
    imageUrl:
      "https://yrpri-eu-direct-assets.s3.eu-west-1.amazonaws.com/topLevelAgent.png",
    iconName: "coordinator",
    capabilities: [
      "process coordination",
      "task management",
      "result aggregation",
    ],
    questions: [],
    requestedAiModelSizes: ["large", "medium", "small"] as PsAiModelSize[],
    supportedConnectors: [],
  };
}

export async function seedAiModels(
  dependencies: SeedAiModelsDependencies = defaultSeedAiModelsDependencies
) {
  await dependencies.connectToDatabase();
  await dependencies.initializeModels();

  const user = await dependencies.createUser({
    email: "example@example.com",
    name: "Example User",
  });

  const {
    anthropicSonnetConfig,
    openAiGpt4oConfig,
    openAiGpt4oMiniConfig,
    openAiGpt54Config,
    openAiGpt54ProConfig,
  } = buildSeedAiModelConfigurations();

  const anthropicSonnet = await dependencies.createAiModel({
    name: "Anthropic Sonnet 3.5",
    organization_id: 1,
    user_id: user.id,
    configuration: anthropicSonnetConfig,
  });

  const openAiGpt4 = await dependencies.createAiModel({
    name: "GPT-4o",
    organization_id: 1,
    user_id: user.id,
    configuration: openAiGpt4oConfig,
  });

  const openAiGpt4Mini = await dependencies.createAiModel({
    name: "GPT-4o Mini",
    organization_id: 1,
    user_id: user.id,
    configuration: openAiGpt4oMiniConfig,
  });

  const openAiGpt54 = await dependencies.createAiModel({
    name: "GPT-5.4",
    organization_id: 1,
    user_id: user.id,
    configuration: openAiGpt54Config,
  });

  const openAiGpt54Pro = await dependencies.createAiModel({
    name: "GPT-5.4 Pro",
    organization_id: 1,
    user_id: user.id,
    configuration: openAiGpt54ProConfig,
  });

  const group = await dependencies.createGroup({
    name: "Example Group",
    user_id: user.id,
    configuration: {
      agents: {},
    },
    private_access_configuration: [
      {
        aiModelId: anthropicSonnet.id,
        apiKey: dependencies.env.ANTHROPIC_CLAUDE_API_KEY || "",
      },
      {
        aiModelId: openAiGpt4.id,
        apiKey: dependencies.env.OPENAI_API_KEY || "",
      },
      {
        aiModelId: openAiGpt4Mini.id,
        apiKey: dependencies.env.OPENAI_API_KEY || "",
      },
      {
        aiModelId: openAiGpt54.id,
        apiKey: dependencies.env.OPENAI_API_KEY || "",
      },
      {
        aiModelId: openAiGpt54Pro.id,
        apiKey: dependencies.env.OPENAI_API_KEY || "",
      },
    ],
  });

  const agentClass = await dependencies.createAgentClass({
    class_base_id: "c375c1fb-58ca-4372-a567-0e02b2c3d479",
    name: "Operations",
    version: 1,
    available: true,
    configuration: buildTopLevelAgentClassConfig(),
    user_id: user.id,
  });

  return {
    user,
    group,
    agentClass,
    aiModels: [
      anthropicSonnet,
      openAiGpt4,
      openAiGpt4Mini,
      openAiGpt54,
      openAiGpt54Pro,
    ],
  };
}

if (isCliEntrypoint(import.meta.url)) {
  await seedAiModels();
}
