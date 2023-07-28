import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import { Configuration, OpenAIApi } from "openai";
import axios from 'axios';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
const cloudflareProxy = 'cps-images.citizens.is';
export class CreateSolutionImagesProcessor extends BaseProcessor {
    renderCurrentSolution(solution) {
        return `
      Solution:

      Title: ${solution.title}
      Description: ${solution.description}

      How Solution Can Help: ${solution.mainBenefitOfSolution}
      Main Obstacles to Solution Adoption: ${solution.mainObstacleToSolutionAdoption}
    `;
    }
    async downloadImage(imageUrl, imageFilePath) {
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
        });
        const writer = fs.createWriteStream(imageFilePath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }
    async uploadImageToS3(bucket, filePath, key) {
        const s3 = new AWS.S3();
        const fileContent = fs.readFileSync(filePath);
        const params = {
            Bucket: bucket,
            Key: key,
            Body: fileContent,
            ACL: 'public-read',
            ContentType: 'image/png',
            ContentDisposition: 'inline'
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
    async renderCreatePrompt(subProblemIndex, solution) {
        const messages = [
            new SystemChatMessage(`
        You are an expert in generating Dalle-2 prompts from titles and descriptions of solutions.

        Important Instructions:
        1. Always end all prompts with "Drawn in a geometric style using hues of teal and gold. No text."
        2. Be visual and detailed in your prompts.
        3. Keep the prompt length to maximum of one or two sentences.
        4. Do not include quotes in your prompt.
        5. Follow the Dalle-2 Prompt Guide in your work.
        5. Output only your Dalle-2 prompt, nothing else.
        6. Think step by step.

        Dalle-2 Prompt Guide:
        For successful Dall-E 2 prompts, detail is key. Instead of general descriptions like "a cat," make it specific such as “a gray tabby cat on a sunny windowsill.” Detailed prompts yield more accurate images.

        Use adjectives and adverbs for richer prompts. Instead of “a car,” specify it as “a shiny red sports car on a winding road,” to portray color, style, and setting.

        While detail and creativity are crucial, keep your prompts concise. Limit your prompts to one or two essential details for the model to generate images quickly and accurately.`),
            new HumanChatMessage(`
         Solution:
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
                    size: '512x512'
                });
                if (result) {
                    this.logger.debug(`Result: ${result}`);
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
                const sleepingFor = 5000 + (retryCount * 10000);
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
            const solutions = this.memory.subProblems[subProblemIndex].solutions.populations[this.currentPopulationIndex(subProblemIndex)];
            for (let solutionIndex = 0; solutionIndex < solutions.length; solutionIndex++) {
                this.logger.info(`Creating images for solution ${solutionIndex}/${solutions.length} of sub problem ${subProblemIndex} (${this.currentPopulationIndex(subProblemIndex)})`);
                const solution = this.memory.subProblems[subProblemIndex].solutions.populations[this.currentPopulationIndex(subProblemIndex)][solutionIndex];
                this.logger.debug(solution.title);
                if (true || !solution.imageUrl) {
                    let imagePrompt = (await this.callLLM("create-solution-images", IEngineConstants.createProsConsModel, await this.renderCreatePrompt(subProblemIndex, solution), false));
                    this.logger.debug(`subProblemIndex ${subProblemIndex} solutionIndex ${solutionIndex} currentPopulationIndex ${this.currentPopulationIndex(subProblemIndex)}}`);
                    this.logger.debug(`Image Prompt: ${imagePrompt}`);
                    const imageUrl = await this.getImageUrlFromPrompt(imagePrompt);
                    // Download image and save it to /tmp folder
                    const imageFilePath = path.join('/tmp', `${subProblemIndex}_${this.currentPopulationIndex(subProblemIndex)}_${solutionIndex}.png`);
                    await this.downloadImage(imageUrl, imageFilePath);
                    this.logger.debug(fs.existsSync(imageFilePath) ? 'File downloaded successfully.' : 'File download failed.');
                    // Upload image to S3
                    const s3ImagePath = `projects/1/solutions/images/${subProblemIndex}/${this.currentPopulationIndex(subProblemIndex)}/${solutionIndex}.png`;
                    await this.uploadImageToS3(process.env.S3_BUCKET_NAME, imageFilePath, s3ImagePath);
                    const newImageUrl = `${cloudflareProxy}/${s3ImagePath}`;
                    solution.imageUrl = newImageUrl;
                    console.log(`New Image URL: ${newImageUrl}`);
                    this.logger.debug(`Image URL: ${imageUrl}`);
                }
                else {
                    this.logger.debug(`Solution already has image URL ${solution.imageUrl}`);
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
