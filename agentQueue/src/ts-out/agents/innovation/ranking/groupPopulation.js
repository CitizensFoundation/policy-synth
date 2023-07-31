import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
export class ReapSolutionsProcessor extends BaseProcessor {
    async renderReapPrompt(solutionsToFilter) {
        const messages = [
            new SystemChatMessage(`
        You are an expert in filtering out non-viable solutions to problems.

        Instructions:
        1. You will be provided an array of solutions with an index and title in a JSON format: [ { index, title } ]
        2. You will output a list of indexes of all the solutions you wish to filter out as a JSON Array with index numbers: []
        2. Review the "Important Instructions" below for further instructions.

        ${this.memory.customInstructions.reapSolutions
                ? `
        Important Instructions: ${this.memory.customInstructions.reapSolutions}
        `
                : ""}

        Think step by step.
                `),
            new HumanChatMessage(`${JSON.stringify(solutionsToFilter, null, 2)}

        Your solutions to filter out in a JSON Array:
        `),
        ];
        return messages;
    }
    async reapSolutionsForSubProblem(subProblemIndex, solutions) {
        this.logger.info(`Reaping solutions for subproblem ${subProblemIndex}`);
        // Chunk solutions into arrays of 10
        const chunkSize = 10;
        const chunks = solutions.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / chunkSize);
            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = []; // new chunk
            }
            resultArray[chunkIndex].push(item);
            return resultArray;
        }, []);
        this.logger.debug(`Chunks: ${chunks.length}`);
        // Loop over each chunk
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const solutionsToFilter = chunk.map((solution, index) => ({
                index: index + i * chunkSize,
                title: solution.title,
            }));
            this.logger.debug(`Solutions going into LLM ${solutionsToFilter.length}`);
            const reapedIndexes = await this.callLLM("evolve-reap-population", IEngineConstants.reapSolutionsModel, await this.renderReapPrompt(solutionsToFilter));
            for (let j = 0; j < chunk.length; j++) {
                // If the LLM call returned the index of the solution, set the solution.reaped to true
                if (reapedIndexes.includes(j + i * chunkSize)) {
                    chunk[j].reaped = true;
                    this.logger.info(`Reaped solution: ${chunk[j].title}`);
                }
            }
        }
    }
    async reapSolutions() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const solutions = this.memory.subProblems[subProblemIndex].solutions.populations[this.lastPopulationIndex(subProblemIndex)];
            await this.reapSolutionsForSubProblem(subProblemIndex, solutions);
            await this.saveMemory();
        });
        // Wait for all subproblems to finish
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished Reaping for all");
    }
    async process() {
        this.logger.info("Reap Solutions Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.reapSolutionsModel.temperature,
            maxTokens: IEngineConstants.reapSolutionsModel.maxOutputTokens,
            modelName: IEngineConstants.reapSolutionsModel.name,
            verbose: IEngineConstants.reapSolutionsModel.verbose,
        });
        try {
            await this.reapSolutions();
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
