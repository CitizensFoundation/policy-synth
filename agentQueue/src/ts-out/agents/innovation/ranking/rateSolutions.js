import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
export class RateSolutionsProcessor extends BaseProcessor {
    getProCons(prosCons) {
        if (prosCons && prosCons.length > 0) {
            return prosCons.map((proCon) => proCon.description);
        }
        else {
            return [];
        }
    }
    async renderRatePrompt(subProblemIndex, solution) {
        const messages = [
            new SystemChatMessage(`
         You are an expert in rating solutions to problems on multiple attributes.

         Instructions:
         1. Rate how well the solution does, on a scale from 1-100, on the attributes provided in the JSON format below
         2. Consider the best pro and con while rating.

         Always output your ratings in the following JSON format:
         ${this.memory.customInstructions.rateSolutionsJsonFormat}

        Think step by step.
        `),
            new HumanChatMessage(`
        ${this.renderSubProblem(subProblemIndex, true)}

        Solution to rate:

        Title: ${solution.title}

        Description: ${solution.mainBenefitOfSolution}

        Main benefit: ${solution.mainBenefitOfSolution}

        Main obstacle: ${solution.mainObstacleToSolutionAdoption}

        Best pros:
        ${this.getProCons(solution.pros).slice(0, IEngineConstants.maxTopProsConsUsedForRating)}

        Best cons:
        ${this.getProCons(solution.cons).slice(0, IEngineConstants.maxTopProsConsUsedForRating)}

        Your ratings in JSON format:
        `),
        ];
        return messages;
    }
    async rateSolutions() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const solutions = this.getActiveSolutionsLastPopulation(subProblemIndex);
            for (let solutionIndex = 0; solutionIndex < solutions.length; solutionIndex++) {
                this.logger.info(`Ratings for solution ${solutionIndex}/${solutions.length} of sub problem ${subProblemIndex} (${this.lastPopulationIndex(subProblemIndex)})`);
                const solution = solutions[solutionIndex];
                this.logger.debug(solution.title);
                if (true || !solution.ratings) {
                    const rating = (await this.callLLM("rate-solutions", IEngineConstants.rateSolutionsModel, await this.renderRatePrompt(subProblemIndex, solution)));
                    this.logger.debug(`Rating for: ${solution.title} ${JSON.stringify(rating, null, 2)}`);
                    solution.ratings = rating;
                }
                await this.saveMemory();
            }
        });
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished Ratings for all");
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
