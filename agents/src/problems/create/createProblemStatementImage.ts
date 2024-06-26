import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PsConstants } from "../../constants.js";
import { AxiosResponse } from "axios";
import axios from "axios";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { CreateSolutionImagesProcessor } from "../../solutions/create/createImages.js";

export class CreateProblemStatementImageProcessor extends CreateSolutionImagesProcessor {
  override async renderCreatePrompt(subProblemIndex: number = 0) {
    const messages = [
      new SystemMessage(
        `
        You are an expert in generating visual Dalle-3 prompts from a problem statement.

        Important Instructions:
        1. Always end all prompts with "Professional vibrant vector art illustration with no text or labels."
        2. Be visual and detailed in your prompts.
        3. Keep the prompt length to maximum of two or three sentences.
        4. Do not include quotes in your prompt.
        5. Never output prompts involving chess or chess pieces.
        6. Never output prompts involving asking for text to be written out, like on a document.
        7. Output only your Dalle-3 prompt, nothing else.
        8. Never ask to generate something complex or with too many objects.
        9. Let's think step by step.
`
      ),
      new HumanMessage(
        `
         ${this.renderProblemStatement()}

         Generate and output the Dall-E 3 image prompt below:
         `
      ),
    ];

    return messages;
  }

  getDalleImagePrompt() {
    return `Topic (do not reference directly in the prompt you create):
${this.memory.problemStatement.description}
Image style: very simple abstract geometric cartoon with max 3 items in the image.`;
  }

  async createProblemStatementImage() {
    let imagePrompt;

    if (process.env.STABILITY_API_KEY) {
      imagePrompt = (await this.callLLM(
        "create-problem-statement-image",
        PsConstants.createSolutionImagesModel,
        await this.renderCreatePrompt(),
        false
      )) as string;
    } else {
      imagePrompt = this.getDalleImagePrompt();
    }

    this.memory.problemStatement.imagePrompt = imagePrompt;

    this.logger.debug(`Image Prompt: ${imagePrompt}`);

    // Download image and save it to /tmp folder
    const imageFilePath = path.join("/tmp", `problemStatement_.png`);

    if (process.env.STABILITY_API_KEY) {
      await this.downloadStabilityImage(
        -1,
        imagePrompt,
        imageFilePath,
        undefined
      );
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
    const s3ImagePath = `projects/${this.memory.groupId}/problemStatement/images/${randomNum}.png`;
    await this.uploadImageToS3(
      process.env.S3_BUCKET_NAME!,
      imageFilePath,
      s3ImagePath
    );

    const newImageUrl = `${this.cloudflareProxy}/${s3ImagePath}`;

    this.memory.problemStatement.imageUrl = newImageUrl;

    this.logger.debug(`New Image URL: ${newImageUrl}`);

    await this.saveMemory();

    this.logger.info("Finished creating problem statement image");
  }

  async process() {
    this.logger.info("Create Problem Statement Image Processor");

    this.chat = new ChatOpenAI({
      temperature: PsConstants.createSolutionImagesModel.temperature,
      maxTokens: PsConstants.createSolutionImagesModel.maxOutputTokens,
      modelName: PsConstants.createSolutionImagesModel.name,
      verbose: PsConstants.createSolutionImagesModel.verbose,
    });

    try {
      await this.createProblemStatementImage();
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
