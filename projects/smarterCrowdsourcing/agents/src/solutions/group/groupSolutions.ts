import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";

export class GroupSolutionsAgent extends SolutionsEvolutionSmarterCrowdsourcingAgent {
  async renderGroupPrompt(solutionsToGroup: PsSolutionForGroupCheck[]) {
    const messages = [
      this.createSystemMessage(
        `You are an expert in in grouping solution components containing exactly the same core ideas.

        Instructions:
        1. You will receive an array of solution components to review and group.
        2. You are to output a list of lists. Each sub-list should contain indexes of the solution components that share the same core ideas: [ [ { index: 123 } ] ]
        3. Never group the same solution component in more than one group.
        3. It is very important that you only group together solutions that the contain exactly the same core ideas.
        4. Never group similar solution components together, they need to share the same core ideas.
        5. Never explain anything, just output JSON.
        6. Let's think step by step.
        `
      ),
      this.createHumanMessage(
        `${JSON.stringify(solutionsToGroup, null, 2)}

        Output JSON Array:
        `
      ),
    ];
    return messages;
  }

  async groupSolutionsForSubProblem(
    subProblemIndex: number,
    solutions: Array<PsSolution>
  ): Promise<void> {
    this.logger.info(`Grouping solutions for subproblem ${subProblemIndex}`);
    const solutionsToGroup: Array<PsSolutionForGroupCheck> = solutions.map(
      (solution, index) => ({
        index: index,
        title: solution.title,
        description: solution.description
      })
    );

    this.logger.debug(`Solution Components going into LLM ${solutionsToGroup.length}`);

    const groupedIndexes: Array<Array<PsSolutionForGroupCheck>> = await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      await this.renderGroupPrompt(solutionsToGroup)
    );

    this.logger.debug(
      `Solution Components coming out of LLM ${JSON.stringify(groupedIndexes, null, 2)}`
    );

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
            this.logger.info(
              `Grouped solution: ${solutions[solutionIndex].title}`
            );
          }
        }
        groupIndex += 1;
      }
    }
  }

  async calculateGroupStats(solutions: Array<PsSolution>): Promise<void> {
    let groupCount = 0;
    let ungroupedSolutionsCount = 0;
    const groupSizes: { [key: number]: number } = {};

    solutions.forEach((solution) => {
      if (
        solution.similarityGroup &&
        solution.similarityGroup.index !== undefined
      ) {
        groupCount = Math.max(groupCount, solution.similarityGroup.index + 1);
        groupSizes[solution.similarityGroup.index] =
          (groupSizes[solution.similarityGroup.index] || 0) + 1;
      } else {
        ungroupedSolutionsCount += 1;
      }
    });

    this.logger.info(`Total groups: ${groupCount}`);
    this.logger.info(
      `Number of solutions in each group: ${JSON.stringify(
        groupSizes,
        null,
        2
      )}`
    );
    this.logger.info(
      `Number of solutions not in any group: ${ungroupedSolutionsCount}`
    );
  }

  async groupSolutions() {
    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      this.maxSubProblems
    );

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        const solutions =
          this.memory.subProblems[subProblemIndex].solutions.populations[
            this.lastPopulationIndex(subProblemIndex)
          ];

        solutions.forEach((solution) => {
          solution.similarityGroup = undefined;
        });

        await this.groupSolutionsForSubProblem(subProblemIndex, solutions);
        this.calculateGroupStats(solutions);

        this.scheduleMemorySave();
        this.checkLastMemorySaveError();
      }
    );

    await Promise.all(subProblemsPromises);
    this.logger.info("Finished Grouping for all");
  }

  async process() {
    this.logger.info("Group Solution Components Agent");
    super.process();

    try {
      await this.groupSolutions();
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
