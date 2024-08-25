import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";

export class RankSolutionsAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
  defaultModelSize = PsAiModelSize.Medium;

  async voteOnPromptPair(
    subProblemIndex: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const solutionOne = this.allItems![subProblemIndex]![
      itemOneIndex
    ] as PsSolution;
    const solutionTwo = this.allItems![subProblemIndex]![
      itemTwoIndex
    ] as PsSolution;

    const messages = [
      this.createSystemMessage(
        `You're an expert in evaluating and ranking solution components to problems.

         Instructions:
         1. Analyze a problem and two solution components, labeled "Solution Component One" and "Solution Component Two"
         2. Determine which is more important and practical.
         ${
           this.customInstructionsRankSolutions
             ? `
           Important Instructions: ${this.customInstructionsRankSolutions}
           `
             : ""
         }

         Always output your decision as "One", "Two" or "Neither". No explanation is necessary.
         Let's think step by step.
        `
      ),
      this.createHumanMessage(
        `${this.renderSubProblem(subProblemIndex, true)}

        Solution Components to assess:

        Solution Component One:
        ${solutionOne.title}
        ${solutionOne.description}

        ${
          solutionOne.pros
            ? `
        Top Pro for Solution Component One:
        ${(solutionOne.pros[0] as PsProCon).description}
        `
            : ""
        }

        ${
          solutionOne.cons
            ? `
        Top Con for Solution Component One:
        ${(solutionOne.cons[0] as PsProCon).description}
        `
            : ""
        }

        Solution Component Two:
        ${solutionTwo.title}
        ${solutionTwo.description}

        ${
          solutionTwo.pros
            ? `
        Top Pro for Solution Component Two:
        ${(solutionTwo.pros[0] as PsProCon).description}
        `
            : ""
        }

        ${
          solutionTwo.cons
            ? `
        Top Con for Solution Component Two:
        ${(solutionTwo.cons[0] as PsProCon).description}
        `
            : ""
        }

        The more important and practial solution component is:
        `
      ),
    ];

    return await this.getResultsFromLLM(
      subProblemIndex,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async processSubProblem(subProblemIndex: number) {
    const lastPopulationIndex = this.lastPopulationIndex(subProblemIndex);
    this.logger.info(
      `Ranking solution components for sub problem ${subProblemIndex} population ${lastPopulationIndex}`
    );

    this.setupRankingPrompts(
      subProblemIndex,
      this.getActiveSolutionsLastPopulation(subProblemIndex),
      this.minimumNumberOfPairwiseVotesForPopulation *
        this.getActiveSolutionsLastPopulation(subProblemIndex).length
    );

    await this.performPairwiseRanking(subProblemIndex);

    this.memory.subProblems[subProblemIndex].solutions.populations[
      lastPopulationIndex
    ] = this.getOrderedListOfItems(subProblemIndex, true) as PsSolution[];

    await this.saveMemory();
  }

  async process() {
    this.logger.info("Rank Solution Components Agent");
    super.process();

    // Use medium model size 50% of the time
    if (Math.random() < 0.5) {
      this.defaultModelSize = PsAiModelSize.Medium;
      this.logger.info("Using Medium Model Size");
    }

    try {
      const subProblemsPromises = Array.from(
        {
          length: Math.min(
            this.memory.subProblems.length,
            this.maxSubProblems
          ),
        },
        async (_, subProblemIndex) => this.processSubProblem(subProblemIndex)
      );

      await Promise.all(subProblemsPromises);
      this.logger.info("Rank Solution Components Agent Completed");
    } catch (error) {
      this.logger.error("Error in Rank Solution Components Agent");
      this.logger.error(error);
      throw error;
    }
  }
}
