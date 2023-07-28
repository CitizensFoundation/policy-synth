import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import { Configuration, OpenAIApi } from "openai";

export class CreateSolutionImagesProcessor extends BaseProcessor {
  renderCurrentSolution(solution: IEngineSolution) {
    return `
      Solution:

      Title: ${solution.title}
      Description: ${solution.description}

      How Solution Can Help: ${solution.mainBenefitOfSolution}
      Main Obstacles to Solution Adoption: ${solution.mainObstacleToSolutionAdoption}
    `;
  }

  async renderCreatePrompt(subProblemIndex: number, solution: IEngineSolution) {
    const messages = [
      new SystemChatMessage(
        `
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

        While detail and creativity are crucial, keep your prompts concise. Limit your prompts to one or two essential details for the model to generate images quickly and accurately.`
      ),
      new HumanChatMessage(
        `
         Solution:
         ${solution.title}
         ${solution.description}

         Generate and output the Dall-E 2 image prompt below:
         `
      ),
    ];

    return messages;
  }

  async getImageUrlFromPrompt(prompt: string) {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const client = new OpenAIApi(configuration);

    const result = await client.createImage({
      prompt,
      size: '512x512'
    });

    const imageURL = result.data.data[0].url;
    if (!imageURL) throw new Error("Error generating image");
    return imageURL;
  }

  async createImages() {
    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      IEngineConstants.maxSubProblems
    );

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        const solutions =
          this.memory.subProblems[subProblemIndex].solutions.populations[
            this.currentPopulationIndex(subProblemIndex)
          ];

        for (
          let solutionIndex = 0;
          solutionIndex < solutions.length;
          solutionIndex++
        ) {
          this.logger.info(
            `Creating images for solution ${solutionIndex}/${
              solutions.length
            } of sub problem ${subProblemIndex} currentPopulationIndex ${this.currentPopulationIndex(
              subProblemIndex
            )}`
          );

          const solution =
            this.memory.subProblems[subProblemIndex].solutions.populations[
              this.currentPopulationIndex(subProblemIndex)
            ][solutionIndex];

          this.logger.debug(solution.title);

          let imagePrompt = (await this.callLLM(
            "create-solution-images",
            IEngineConstants.createProsConsModel,
            await this.renderCreatePrompt(subProblemIndex, solution),
            false
          )) as string;

          this.logger.debug(
            `subProblemIndex ${subProblemIndex} solutionIndex ${solutionIndex} currentPopulationIndex ${this.currentPopulationIndex}`
          );

          this.logger.debug(`Image Prompt: ${imagePrompt}`);

          const imageUrl = await this.getImageUrlFromPrompt(imagePrompt);

          solution.imageUrl = imageUrl;

          this.logger.debug(`Image URL: ${imageUrl}`);

          await this.saveMemory();
        }
      }
    );

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
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
