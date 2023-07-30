import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
export class CreateProsConsProcessor extends BaseProcessor {
    renderCurrentSolution(solution) {
        return `
      Solution:

      Title: ${solution.title}
      Description: ${solution.description}

      How Solution Can Help: ${solution.mainBenefitOfSolution}
      Main Obstacles to Solution Adoption: ${solution.mainObstacleToSolutionAdoption}
    `;
    }
    async renderRefinePrompt(prosOrCons, results, subProblemIndex, solution) {
        const messages = [
            new SystemChatMessage(`
        As an AI expert, it's your responsibility to refine the given ${prosOrCons} pertaining to solutions to problems.

        Instructions:

        1. Make the ${prosOrCons} concise, consistent, and succinct.
        2. Expand on the ${prosOrCons} by considering the problem, if needed.
        3. Ensure the refined ${prosOrCons} are relevant and directly applicable.
        4. Output should be in JSON format only, not markdown.
        5. The ${prosOrCons} should be outputed as an JSON array: [ "...", "..." ].
        6. Follow a step-by-step approach in your thought process.
        `),
            new HumanChatMessage(`
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
            new SystemChatMessage(`
        As an AI expert, your task is to creatively generate practical top ${prosOrCons} for the provided solutions, keeping the problem provided in mind.

        Important Instructions:

        1. Generate and output up to ${IEngineConstants.maxNumberGeneratedProsConsForSolution} best ${prosOrCons} for the solution below.
        2. Each ${prosconsSingle} should be directly applicable to the solution.
        3. Ensure that each ${prosconsSingle} is important, consistent, and thoughtful.
        4. The ${prosOrCons} must be in line with the context given by the problem.
        5. Output should be in JSON format only, not markdown format.
        6. The ${prosOrCons} should be outputted as an JSON array: [ "...", "..." ].
        7. Never output the index number of the ${prosOrCons} in the text.
        8. Think step by step.
        `),
            new HumanChatMessage(`
         ${this.renderSubProblem(subProblemIndex, true)}

         ${this.renderCurrentSolution(solution)}

         Generate and output JSON for the ${prosOrCons} below:
       `),
        ];
        return messages;
    }
    async createProsCons() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        // Create an array of Promises to resolve all the subproblems concurrently
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const solutions = this.getActiveSolutionsLastPopulation(subProblemIndex);
            this.logger.debug(`Sub Problem ${subProblemIndex} Solutions length: ${solutions.length}`);
            // Sequentially process each solution for this subproblem
            for (let solutionIndex = 0; solutionIndex < solutions.length; solutionIndex++) {
                this.logger.info(`Creating pros cons solution ${solutionIndex}/${solutions.length} of sub problem ${subProblemIndex} lastPopulationIndex ${this.lastPopulationIndex(subProblemIndex)}`);
                const solution = solutions[solutionIndex];
                this.logger.debug(solution.title);
                for (const prosOrCons of ["pros", "cons"]) {
                    if (false && solution[prosOrCons] && solution[prosOrCons].length > 0) {
                        this.logger.info(`Skipping ${prosOrCons} for solution ${solutionIndex} of sub problem ${subProblemIndex} as it already exists`);
                    }
                    else {
                        let results = (await this.callLLM("create-pros-cons", IEngineConstants.createProsConsModel, await this.renderCreatePrompt(prosOrCons, subProblemIndex, solution)));
                        if (IEngineConstants.enable.refine.createProsCons) {
                            results = (await this.callLLM("create-pros-cons", IEngineConstants.createProsConsModel, await this.renderRefinePrompt(prosOrCons, results, subProblemIndex, solution)));
                        }
                        this.logger.debug(`${prosOrCons}: ${JSON.stringify(results, null, 2)}`);
                        solution[prosOrCons] = results;
                        await this.saveMemory();
                    }
                }
            }
        });
        // Wait for all subproblems to finish
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished creating pros cons for all");
    }
    async process() {
        this.logger.info("Create ProsCons Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.createProsConsModel.temperature,
            maxTokens: IEngineConstants.createProsConsModel.maxOutputTokens,
            modelName: IEngineConstants.createProsConsModel.name,
            verbose: IEngineConstants.createProsConsModel.verbose,
        });
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
