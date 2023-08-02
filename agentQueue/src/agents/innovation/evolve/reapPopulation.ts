import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";

export class ReapSolutionsProcessor extends BaseProcessor {
  async renderReapPrompt(solutionsToFilter: IEngineSolutionForReapInputData[]) {
    const messages = [
      new SystemChatMessage(
        `
        You are an expert in filtering out non-viable solution components to problems, if needed.

        Instructions:
        1. You will be provided an array of solution components in JSON format.
        2. You will output a list of titles, exactly like the original, of the solutions you wish to filter out, as a JSON Array: [ { title } ]
        3. Sometimes no solution components need to be filtered out.
        4. If you do not need to filter out any solution components, return an empty JSON Array: []
        5. Review the "Important Instructions" below for further instructions.
        ${
          this.memory.customInstructions.reapSolutions
            ? `
        Important Instructions: ${this.memory.customInstructions.reapSolutions}
        `
            : ""
        }

        Think step by step.
                `
      ),
      new HumanChatMessage(
        `${JSON.stringify(solutionsToFilter, null, 2)}

        The solution components to filter out in a JSON Array:
        `
      ),
    ];
    return messages;
  }

  async reapSolutionsForSubProblem(
    subProblemIndex: number,
    solutions: Array<IEngineSolution>
  ): Promise<void> {
    this.logger.info(`Reaping solution components for subproblem ${subProblemIndex}`);

    this.logger.info(`Initial population size: ${solutions.length}`);

    const chunkSize = 4;
    const chunks = solutions.reduce(
      (
        resultArray: Array<Array<IEngineSolution>>,
        item: IEngineSolution,
        index: number
      ) => {
        const chunkIndex = Math.floor(index / chunkSize);
        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = []; // new chunk
        }
        resultArray[chunkIndex].push(item);
        return resultArray;
      },
      []
    );



    this.logger.debug(`Chunks: ${chunks.length}`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const solutionsToFilter: IEngineSolutionForReapInputData[] = chunk.map(solution => {
        return {
          title: solution.title,
          description: solution.description
        }
      });

      this.logger.debug(`Solution Components (${i+1}/${chunks.length}) going into LLM ${solutionsToFilter.length}`);

      const reapedData: Array<IEngineSolutionForReapReturnData> = await this.callLLM(
        "evolve-reap-population",
        IEngineConstants.reapSolutionsModel,
        await this.renderReapPrompt(solutionsToFilter)
      );

      for (let j = 0; j < solutionsToFilter.length; j++) {
        if (reapedData.some(reapedItem => reapedItem.title === solutionsToFilter[j].title)) {
          chunk[j].reaped = true;
          this.logger.info(`Reaped solution: ${solutionsToFilter[j].title}`);
        }
      }
    }

    const afterSize = solutions.filter(solution => !solution.reaped).length;
    this.logger.info(`Population size after reaping: ${afterSize}`);
  }

  async reapSolutions() {
    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      IEngineConstants.maxSubProblems
    );

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        const solutions =
          this.memory.subProblems[subProblemIndex].solutions.populations[
            this.lastPopulationIndex(subProblemIndex)
          ];

        await this.reapSolutionsForSubProblem(subProblemIndex, solutions);

        // Delete reaped solutions after reaping
        const viableSolutions = solutions.filter(solution => !solution.reaped);
        this.memory.subProblems[subProblemIndex].solutions.populations[
          this.lastPopulationIndex(subProblemIndex)
        ] = viableSolutions;

        this.logger.info(`Population size after deletion of reaped solutions: ${viableSolutions.length}`);

        await this.saveMemory();
      }
    );

    await Promise.all(subProblemsPromises);

    this.logger.info("Finished Reaping for all");
  }

  async process() {
    this.logger.info("Reap Solution Components Processor");
    super.process();

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.reapSolutionsModel.temperature,
      maxTokens: IEngineConstants.reapSolutionsModel.maxOutputTokens,
      modelName: IEngineConstants.reapSolutionsModel.name,
      verbose: IEngineConstants.reapSolutionsModel.verbose,
    });

    try {
      await this.reapSolutions();
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
