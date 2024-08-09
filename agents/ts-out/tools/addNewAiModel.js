import { PsAiModel } from "../dbModels/aiModel.js";
import { initializeModels } from "../dbModels/index.js";
import { connectToDatabase } from "../dbModels/sequelize.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
async function deactivateExistingModels(name) {
    const existingModels = await PsAiModel.findAll({
        where: { name }
    });
    for (const model of existingModels) {
        model.configuration.active = false;
        model.changed("configuration", true);
        await model.save();
        console.log(`Deactivated existing model "${name}" with ID: ${model.id}`);
    }
}
async function addAiModel(name, organizationId, userId, type, modelSize, provider, costInTokensPerMillion, costOutTokensPerMillion, currency, maxTokensOut, defaultTemperature, model, active) {
    try {
        await connectToDatabase();
        await initializeModels();
        // Deactivate existing models with the same name
        await deactivateExistingModels(name);
        const configuration = {
            type,
            modelSize,
            provider,
            prices: {
                costInTokensPerMillion,
                costOutTokensPerMillion,
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
        console.log(`New AI Model "${name}" created successfully with ID: ${newModel.id}`);
    }
    catch (error) {
        console.error(`Error adding AI model "${name}":`, error);
    }
}
// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 13) {
    console.error("Usage: ts-node addAiModelSeed.ts <name> <organizationId> <userId> <type> <modelSize> <provider> <costInTokensPerMillion> <costOutTokensPerMillion> <currency> <maxTokensOut> <defaultTemperature> <model> <active>");
    process.exit(1);
}
const [name, organizationId, userId, type, modelSize, provider, costInTokensPerMillion, costOutTokensPerMillion, currency, maxTokensOut, defaultTemperature, model, active,] = args;
// Validate and convert arguments
if (!Object.values(PsAiModelType).includes(type)) {
    console.error("Invalid AI model type");
    process.exit(1);
}
if (!Object.values(PsAiModelSize).includes(modelSize)) {
    console.error("Invalid AI model size");
    process.exit(1);
}
// Run the function
addAiModel(name, Number(organizationId), Number(userId), type, modelSize, provider, Number(costInTokensPerMillion), Number(costOutTokensPerMillion), currency, Number(maxTokensOut), Number(defaultTemperature), model, active === "true");
//# sourceMappingURL=addNewAiModel.js.map