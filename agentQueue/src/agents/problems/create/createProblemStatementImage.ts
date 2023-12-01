import { BaseProcessor } from "../../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
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
        1. Always end all prompts with "Simple but Hyperrealistic Image. No text or labels."
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

  async createProblemStatementImage() {
    let imagePrompt = (await this.callLLM(
      "create-problem-statement-image",
      IEngineConstants.createSolutionImagesModel,
      await this.renderCreatePrompt(),
      false
    )) as string;

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
      temperature: IEngineConstants.createSolutionImagesModel.temperature,
      maxTokens: IEngineConstants.createSolutionImagesModel.maxOutputTokens,
      modelName: IEngineConstants.createSolutionImagesModel.name,
      verbose: IEngineConstants.createSolutionImagesModel.verbose,
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
