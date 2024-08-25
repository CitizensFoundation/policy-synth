import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
export class RateSolutionsAgent extends SolutionsEvolutionSmarterCrowdsourcingAgent {
    async renderRatePrompt(subProblemIndex, solution) {
        const messages = [
            this.createSystemMessage(`
         You are an expert in rating solution components to problems on multiple attributes.

         Instructions:
         1. Rate how well the solution component does, on a scale from 1-100, on the attributes provided in the JSON format below
         2. Consider the best pro and con while rating.

         Always output your ratings in the following JSON format:
         ${this.rateSolutionsJsonFormat}

        Let's think step by step.
        `),
            this.createHumanMessage(`
        ${this.renderSubProblem(subProblemIndex, true)}

        Solution Component to rate:

        Title: ${solution.title}

        Description: ${solution.description}

        Main benefit: ${solution.mainBenefitOfSolution}

        Main obstacle: ${solution.mainObstacleToSolutionAdoption}

        Best pros:
        ${this.getProCons(solution.pros).slice(0, this.maxTopProsConsUsedForRating)}

        Best cons:
        ${this.getProCons(solution.cons).slice(0, this.maxTopProsConsUsedForRating)}

        Your ratings in JSON format:
        `),
        ];
        return messages;
    }
    async rateSolutions() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, this.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const solutions = this.getActiveSolutionsLastPopulation(subProblemIndex);
            for (let solutionIndex = 0; solutionIndex < solutions.length; solutionIndex++) {
                this.logger.info(`Ratings for solution ${solutionIndex}/${solutions.length} of sub problem ${subProblemIndex} (${this.lastPopulationIndex(subProblemIndex)})`);
                const solution = solutions[solutionIndex];
                this.logger.debug(solution.title);
                if (!solution.ratings) {
                    const rating = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Large, await this.renderRatePrompt(subProblemIndex, solution)));
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
        this.logger.info("Rate Solution Components Agent");
        super.process();
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
//# sourceMappingURL=rateSolutions.js.map