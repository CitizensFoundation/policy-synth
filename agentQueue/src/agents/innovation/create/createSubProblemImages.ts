import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import { Configuration, ImagesResponse, OpenAIApi } from "openai";
import { AxiosResponse } from "axios";
import axios from "axios";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { CreateSolutionImagesProcessor } from "./createImages.js";

export class CreateSubProblemImagesProcessor extends CreateSolutionImagesProcessor {
  async renderCreatePrompt(subProblemIndex: number) {
    const messages = [
      new SystemChatMessage(
        `
        You are an expert in generating visual Dalle-2 prompts from a problem statement.

        Important Instructions:
        1. Always end all prompts with "Simple professional geometric illustration using hues of ${this.getSubProblemColor(
          subProblemIndex
        )} and ${this.randomSecondaryColor}. No text."
        2. Be visual and detailed in your prompts.
        3. Keep the prompt length to maximum of one or two sentences.
        4. Do not include quotes in your prompt.
        5. Never output prompts involving chess or chess pieces.
        6. Never output prompts involving asking for text to be written out, like on a document.
        7. Follow the Dalle-2 Prompt Guide in your work.
        8. Output only your Dalle-2 prompt, nothing else.
        9. Let's think step by step.

        Dalle-2 Prompt Guide:
        For successful Dall-E 2 prompts, detail is key. Instead of general descriptions like "a cat," make it specific such as “a gray tabby cat on a sunny windowsill.” Detailed prompts yield more accurate images.

        Use adjectives and adverbs for richer prompts. Instead of “a car,” specify it as “a shiny red sports car on a winding road,” to portray color, style, and setting.

        While detail and creativity are crucial, keep your prompts concise. Limit your prompts to one or two essential details for the model to generate images quickly and accurately.`
      ),
      new HumanChatMessage(
        `
         Problem:
         ${this.renderSubProblem(subProblemIndex)}

         Generate and output the Dall-E 2 image prompt below:
         `
      ),
    ];

    return messages;
  }

  async createSubProblemImages() {
    this.currentSubProblemIndex = 0;

    for (let s = 0; s < this.memory.subProblems.length; s++) {
      this.currentSubProblemIndex = s;

      if (!this.memory.subProblems[s].imageUrl) {
        let imagePrompt = (await this.callLLM(
          "create-sub-problem-images",
          IEngineConstants.createSolutionImagesModel,
          await this.renderCreatePrompt(s),
          false
        )) as string;

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
    this.logger.info("Create Sub Problem Processor");

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.createSolutionImagesModel.temperature,
      maxTokens: IEngineConstants.createSolutionImagesModel.maxOutputTokens,
      modelName: IEngineConstants.createSolutionImagesModel.name,
      verbose: IEngineConstants.createSolutionImagesModel.verbose,
    });

    try {
      await this.createSubProblemImages();
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
