import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import fs from "fs";
import path from "path";
import { CreateSolutionImagesProcessor } from "../../solutions/create/createImages.js";
const recreateImagesNeeded = true;
export class CreateSubProblemImagesProcessor extends CreateSolutionImagesProcessor {
    async renderCreatePrompt(subProblemIndex) {
        const messages = [
            new SystemMessage(`
        You are an expert in generating visual Dalle-3 prompts from a problem statement.

        Important Instructions:
        1. Always end all prompts with "Simple vector art illustration using these colors: ${this.getSubProblemColor(subProblemIndex)} and ${this.randomSecondaryColor}. No text or labels."
        2. Be highly visual, creative and detailed in your prompts.
        3. Keep the prompt length to maximum of two or three sentences.
        4. Do not include quotes in your prompt.
        5. Never output prompts involving chess or chess pieces.
        6. Never output prompts involving asking for text to be written out, like on a document.
        7. Output only your Dalle-3 prompt, nothing else.
        8. Let's think step by step.`),
            new HumanMessage(`
         Problem:
         ${this.renderSubProblem(subProblemIndex)}

         Generate and output the Dalle 3 image prompt below:
         `),
        ];
        return messages;
    }
    async createSubProblemImages() {
        this.currentSubProblemIndex = 0;
        for (let s = 0; s < this.memory.subProblems.length; s++) {
            this.currentSubProblemIndex = s;
            if (recreateImagesNeeded || !this.memory.subProblems[s].imageUrl) {
                let imagePrompt = (await this.callLLM("create-sub-problem-images", IEngineConstants.createSolutionImagesModel, await this.renderCreatePrompt(s), false));
                this.memory.subProblems[s].imagePrompt = imagePrompt;
                this.logger.debug(`subProblemIndex ${s}`);
                this.logger.debug(`Image Prompt: ${imagePrompt}`);
                // Download image and save it to /tmp folder
                const imageFilePath = path.join("/tmp", `subProblem_${s}_.png`);
                if (process.env.STABILITY_API_KEY) {
                    await this.downloadStabilityImage(s, imagePrompt, imageFilePath);
                }
                else {
                    const imageUrl = await this.getImageUrlFromPrompt(imagePrompt);
                    await this.downloadImage(imageUrl, imageFilePath);
                }
                this.logger.debug(fs.existsSync(imageFilePath)
                    ? "File downloaded successfully."
                    : "File download failed.");
                const randomNum = Math.floor(Math.random() * 1e10);
                const s3ImagePath = `projects/${this.memory.groupId}/subProblems/images/${s}_${randomNum}.png`;
                await this.uploadImageToS3(process.env.S3_BUCKET_NAME, imageFilePath, s3ImagePath);
                const newImageUrl = `${this.cloudflareProxy}/${s3ImagePath}`;
                this.memory.subProblems[s].imageUrl = newImageUrl;
                this.logger.debug(`New Image URL: ${newImageUrl}`);
            }
            await this.saveMemory();
        }
        this.logger.info("Finished creating Sub Problem images for all");
    }
    async process() {
        this.logger.info("Create Sub Problem Processor");
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.createSolutionImagesModel.temperature,
            maxTokens: IEngineConstants.createSolutionImagesModel.maxOutputTokens,
            modelName: IEngineConstants.createSolutionImagesModel.name,
            verbose: IEngineConstants.createSolutionImagesModel.verbose,
        });
        try {
            await this.createSubProblemImages();
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
//# sourceMappingURL=createSubProblemImages.js.map