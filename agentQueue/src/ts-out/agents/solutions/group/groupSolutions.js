import { BaseProcessor } from "../../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
export class GroupSolutionsProcessor extends BaseProcessor {
    async renderGroupPrompt(solutionsToGroup) {
        const messages = [
            new SystemMessage(`You are an expert in in grouping solution components containing exactly the same core ideas together, do not group them if they are just similar.

        Instructions:
        1. You will receive an array of solution components, each having an index, title and description
        2. You are to output a list of lists. Each sub-list should contain indexes and titles of solution components containing exactly the same core ideas: [ [ { index, title } ] ]
        3. Solution Components should only be grouped if they share exactly the same core ideas.
        4. Never group more than 14 solution components
        5. Not all solution components need to be grouped.
        6. Never group the same solution component in more than one group.
        7. Never group similar solution components together, only ones that the contain exactly the same core ideas.
        8. Never explain anything, just output JSON.
        `),
            new HumanMessage(`${JSON.stringify(solutionsToGroup, null, 2)}

        Output JSON Array:
        `),
        ];
        return messages;
    }
    async groupSolutionsForSubProblem(subProblemIndex, solutions) {
        this.logger.info(`Grouping solutions for subproblem ${subProblemIndex}`);
        const solutionsToGroup = solutions.map((solution, index) => ({
            index: index,
            title: solution.title,
            description: solution.description
        }));
        this.logger.debug(`Solution Components going into LLM ${solutionsToGroup.length}`);
        this.logger.debug(JSON.stringify(solutionsToGroup, null, 2));
        const groupedIndexes = await this.callLLM("group-solutions", IEngineConstants.groupSolutionsModel, await this.renderGroupPrompt(solutionsToGroup));
        this.logger.debug(`Solution Components coming out of LLM ${JSON.stringify(groupedIndexes, null, 2)}`);
        let groupIndex = 0;
        for (const group of groupedIndexes) {
            if (group.length > 1) {
                // Ignore groups with only one solution
                for (let k = 0; k < group.length; k++) {
                    const solutionIndex = group[k].index;
                    if (solutionIndex < solutions.length) {
                        solutions[solutionIndex].similarityGroup = {
                            index: groupIndex,
                            totalCount: group.length,
                        };
                        this.logger.info(`Grouped solution: ${solutions[solutionIndex].title}`);
                    }
                }
                groupIndex += 1;
            }
        }
    }
    async calculateGroupStats(solutions) {
        let groupCount = 0;
        let ungroupedSolutionsCount = 0;
        const groupSizes = {};
        solutions.forEach((solution) => {
            if (solution.similarityGroup &&
                solution.similarityGroup.index !== undefined) {
                groupCount = Math.max(groupCount, solution.similarityGroup.index + 1);
                groupSizes[solution.similarityGroup.index] =
                    (groupSizes[solution.similarityGroup.index] || 0) + 1;
            }
            else {
                ungroupedSolutionsCount += 1;
            }
        });
        this.logger.info(`Total groups: ${groupCount}`);
        this.logger.info(`Number of solutions in each group: ${JSON.stringify(groupSizes, null, 2)}`);
        this.logger.info(`Number of solutions not in any group: ${ungroupedSolutionsCount}`);
    }
    async groupSolutions() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const solutions = this.memory.subProblems[subProblemIndex].solutions.populations[this.lastPopulationIndex(subProblemIndex)];
            solutions.forEach((solution) => {
                solution.similarityGroup = undefined;
            });
            await this.groupSolutionsForSubProblem(subProblemIndex, solutions);
            this.calculateGroupStats(solutions);
            await this.saveMemory();
        });
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished Grouping for all");
    }
    async process() {
        this.logger.info("Group Solution Components Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.groupSolutionsModel.temperature,
            maxTokens: IEngineConstants.groupSolutionsModel.maxOutputTokens,
            modelName: IEngineConstants.groupSolutionsModel.name,
            verbose: IEngineConstants.groupSolutionsModel.verbose,
        });
        try {
            await this.groupSolutions();
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
