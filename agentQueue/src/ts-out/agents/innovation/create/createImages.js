import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
const engineId = "stable-diffusion-xl-1024-v1-0";
const apiHost = process.env.API_HOST ?? "https://api.stability.ai";
const apiKey = process.env.STABILITY_API_KEY;
export class CreateSolutionImagesProcessor extends BaseProcessor {
    cloudflareProxy = "https://cps-images.citizens.is";
    subProblemColors = [
        "blue",
        "orange",
        "yellow",
        "green",
        "red",
        "indigo",
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
        "transparent",
    ];
    secondaryColors = [
        "gold",
        "silver",
        "bronze",
        "copper",
        "brass",
        "steel",
        "pewter",
    ];
    async downloadImage(imageUrl, imageFilePath) {
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
    async downloadStabilityImage(subProblemIndex, imagePrompt, imageFilePath, solution = undefined) {
        let response;
        let retryCount = 0;
        let retrying = true;
        while (retrying && retryCount < IEngineConstants.maxStabilityRetryCount) {
            try {
                response = await axios.post(`${apiHost}/v1/generation/${engineId}/text-to-image`, {
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
                    style_preset: "digital-art",
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                });
                const responseJSON = response.data;
                responseJSON.artifacts.forEach((image, index) => {
                    if (index === 0 && image) {
                        fs.writeFileSync(imageFilePath, Buffer.from(image.base64, "base64"));
                    }
                });
                retrying = false; // Only change retrying to false if there is a result.
            }
            catch (error) {
                this.logger.warn("Error generating image, retrying...");
                this.logger.warn(error.stack);
                retryCount++;
                //this.logger.warn(error);
                const sleepingFor = 5000 + retryCount * 10000;
                this.logger.debug(`Sleeping for ${sleepingFor} milliseconds`);
                await new Promise((resolve) => setTimeout(resolve, sleepingFor));
                if (retryCount > 2 && solution) {
                    imagePrompt = (await this.callLLM("create-solution-images", IEngineConstants.createSolutionImagesModel, await this.renderCreatePrompt(subProblemIndex, solution), false));
                }
            }
        }
        if (!response) {
            this.logger.error(`Non-200 response after ${retryCount} retries.`);
            return false;
        }
        else {
            return true;
        }
    }
    async uploadImageToS3(bucket, filePath, key) {
        const s3 = new AWS.S3();
        const fileContent = fs.readFileSync(filePath);
        const params = {
            Bucket: bucket,
            Key: key,
            Body: fileContent,
            ACL: "public-read",
            ContentType: "image/png",
            ContentDisposition: "inline",
        };
        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                fs.unlinkSync(filePath); // Deleting file from local storage
                //console.log(`Upload response: ${JSON.stringify(data)}`);
                resolve(data);
            });
        });
    }
    get randomSecondaryColor() {
        let secondaryColors;
        if (this.memory.customInstructions.secondaryColors) {
            secondaryColors = this.memory.customInstructions.secondaryColors;
        }
        else {
            secondaryColors = this.secondaryColors;
        }
        const randomSecondaryColorIndex = Math.floor(Math.random() * secondaryColors.length);
        return secondaryColors[randomSecondaryColorIndex];
    }
    getSubProblemColor(subProblemIndex) {
        if (this.memory.customInstructions.subProblemColors) {
            return this.memory.customInstructions.subProblemColors[subProblemIndex];
        }
        else {
            return this.subProblemColors[subProblemIndex];
        }
    }
    async renderCreatePrompt(subProblemIndex, solution) {
        const messages = [
            new SystemChatMessage(`
        You are an expert in generating Dall-E 2 prompts from titles and descriptions of solution components.

        Important Instructions:
        1. Always end all prompts with "Simple professional geometric illustration using hues of ${this.getSubProblemColor(subProblemIndex)} and ${this.randomSecondaryColor}. No text."
        2. Be visual and detailed in your prompts.
        3. Keep the prompt length to maximum of one to two sentences, never more.
        4. Do not include quotes in your prompt.
        5. Follow the Dall-E 2 Prompt Guide in your work.
        5. Output only your Dall-E 2 prompt, nothing else.
        6. Think step by step.

        Dall-E 2 Prompt Guide:
        For successful Dall-E 2 prompts, detail is key. Instead of general descriptions like "a cat," make it specific such as “a gray tabby cat on a sunny windowsill.” Detailed prompts yield more accurate images.

        Use adjectives and adverbs for richer prompts. Instead of “a car,” specify it as “a shiny red sports car on a winding road,” to portray color, style, and setting.

        While detail and creativity are crucial, keep your prompts concise. Limit your prompts to one or two essential details for the model to generate images quickly and accurately.
        `),
            new HumanChatMessage(`
         Solution component:
         ${solution.title}
         ${solution.description}

         Generate and output the Dall-E 2 image prompt below:
         `),
        ];
        return messages;
    }
    async getImageUrlFromPrompt(prompt) {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        4;
        const client = new OpenAIApi(configuration);
        let retryCount = 0;
        let retrying = true; // Initialize as true
        let result;
        while (retrying && retryCount < IEngineConstants.maxDalleRetryCount) {
            try {
                result = await client.createImage({
                    prompt,
                    size: "512x512",
                });
                if (result) {
                    retrying = false; // Only change retrying to false if there is a result.
                }
                else {
                    this.logger.debug(`Result: NONE`);
                }
            }
            catch (error) {
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
            const imageURL = result.data.data[0].url;
            if (!imageURL)
                throw new Error("Error getting generated image");
            return imageURL;
        }
        else {
            this.logger.error(`Error generating image after ${retryCount} retries`);
            return undefined;
        }
    }
    async createImages() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const solutions = this.getActiveSolutionsLastPopulation(subProblemIndex);
            for (let solutionIndex = 0; solutionIndex < solutions.length; solutionIndex++) {
                this.logger.info(`Creating images for solution ${solutionIndex}/${solutions.length} of sub problem ${subProblemIndex} (${this.lastPopulationIndex(subProblemIndex)})`);
                const solution = solutions[solutionIndex];
                this.logger.debug(solution.title);
                if (!solution.imageUrl ||
                    solution.imageUrl.includes("windows.net/private")) {
                    let imagePrompt;
                    if (solution.imagePrompt) {
                        imagePrompt = solution.imagePrompt;
                        this.logger.debug(`Using existing image prompt: ${imagePrompt}`);
                    }
                    else {
                        imagePrompt = (await this.callLLM("create-solution-images", IEngineConstants.createSolutionImagesModel, await this.renderCreatePrompt(subProblemIndex, solution), false));
                    }
                    solution.imagePrompt = imagePrompt;
                    this.logger.debug(`subProblemIndex ${subProblemIndex} solutionIndex ${solutionIndex} lastPopulationIndex ${this.lastPopulationIndex(subProblemIndex)}}`);
                    this.logger.debug(`Image Prompt: ${imagePrompt}`);
                    let newImageUrl;
                    const imageFilePath = path.join("/tmp", `${subProblemIndex}_${this.lastPopulationIndex(subProblemIndex)}_${solutionIndex}.png`);
                    const s3ImagePath = `projects/1/solutions/images/${subProblemIndex}/${this.lastPopulationIndex(subProblemIndex)}/${solutionIndex}_v3.png`;
                    let gotImage;
                    if (process.env.STABILITY_API_KEY) {
                        gotImage = await this.downloadStabilityImage(subProblemIndex, imagePrompt, imageFilePath, solution);
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
                        solution.imageUrl = newImageUrl;
                        this.logger.debug(`New Image URL: ${newImageUrl}`);
                    }
                    else {
                        this.logger.error("Error getting image");
                    }
                }
                await this.saveMemory();
            }
        });
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished creating images for all");
    }
    async process() {
        this.logger.info("Create Images Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.createSolutionImagesModel.temperature,
            maxTokens: IEngineConstants.createSolutionImagesModel.maxOutputTokens,
            modelName: IEngineConstants.createSolutionImagesModel.name,
            verbose: IEngineConstants.createSolutionImagesModel.verbose,
        });
        try {
            await this.createImages();
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
