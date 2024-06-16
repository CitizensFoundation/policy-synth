import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PsConstants } from "../../constants.js";
export class ReapSolutionsProcessor extends BaseProblemSolvingAgent {
    async renderReapPrompt(solution) {
        const messages = [
            new SystemMessage(`You are an expert in assessing if a solution component fits given requirements.
         Do not output markdown.
         Offer no explanations.
         Output either true or false as JSON Object: { solutionFitsRequirements }
         `),
            new HumanMessage(`
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
        const leaveOutFirstTopOnes = 3;
        for (let solutionIndex = leaveOutFirstTopOnes; solutionIndex < solutions.length; solutionIndex++) {
            const solution = solutions[solutionIndex];
            const reapedResults = await this.callLLM("evolve-reap-population", PsConstants.reapSolutionsModel, await this.renderReapPrompt(solution));
            if (reapedResults.solutionFitsRequirements === false) {
                this.logger.info(`Reaped solution: ${solution.title}`);
                solution.reaped = true;
            }
        }
        const afterSize = solutions.filter(solution => !solution.reaped).length;
        this.logger.info(`Population size after reaping: ${afterSize}`);
    }
    async reapSolutions() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, PsConstants.maxSubProblems);
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
            temperature: PsConstants.reapSolutionsModel.temperature,
            maxTokens: PsConstants.reapSolutionsModel.maxOutputTokens,
            modelName: PsConstants.reapSolutionsModel.name,
            verbose: PsConstants.reapSolutionsModel.verbose,
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
//# sourceMappingURL=reapPopulation.js.map