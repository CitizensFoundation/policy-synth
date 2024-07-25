import path from "path";
import fs from "fs";
import { CreateSolutionImagesAgent } from "../../solutions/create/createImages.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
export class CreatePolicyImagesAgent extends CreateSolutionImagesAgent {
    async renderCreatePolicyImagePrompt(subProblemIndex, policy, injectText) {
        const messages = [
            this.createSystemMessage(`
        You are an expert in generating Dall-E 2 prompts from titles and descriptions of policy components.

        Important Instructions:
        1. Always end all prompts with "Very high quality film advertisement using hues of ${this.getSubProblemColor(subProblemIndex)} and ${this.randomSecondaryColor}. No text."
        2. Be visual and detailed in your prompts.
        3. Keep the prompt length to maximum of two to three sentences, never more.
        4. Do not include quotes in your prompt.
        5. Never output prompts involving chess or chess pieces.
        6. Never output prompts involving asking for text to be written out, like on a document.
        7. Follow the Dall-E 2 Prompt Guide in your work.
        8. Output only your Dall-E 2 prompt, nothing else.
        9. Let's think step by step.
        ${injectText ? injectText : ""}

        Dall-E 2 Prompt Guide:
        For successful Dall-E 2 prompts, detail is key. Instead of general descriptions like "a cat," make it specific such as “a gray tabby cat on a sunny windowsill.” Detailed prompts yield more accurate images.

        Use adjectives and adverbs for richer prompts. Instead of “a car,” specify it as “a shiny red sports car on a winding road,” to portray color, style, and setting.

        While detail and creativity are crucial, keep your prompts concise. Limit your prompts to one or two essential details for the model to generate images quickly and accurately.
        `),
            this.createHumanMessage(`
         Solution component:
         ${policy.title}
         ${policy.description}

         Generate and output the Dall-E 2 image prompt below:
         `),
        ];
        return messages;
    }
    async createPolicyImages() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, this.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const policies = this.memory.subProblems[subProblemIndex].policies?.populations[this.memory.subProblems[subProblemIndex].policies.populations.length - 1];
            if (policies) {
                for (let policyIndex = 0; policyIndex < policies.length; policyIndex++) {
                    this.logger.info(`Creating images for policy ${policyIndex}/${policies.length} of sub problem ${subProblemIndex} (${this.lastPopulationIndex(subProblemIndex)})`);
                    const policy = policies[policyIndex];
                    this.logger.debug(policy.title);
                    if (!policy.imageUrl) {
                        let imagePrompt;
                        if (policy.imagePrompt) {
                            imagePrompt = policy.imagePrompt;
                            this.logger.debug(`Using existing image prompt: ${imagePrompt}`);
                        }
                        else {
                            imagePrompt = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, await this.renderCreatePolicyImagePrompt(subProblemIndex, policy), false));
                        }
                        policy.imagePrompt = imagePrompt;
                        this.logger.debug(`subProblemIndex ${subProblemIndex} policyIndex ${policyIndex} lastPopulationIndex ${this.lastPopulationIndex(subProblemIndex)}}`);
                        this.logger.debug(`Image Prompt: ${imagePrompt}`);
                        let newImageUrl;
                        const imageFilePath = path.join("/tmp", `${subProblemIndex}_policy_${this.lastPopulationIndex(subProblemIndex)}_${policyIndex}.png`);
                        const randomNum = Math.floor(Math.random() * 1e10);
                        const s3ImagePath = `projects/${this.memory.groupId}/policies/images/${subProblemIndex}/${this.lastPopulationIndex(subProblemIndex)}/${policyIndex}_${randomNum}.png`;
                        let gotImage;
                        if (process.env.STABILITY_API_KEY) {
                            gotImage = await this.downloadStabilityImage(subProblemIndex, imagePrompt, imageFilePath, policy, "low-poly");
                        }
                        else {
                            const imageUrl = await this.getImageUrlFromPrompt(imagePrompt);
                            await this.downloadImage(imageUrl, imageFilePath);
                        }
                        if (gotImage) {
                            this.logger.debug(fs.existsSync(imageFilePath)
                                ? "File downloaded successfully."
                                : "File download failed.");
                            await this.uploadImageToS3(process.env.S3_BUCKET_NAME, imageFilePath, s3ImagePath);
                            newImageUrl = `${this.cloudflareProxy}/${s3ImagePath}`;
                            policy.imageUrl = newImageUrl;
                            this.logger.debug(`New Image URL: ${newImageUrl}`);
                        }
                        else {
                            this.logger.error("Error getting image");
                        }
                    }
                    await this.saveMemory();
                }
            }
        });
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished creating policy images for all");
    }
    async process() {
        this.logger.info("Create Policy Images Agent");
        super.process();
        try {
            await this.createPolicyImages();
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
//# sourceMappingURL=createPolicyImages.js.map