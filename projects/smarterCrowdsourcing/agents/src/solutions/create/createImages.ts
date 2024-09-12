import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
import { OpenAI } from "openai";
import axios from "axios";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import { Colors } from "discord.js";

const engineId = "stable-diffusion-xl-1024-v1-0";
const apiHost = process.env.API_HOST ?? "https://api.stability.ai";
const apiKey = process.env.STABILITY_API_KEY;

interface GenerationResponse {
  artifacts: Array<{
    base64: string;
    seed: number;
    finishReason: string;
  }>;
}

export class CreateSolutionImagesAgent extends SolutionsEvolutionSmarterCrowdsourcingAgent {
  cloudflareProxy = "https://cps-images.citizens.is";

  async downloadImage(imageUrl: string, imageFilePath: string) {
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(imageFilePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }

  async downloadStabilityImage(
    subProblemIndex: number,
    imagePrompt: string,
    imageFilePath: string,
    solutionOrPolicy: PsSolution | PSPolicy | undefined = undefined,
    stylePreset:
      | "digital-art"
      | "low-poly"
      | "pixel-art"
      | "sketch" = "digital-art"
  ) {
    let response;

    let retryCount = 0;
    let retrying = true;

    while (retrying && retryCount < this.maxStabilityRetryCount) {
      try {
        response = await axios.post(
          `${apiHost}/v1/generation/${engineId}/text-to-image`,
          {
            text_prompts: [
              {
                text: imagePrompt,
              },
            ],
            cfg_scale: 7,
            height: 768,
            width: 1344,
            steps: 50,
            samples: 1,
            style_preset: stylePreset,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );

        const responseJSON = response.data as GenerationResponse;
        responseJSON.artifacts.forEach((image, index) => {
          if (index === 0 && image) {
            fs.writeFileSync(
              imageFilePath,
              Buffer.from(image.base64, "base64")
            );
          }
        });

        retrying = false; // Only change retrying to false if there is a result.
      } catch (error: any) {
        this.logger.warn("Error generating image, retrying...");
        this.logger.warn(error.stack);
        retryCount++;
        //this.logger.warn(error);
        let sleepingFor: number;

        if (error.message && error.message.indexOf("400") > -1) {
          if (retryCount > 3) {
            imagePrompt = (await this.callModel(
              PsAiModelType.Text,
              PsAiModelSize.Medium,
              await this.renderCreatePrompt(
                subProblemIndex,
                solutionOrPolicy!,
                "8. Make it very simple and colorful with no complicated ideas or details."
              ),
              false
            )) as string;
            this.logger.debug(`New (altered) Image Prompt: ${imagePrompt}`);
            sleepingFor = 2500 + retryCount * 1500;
          } else {
            imagePrompt = (await this.callModel(
              PsAiModelType.Text,
              PsAiModelSize.Medium,
              await this.renderCreatePrompt(subProblemIndex, solutionOrPolicy!),
              false
            )) as string;
            this.logger.debug(`New Image Prompt: ${imagePrompt}`);
          }
          sleepingFor = 2500 + retryCount * 1000;
        } else {
          sleepingFor = 5000 + retryCount * 10000;
        }

        this.logger.debug(`Sleeping for ${sleepingFor} milliseconds`);
        await new Promise((resolve) => setTimeout(resolve, sleepingFor));
      }
    }

    if (!response) {
      this.logger.error(`Non-200 response after ${retryCount} retries.`);
      return false;
    } else {
      return true;
    }
  }

  async uploadImageToS3(bucket: string, filePath: string, key: string) {
    const s3 = new AWS.S3();
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ACL: "public-read", // Makes sure the uploaded files are publicly accessible
      ContentType: "image/png",
      ContentDisposition: "inline",
    };

    return new Promise((resolve, reject) => {
      s3.upload(params, (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        fs.unlinkSync(filePath); // Deleting file from local storage
        //console.log(`Upload response: ${JSON.stringify(data)}`);
        resolve(data);
      });
    });
  }

  staticSecondaryColors = [
    "gold",
    "silver",
    "bronze",
    "copper",
    "brass",
    "steel",
    "pewter",
  ];

  get randomSecondaryColor() {
    let secondaryColors = this.staticSecondaryColors;

    /*if (this.secondaryColors) {
      secondaryColors = this.secondaryColors;
    } else {
      secondaryColors = this.secondaryColors;
    }*/

    const randomSecondaryColorIndex = Math.floor(
      Math.random() * secondaryColors.length
    );

    return secondaryColors[randomSecondaryColorIndex];
  }

  staticColors = [
    "orange",
    "blue",
    "yellow",
    "green",
    "light blue",
    "red",
    "violet",
    "sea Green",
    "saddle Brown",
    "chocolate",
    "fire Brick",
    "orange Red",
    "yellow Green",
    "gold",
    "dark Khaki",
    "dark Magenta",
    "dark Violet",
    "wheat",
    "forest Green",
    "tan",
    "gray",
  ];

  getSubProblemColor(subProblemIndex: number) {
    return this.staticColors[subProblemIndex];

    let color: string;
    if (this.subProblemColors) {
      try {
        if (typeof this.subProblemColors === "string") {
          color = JSON.parse(this.subProblemColors)[subProblemIndex];
        } else {
          color = this.subProblemColors[subProblemIndex];
        }
      } catch (error: any) {
        this.logger.error(error);
        color = this.staticColors[subProblemIndex];
      }
    } else {
      color = "#1F10fa";
    }

    return Colors;
  }

  async renderCreatePrompt(
    subProblemIndex: number,
    solution: PsSolution | PSPolicy,
    injectText?: string
  ) {
    const messages = [
      this.createSystemMessage(
        `
        You are an expert in generating Dall-E 3 prompts from titles and descriptions of solution components.

        Important Instructions:
        1. Always end all prompts with "Simple and vibrant vector art illustration using these colors: ${this.getSubProblemColor(
          subProblemIndex
        )} and highlights ${this.randomSecondaryColor}. No text or labels."
        2. Be visual and detailed in your prompts.
        3. Keep the prompt length to maximum of one to two sentences, never more.
        4. Do not include quotes in your prompt.
        5. Never output prompts involving chess or chess pieces.
        6. Never output prompts involving asking for text to be written out, like on a document.
        7. No explanations are needed only output the prompt.
        8. Keep the images simple and vibrant with no complicated ideas or details or many people.
        ${injectText ? injectText : ""}`
      ),
      this.createHumanMessage(
        `
         Solution component:
         ${solution.title}
         ${solution.description}

         Generate and output the Dall-E 3 image prompt below:
         `
      ),
    ];

    return messages;
  }

  async getImageUrlFromPrompt(
    prompt: string,
    quality: "hd" | "standard" | undefined = "hd"
  ) {
    const configuration = {
      apiKey: process.env.OPENAI_API_KEY,
    };

    const client = new OpenAI(configuration);

    let retryCount = 0;
    let retrying = true; // Initialize as true
    let result: any;

    while (retrying && retryCount < this.maxDalleRetryCount) {
      try {
        result = await client.images.generate({
          model: "dall-e-3",
          prompt,
          n: 1,
          quality: quality,
          size: "1792x1024",
        });
        if (result) {
          retrying = false; // Only change retrying to false if there is a result.
        } else {
          this.logger.debug(`Result: NONE`);
        }
      } catch (error: any) {
        this.logger.warn("Error generating image, retrying...");
        this.logger.warn(error.stack);
        retryCount++;
        this.logger.warn(error);
        const sleepingFor = 5000 + retryCount * 10000;
        this.logger.debug(`Sleeping for ${sleepingFor} milliseconds`);
        await new Promise((resolve) => setTimeout(resolve, sleepingFor));
      }
    }

    if (result) {
      this.logger.debug(`Result: ${JSON.stringify(result)}`);
      const imageURL = result.data[0].url;
      if (!imageURL) throw new Error("Error getting generated image");
      return imageURL;
    } else {
      this.logger.error(`Error generating image after ${retryCount} retries`);
      return undefined;
    }
  }

  getDalleImagePrompt(
    subProblemIndex: number | undefined = undefined,
    solution: PsSolution | undefined = undefined
  ) {
    return `Topic (do not reference directly in the prompt you create):
${solution!.title}
Image style: very simple abstract geometric cartoon with max 3 items in the image using those colors ${this.getSubProblemColor(
      subProblemIndex!
    )} and ${
      this.randomSecondaryColor
    }. Use a very light variation of ${this.getSubProblemColor(
      subProblemIndex!
    )} for the background.`;
  }

  async createImages() {
    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      this.maxSubProblems
    );

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        const solutions =
          this.getActiveSolutionsLastPopulation(subProblemIndex);

        for (
          let solutionIndex = 0;
          solutionIndex < solutions.length;
          solutionIndex++
        ) {
          this.logger.info(
            `Creating images for solution ${solutionIndex}/${
              solutions.length
            } of sub problem ${subProblemIndex} (${this.lastPopulationIndex(
              subProblemIndex
            )})`
          );

          const solution = solutions[solutionIndex];

          this.logger.debug(solution.title);

          if (
            !solution.imageUrl ||
            solution.imageUrl.includes("windows.net/private")
          ) {
            let imagePrompt;

            if (solution.imagePrompt) {
              imagePrompt = solution.imagePrompt;
              this.logger.debug(`Using existing image prompt: ${imagePrompt}`);
            } else {
              if (process.env.STABILITY_API_KEY) {
                imagePrompt = (await this.callModel(
                  PsAiModelType.Text,
                  PsAiModelSize.Medium,
                  await this.renderCreatePrompt(subProblemIndex, solution),
                  false
                )) as string;
              } else {
                imagePrompt = this.getDalleImagePrompt(
                  subProblemIndex,
                  solution
                );
              }
            }

            solution.imagePrompt = imagePrompt;

            this.logger.debug(
              `subProblemIndex ${subProblemIndex} solutionIndex ${solutionIndex} lastPopulationIndex ${this.lastPopulationIndex(
                subProblemIndex
              )}}`
            );

            this.logger.debug(`Image Prompt: ${imagePrompt}`);

            let newImageUrl;

            const imageFilePath = path.join(
              "/tmp",
              `${subProblemIndex}_${this.lastPopulationIndex(
                subProblemIndex
              )}_${solutionIndex}.png`
            );
            const randomNum = Math.floor(Math.random() * 1e10);
            const s3ImagePath = `projects/${
              this.memory.groupId
            }/solutions/images/${subProblemIndex}/${this.lastPopulationIndex(
              subProblemIndex
            )}/${solutionIndex}_${randomNum}.png`;

            let gotImage;

            if (process.env.STABILITY_API_KEY) {
              gotImage = await this.downloadStabilityImage(
                subProblemIndex,
                imagePrompt,
                imageFilePath,
                solution
              );
            } else {
              const imageUrl = await this.getImageUrlFromPrompt(
                imagePrompt,
                //"standard"
              );
              await this.downloadImage(imageUrl, imageFilePath);
              gotImage = true;
            }

            if (gotImage) {
              this.logger.debug(
                fs.existsSync(imageFilePath)
                  ? "File downloaded successfully."
                  : "File download failed."
              );
              await this.uploadImageToS3(
                process.env.S3_BUCKET_NAME!,
                imageFilePath,
                s3ImagePath
              );

              if (process.env.DISABLE_CLOUDFLARE_IMAGE_PROXY) {
                newImageUrl = `https://${process.env
                  .S3_BUCKET_NAME!}.s3.amazonaws.com/${s3ImagePath}`;
              } else {
                newImageUrl = `${this.cloudflareProxy}/${s3ImagePath}`;
              }

              solution.imageUrl = newImageUrl;

              this.logger.debug(`New Image URL: ${newImageUrl}`);
            } else {
              this.logger.error("Error getting image");
            }
          } else {
            this.logger.debug(`Image URL already exists: ${solution.imageUrl}`);
          }

          this.scheduleMemorySave();
          this.checkLastMemorySaveError();
        }
      }
    );

    await Promise.all(subProblemsPromises);

    this.logger.info("Finished creating images for all");
  }

  async process() {
    this.logger.info("Create Images Agent");
    super.process();

    try {
      if (!this.skipImageCreation) {
        await this.createImages();
      } else {
        this.logger.info("Skipping Image Creation");
      }
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
