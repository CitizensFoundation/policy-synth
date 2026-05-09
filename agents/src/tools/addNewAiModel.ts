import { PsAiModel } from "../dbModels/aiModel.js";
import { initializeModels } from "../dbModels/index.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";
import { isCliEntrypoint } from "./cliUtils.js";

type DeactivatableAiModel = {
  id: number;
  configuration: PsAiModelConfiguration;
  changed(key: string, value: boolean): void;
  save(): Promise<unknown>;
};

type ToolLogger = {
  info(...args: unknown[]): unknown;
  error(...args: unknown[]): unknown;
};

export interface AddAiModelParams {
  name: string;
  organizationId: number;
  userId: number;
  type: PsAiModelType;
  modelSize: PsAiModelSize;
  provider: string;
  costInTokensPerMillion: number;
  costOutTokensPerMillion: number;
  costInCachedContextTokensPerMillion: number;
  currency: string;
  maxTokensOut: number;
  defaultTemperature: number;
  model: string;
  active: boolean;
}

export interface AddAiModelDependencies {
  connectToDatabase: () => Promise<unknown>;
  initializeModels: () => Promise<unknown>;
  findModelsByName: (name: string) => Promise<DeactivatableAiModel[]>;
  createModel: (values: {
    name: string;
    organization_id: number;
    user_id: number;
    configuration: PsAiModelConfiguration;
  }) => Promise<{ id: number }>;
  logger: ToolLogger;
}

export const defaultAddAiModelDependencies: AddAiModelDependencies = {
  connectToDatabase,
  initializeModels,
  findModelsByName: (name) =>
    PsAiModel.findAll({
      where: { name },
    }) as Promise<DeactivatableAiModel[]>,
  createModel: (values) => PsAiModel.create(values),
  logger: PolicySynthAgentBase.logger,
};

export async function deactivateExistingModels(
  name: string,
  dependencies: AddAiModelDependencies = defaultAddAiModelDependencies
) {
  const existingModels = await dependencies.findModelsByName(name);

  for (const model of existingModels) {
    model.configuration.active = false;
    model.changed("configuration", true);
    await model.save();
    dependencies.logger.info(
      `Deactivated existing model "${name}" with ID: ${model.id}`
    );
  }
}

export async function addAiModel(
  params: AddAiModelParams,
  dependencies: AddAiModelDependencies = defaultAddAiModelDependencies
) {
  try {
    await dependencies.connectToDatabase();
    await dependencies.initializeModels();

    await deactivateExistingModels(params.name, dependencies);

    const configuration: PsAiModelConfiguration = {
      type: params.type,
      modelSize: params.modelSize,
      provider: params.provider,
      prices: {
        costInTokensPerMillion: params.costInTokensPerMillion,
        costOutTokensPerMillion: params.costOutTokensPerMillion,
        costInCachedContextTokensPerMillion:
          params.costInCachedContextTokensPerMillion,
        currency: params.currency,
      },
      maxTokensOut: params.maxTokensOut,
      defaultTemperature: params.defaultTemperature,
      model: params.model,
      active: params.active,
    };

    const newModel = await dependencies.createModel({
      name: params.name,
      organization_id: params.organizationId,
      user_id: params.userId,
      configuration,
    });

    dependencies.logger.info(
      `New AI Model "${params.name}" created successfully with ID: ${newModel.id}`
    );
    return newModel;
  } catch (error) {
    dependencies.logger.error(`Error adding AI model "${params.name}":`, error);
    return undefined;
  }
}

export const addAiModelUsage =
  "Usage: ts-node addAiModelSeed.ts <name> <organizationId> <userId> <type> <modelSize> <provider> <costInTokensPerMillion> <costOutTokensPerMillion> <costInCachedContextTokensPerMillion> <currency> <maxTokensOut> <defaultTemperature> <model> <active>";

export function parseAddAiModelArgs(args: string[]): AddAiModelParams {
  if (args.length !== 14) {
    throw new Error(addAiModelUsage);
  }

  const [
    name,
    organizationId,
    userId,
    type,
    modelSize,
    provider,
    costInTokensPerMillion,
    costOutTokensPerMillion,
    costInCachedContextTokensPerMillion,
    currency,
    maxTokensOut,
    defaultTemperature,
    model,
    active,
  ] = args;

  if (!Object.values(PsAiModelType).includes(type as PsAiModelType)) {
    throw new Error("Invalid AI model type");
  }

  if (!Object.values(PsAiModelSize).includes(modelSize as PsAiModelSize)) {
    throw new Error("Invalid AI model size");
  }

  return {
    name,
    organizationId: Number(organizationId),
    userId: Number(userId),
    type: type as PsAiModelType,
    modelSize: modelSize as PsAiModelSize,
    provider,
    costInTokensPerMillion: Number(costInTokensPerMillion),
    costOutTokensPerMillion: Number(costOutTokensPerMillion),
    costInCachedContextTokensPerMillion: Number(
      costInCachedContextTokensPerMillion
    ),
    currency,
    maxTokensOut: Number(maxTokensOut),
    defaultTemperature: Number(defaultTemperature),
    model,
    active: active === "true",
  };
}

export async function runAddAiModelCli(
  args: string[] = process.argv.slice(2),
  dependencies: AddAiModelDependencies = defaultAddAiModelDependencies
) {
  try {
    await addAiModel(parseAddAiModelArgs(args), dependencies);
  } catch (error) {
    dependencies.logger.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (isCliEntrypoint(import.meta.url)) {
  await runAddAiModelCli();
}
