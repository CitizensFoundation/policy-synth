import fs from "fs";
import path from "path";
import { CreateSolutionImagesAgent } from "../../solutions/create/createImages.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";

const recreateImagesNeeded = true;

export class CreateSubProblemImagesAgent extends CreateSolutionImagesAgent {
  async renderCreatePrompt(subProblemIndex: number) {
    const messages = [
      this.createSystemMessage(
        `
        You are an expert in generating visual Dalle-3 prompts from a problem statement.

        Important Instructions:
        1. Always end all prompts with "Simple vector art illustration using these colors: ${this.getSubProblemColor(
          subProblemIndex
        )} and ${this.randomSecondaryColor}. No text or labels."
        2. Be highly visual, creative and detailed in your prompts.
        3. Keep the prompt length to maximum of two or three sentences.
        4. Do not include quotes in your prompt.
        5. Never output prompts involving chess or chess pieces.
        6. Never output prompts involving asking for text to be written out, like on a document.
        7. Output only your Dalle-3 prompt, nothing else.
        8. Let's think step by step.`
      ),
      this.createHumanMessage(
        `
         Problem:
         ${this.renderSubProblem(subProblemIndex)}

         Generate and output the Dalle 3 image prompt below:
         `
      ),
    ];

    return messages;
  }

  getDalleImagePrompt(subProblemIndex: number) {
    return `Topic (do not reference directly in the prompt you create):
${this.memory.subProblems[subProblemIndex].title}
Image style: very simple abstract geometric cartoon with max 3 items in the image using those colors ${this.getSubProblemColor(
      subProblemIndex
    )} and ${this.randomSecondaryColor}. Use a very light variation of ${this.getSubProblemColor(
      subProblemIndex!
    )} for the background.`;
  }

  async createSubProblemImages() {
    this.currentSubProblemIndex = 0;

    for (let s = 0; s < this.memory.subProblems.length; s++) {
      this.currentSubProblemIndex = s;

      if (recreateImagesNeeded || !this.memory.subProblems[s].imageUrl) {
        let imagePrompt;
        if (process.env.STABILITY_API_KEY) {
          imagePrompt = (await this.callModel(
            PsAiModelType.Text,
            PsAiModelSize.Medium,
            await this.renderCreatePrompt(s),
            false
          )) as string;
        } else {
          imagePrompt = this.getDalleImagePrompt(s);
        }

        this.memory.subProblems[s].imagePrompt = imagePrompt;

        this.logger.debug(`subProblemIndex ${s}`);

        this.logger.debug(`Image Prompt: ${imagePrompt}`);

        // Download image and save it to /tmp folder
        const imageFilePath = path.join("/tmp", `subProblem_${s}_.png`);

        if (process.env.STABILITY_API_KEY) {
          await this.downloadStabilityImage(s, imagePrompt, imageFilePath);
        } else {
          const imageUrl = await this.getImageUrlFromPrompt(imagePrompt);
          await this.downloadImage(imageUrl, imageFilePath);
        }

        this.logger.debug(
          fs.existsSync(imageFilePath)
            ? "File downloaded successfully."
            : "File download failed."
        );

        const randomNum = Math.floor(Math.random() * 1e10);
        const s3ImagePath = `projects/${this.memory.groupId}/subProblems/images/${s}_${randomNum}.png`;
        await this.uploadImageToS3(
          process.env.S3_BUCKET_NAME!,
          imageFilePath,
          s3ImagePath
        );

        const newImageUrl = `${this.cloudflareProxy}/${s3ImagePath}`;

        this.memory.subProblems[s].imageUrl = newImageUrl;

        this.logger.debug(`New Image URL: ${newImageUrl}`);
      }

      await this.saveMemory();
    }

    this.logger.info("Finished creating Sub Problem images for all");
  }

  async process() {
    this.logger.info("Create Sub Problem Agent");

    try {
      await this.createSubProblemImages();
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
