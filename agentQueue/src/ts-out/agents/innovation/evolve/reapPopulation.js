import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
export class ReapSolutionsProcessor extends BaseProcessor {
    async renderReapPrompt(solution) {
        const messages = [
            new SystemChatMessage(`
        You are an expert in assessing if a solution component fits given requirements.
        Always output either true or false in a JSON Object: { solutionFitsRequirements }
        `),
            new HumanChatMessage(`
        Solution component to assess:
        ${solution.title}
        ${solution.description}

        Requirements:
        ${this.memory.customInstructions.reapSolutions}

        Let's think step by step.

        JSON Object with the results:
        `),
        ];
        return messages;
    }
    async reapSolutionsForSubProblem(subProblemIndex, solutions) {
        this.logger.info(`Reaping solution components for subproblem ${subProblemIndex}`);
        this.logger.info(`Initial population size: ${solutions.length}`);
        for (let solutionIndex = 0; solutionIndex < solutions.length; solutionIndex++) {
            const solution = solutions[solutionIndex];
            const reapedResults = await this.callLLM("evolve-reap-population", IEngineConstants.reapSolutionsModel, await this.renderReapPrompt(solution));
            if (reapedResults.solutionFitsRequirements === false) {
                this.logger.info(`Reaped solution: ${solution.title}`);
                solution.reaped = true;
            }
        }
        const afterSize = solutions.filter(solution => !solution.reaped).length;
        this.logger.info(`Population size after reaping: ${afterSize}`);
    }
    async reapSolutions() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const solutions = this.memory.subProblems[subProblemIndex].solutions.populations[this.lastPopulationIndex(subProblemIndex)];
            await this.reapSolutionsForSubProblem(subProblemIndex, solutions);
            // Delete reaped solutions after reaping
            const viableSolutions = solutions.filter(solution => !solution.reaped);
            this.memory.subProblems[subProblemIndex].solutions.populations[this.lastPopulationIndex(subProblemIndex)] = viableSolutions;
            this.logger.info(`Population size after deletion of reaped solutions: ${viableSolutions.length}`);
            await this.saveMemory();
        });
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
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
