import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
export class CreateProsConsAgent extends SolutionsEvolutionSmarterCrowdsourcingAgent {
    renderCurrentSolution(solution) {
        return `
      Solution Component:

      Title: ${solution.title}
      Description: ${solution.description}

      How Solution Component Can Help: ${solution.mainBenefitOfSolution}
      Main Obstacles to Solution Component Adoption: ${solution.mainObstacleToSolutionAdoption}
    `;
    }
    async renderRefinePrompt(prosOrCons, results, subProblemIndex, solution) {
        const messages = [
            this.createSystemMessage(`
        As an AI expert, it's your responsibility to refine the given ${prosOrCons} pertaining to solution components to problems.

        Instructions:

        1. Make the ${prosOrCons} clear, consistent, and succinct.
        2. Expand on the ${prosOrCons} by considering the problem, if needed.
        3. Ensure the refined ${prosOrCons} are relevant and directly applicable.
        4. Output should be in JSON format only, not markdown.
        5. The ${prosOrCons} should be outputed as an JSON array: [ "...", "..." ].
        6. Reorder the points based on importance to the problem
        7. Never offer explanations.
        8. Always output ${this.maxNumberGeneratedProsConsForSolution} ${prosOrCons} in the JSON string array.
        9. Follow a step-by-step approach in your thought process.
        `),
            this.createHumanMessage(`
        ${this.renderSubProblem(subProblemIndex, true)}

        ${this.renderCurrentSolution(solution)}

        Please review and refine the following ${prosOrCons}:
        ${JSON.stringify(results, null, 2)}

        Generate and output the new JSON for the ${prosOrCons} below:
        `),
        ];
        return messages;
    }
    async renderCreatePrompt(prosOrCons, subProblemIndex, solution) {
        const prosconsSingle = prosOrCons.slice(0, -1);
        const messages = [
            this.createSystemMessage(`
        As an AI expert, your task is to creatively generate practical top ${prosOrCons} for the provided solution components, keeping the problem provided in mind.

        Important Instructions:

        1. Always generate and output ${this.maxNumberGeneratedProsConsForSolution} best ${prosOrCons} for the solution below with the best point first.
        2. Each ${prosconsSingle} should be directly applicable to the solution.
        3. Ensure that each ${prosconsSingle} is important, consistent, and thoughtful.
        4. The ${prosOrCons} must be in line with the context given by the problem.
        5. Output should be in JSON format only, not markdown format.
        6. The ${prosOrCons} should be outputted as an JSON array: [ "...", "..." ].
        7. Never output the index number of the ${prosOrCons} in the text.
        8. Never offer explanations.
        9. Always output ${this.maxNumberGeneratedProsConsForSolution} ${prosOrCons} in the JSON string array
        10. Let's think step by step.
        `),
            this.createHumanMessage(`
         ${this.renderSubProblem(subProblemIndex, true)}

         ${this.renderCurrentSolution(solution)}

         Generate and output JSON for the ${prosOrCons} below:
       `),
        ];
        return messages;
    }
    async createProsCons() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, this.maxSubProblems);
        // Create an array of Promises to resolve all the subproblems concurrently
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const solutions = this.getActiveSolutionsLastPopulation(subProblemIndex);
            this.logger.debug(`Sub Problem ${subProblemIndex} Solution Components length: ${solutions.length}`);
            // Sequentially process each solution for this subproblem
            for (let solutionIndex = 0; solutionIndex < solutions.length; solutionIndex++) {
                this.logger.info(`Creating pros cons solution ${solutionIndex}/${solutions.length} of sub problem ${subProblemIndex} lastPopulationIndex ${this.lastPopulationIndex(subProblemIndex)}`);
                const solution = solutions[solutionIndex];
                this.logger.debug(solution.title);
                for (const prosOrCons of ["pros", "cons"]) {
                    if (solution[prosOrCons] && solution[prosOrCons].length > 0) {
                        this.logger.info(`Skipping ${prosOrCons} for solution ${solutionIndex} of sub problem ${subProblemIndex} as it already exists`);
                    }
                    else {
                        const maxPointRetries = 25;
                        let retries = 0;
                        let gotFullPoints = false;
                        while (!gotFullPoints && retries < maxPointRetries) {
                            let results = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, await this.renderCreatePrompt(prosOrCons, subProblemIndex, solution), true, false, 135));
                            if (this.createProsConsRefinedEnabled) {
                                results = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, await this.renderRefinePrompt(prosOrCons, results, subProblemIndex, solution), true, false, 135));
                            }
                            if (results && results.length === this.maxNumberGeneratedProsConsForSolution) {
                                gotFullPoints = true;
                                this.logger.debug(`${prosOrCons}: ${JSON.stringify(results, null, 2)}`);
                                solution[prosOrCons] = results;
                                this.scheduleMemorySave();
                                this.checkLastMemorySaveError();
                            }
                            else {
                                retries++;
                                this.logger.error(`Retrying - but Failed to get full points for ${prosOrCons} for solution ${solutionIndex} of sub problem ${subProblemIndex}`);
                            }
                        }
                        if (!gotFullPoints) {
                            this.logger.error(`Failed to get full points for ${prosOrCons} for solution ${solutionIndex} of sub problem ${subProblemIndex}`);
                        }
                    }
                }
            }
        });
        // Wait for all subproblems to finish
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished creating pros cons for all");
    }
    async process() {
        this.logger.info("Create ProsCons Agent");
        super.process();
        try {
            await this.createProsCons();
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
//# sourceMappingURL=createProsCons.js.map