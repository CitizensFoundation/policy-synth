import { PsAiModel } from "../dbModels/aiModel.js";
import { initializeModels } from "../dbModels/index.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";

async function deactivateExistingModels(name: string) {
  const existingModels = await PsAiModel.findAll({
    where: { name }
  });

  for (const model of existingModels) {
    model.configuration.active = false;
    model.changed("configuration", true);
    await model.save();
    PolicySynthAgentBase.logger.info(`Deactivated existing model "${name}" with ID: ${model.id}`);
  }
}

async function addAiModel(
  name: string,
  organizationId: number,
  userId: number,
  type: PsAiModelType,
  modelSize: PsAiModelSize,
  provider: string,
  costInTokensPerMillion: number,
  costOutTokensPerMillion: number,
  costInCachedContextTokensPerMillion: number,
  currency: string,
  maxTokensOut: number,
  defaultTemperature: number,
  model: string,
  active: boolean
) {
  try {
    await connectToDatabase();
    await initializeModels();

    // Deactivate existing models with the same name
    await deactivateExistingModels(name);

    const configuration: PsAiModelConfiguration = {
      type,
      modelSize,
      provider,
      prices: {
        costInTokensPerMillion,
        costOutTokensPerMillion,
        costInCachedContextTokensPerMillion,
        currency,
      },
      maxTokensOut,
      defaultTemperature,
      model,
      active,
    };

    const newModel = await PsAiModel.create({
      name,
      organization_id: organizationId,
      user_id: userId,
      configuration,
    });

    PolicySynthAgentBase.logger.info(`New AI Model "${name}" created successfully with ID: ${newModel.id}`);
  } catch (error) {
    PolicySynthAgentBase.logger.error(`Error adding AI model "${name}":`, error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 13) {
  PolicySynthAgentBase.logger.error(
    "Usage: ts-node addAiModelSeed.ts <name> <organizationId> <userId> <type> <modelSize> <provider> <costInTokensPerMillion> <costOutTokensPerMillion> <currency> <maxTokensOut> <defaultTemperature> <model> <active>"
  );
  process.exit(1);
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

// Validate and convert arguments
if (!Object.values(PsAiModelType).includes(type as PsAiModelType)) {
  PolicySynthAgentBase.logger.error("Invalid AI model type");
  process.exit(1);
}

if (!Object.values(PsAiModelSize).includes(modelSize as PsAiModelSize)) {
  PolicySynthAgentBase.logger.error("Invalid AI model size");
  process.exit(1);
}

// Run the function
addAiModel(
  name,
  Number(organizationId),
  Number(userId),
  type as PsAiModelType,
  modelSize as PsAiModelSize,
  provider,
  Number(costInTokensPerMillion),
  Number(costOutTokensPerMillion),
  Number(costInCachedContextTokensPerMillion),
  currency,
  Number(maxTokensOut),
  Number(defaultTemperature),
  model,
  active === "true"
);