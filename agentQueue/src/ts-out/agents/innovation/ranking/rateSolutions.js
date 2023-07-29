import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
export class RateSolutionsProcessor extends BaseProcessor {
    async renderReapPrompt(solutionsToFilter) {
        const messages = [
            new SystemChatMessage(`
        You are an expert in filtering out non-viable solutions to problems.

        Instructions:
        1. You will be provided an array of solutions with an index and title in a JSON format: [ { index, title } ]
        2. You will output a list of indexes of all the solutions you wish to filter out as a JSON Array with index numbers: []
        2. Review the "Important Instructions" below for further instructions.

        ${this.memory.customInstructions.rateSolutions
                ? `
        Important Instructions: ${this.memory.customInstructions.rateSolutions}
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
    async rateSolutions() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const solutions = this.memory.subProblems[subProblemIndex].solutions.populations[this.currentPopulationIndex(subProblemIndex)];
            //await this.reapSolutionsForSubProblem(subProblemIndex, solutions);
            await this.saveMemory();
        });
        // Wait for all subproblems to finish
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished Reaping for all");
    }
    async process() {
        this.logger.info("Rate Solutions Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.rateSolutionsModel.temperature,
            maxTokens: IEngineConstants.rateSolutionsModel.maxOutputTokens,
            modelName: IEngineConstants.rateSolutionsModel.name,
            verbose: IEngineConstants.rateSolutionsModel.verbose,
        });
        try {
            await this.rateSolutions();
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
