import { SolutionsSmarterCrowdsourcingAgent } from "../../scBaseSolutionsAgent.js";

export class ReapSolutionsProcessor extends SolutionsSmarterCrowdsourcingAgent {
  async renderReapPrompt(solution: PsSolution) {
    const messages = [
      this.createSystemMessage(
        `You are an expert in assessing if a solution component fits given requirements.
         Do not output markdown.
         Offer no explanations.
         Output either true or false as JSON Object: { solutionFitsRequirements }
         `
      ),
      this.createHumanMessage(
        `
        Solution component to assess:
        ${solution.title}
        ${solution.description}

        Requirements:
        ${this.memory.customInstructions.reapSolutions}

        Let's think step by step.

        JSON Object with the results:
        `
      ),
    ];
    return messages;
  }

  async reapSolutionsForSubProblem(
    subProblemIndex: number,
    solutions: Array<PsSolution>
  ): Promise<void> {
    this.logger.info(`Reaping solution components for subproblem ${subProblemIndex}`);

    this.logger.info(`Initial population size: ${solutions.length}`);

    const leaveOutFirstTopOnes = 3;
    for (let solutionIndex = leaveOutFirstTopOnes; solutionIndex < solutions.length; solutionIndex++) {

      const solution = solutions[solutionIndex];

      const reapedResults: PsReapingResults = await this.callModel(
        PsAiModelType.Text,
        await this.renderReapPrompt(solution)
      );

      if (reapedResults.solutionFitsRequirements===false) {
        this.logger.info(`Reaped solution: ${solution.title}`);
        solution.reaped = true;
      }
    }

    const afterSize = solutions.filter(solution => !solution.reaped).length;

    this.logger.info(`Population size after reaping: ${afterSize}`);
  }

  async reapSolutions() {
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

        await this.reapSolutionsForSubProblem(subProblemIndex, solutions);

        // Delete reaped solutions after reaping
        const viableSolutions = solutions.filter(solution => !solution.reaped);
        this.memory.subProblems[subProblemIndex].solutions.populations[
          this.lastPopulationIndex(subProblemIndex)
        ] = viableSolutions;

        this.logger.info(`Population size after deletion of reaped solutions: ${viableSolutions.length}`);

        await this.saveMemory();
      }
    );

    await Promise.all(subProblemsPromises);

    this.logger.info("Finished Reaping for all");
  }

  async process() {
    this.logger.info("Reap Solution Components Processor");
    super.process();

    try {
      await this.reapSolutions();
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
