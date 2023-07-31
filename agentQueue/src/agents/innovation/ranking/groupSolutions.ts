import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";

export class GroupSolutionsProcessor extends BaseProcessor {
  async renderGroupPrompt(solutionsToGroup: IEngineSolutionForGroupCheck[]) {
    const messages = [
      new SystemChatMessage(
        `
        You are an expert in in grouping solutions containing exactly the same core ideas together.

        Instructions:
        1. You will receive an array of solutions, each having an index and title, formatted in JSON: [ { index, title } ]
        2. You are to output a list of lists. Each sub-list should contain indexes of solutions containing exactly the same core ideas: [ [] ]
        3. Solutions should only be grouped if they share exactly the same core ideas.
        4. Never group more than 5 solutions together.
        5. Pay close attention to the examples below that provide pairs of solutions as 1. and 2..

        Two examples of solutions that should be grouped together, the solutions share the same core ideas:
        1. Digitized Democracy: Boosting Citizen Engagement and Addressing Socio-economic Disparities
        2. Strengthening Democracy: Digital Democracy and Balanced Socio-Economic Landscape

        and

        1. Inclusive Economic Reforms and Digital Democracy Upliftment
        2. Digitally Empowered Citizen Participation & Socio-Economic Stability

        Six examples of solution that should never grouped together, they do not share the same core ideas:

        1. Fostering Economic Growth through Targeted Redistributive Policies
        2. Enhancing Economic Equity through Targeted Skills Training

        and

        1. Revitalizing Democracy: Reworking Institutions and Boosting Citizen Engagement
        2. Democracy Reimagined: Enhancing Citizen Participation and Electoral Accountability

        and

        1. Harmonizing Technology with Democratic Standards
        2. Enhancement of Citizen Engagement through Co-Governance Models

        and

        1. Harmonizing Technology with Democratic Standards
        2. Enhancement of Citizen Engagement through Co-Governance Models

        and

        1. Fostering Trust in Institutions through Open Government Data
        2. Implementation of State-wide Political Science Experiments

        and

        1. Promote Media Transparency through Regulatory Measures
        2. Boost Public Involvement in Local Governance

        and

        1. Enhancing Citizen Education on Democratic Processes
        2. Enhance Open Government Data Strategies for Transparency

        Think step by step.
                `
      ),
      new HumanChatMessage(
        `${JSON.stringify(solutionsToGroup, null, 2)}

        Please return your groups of solutions that share same core ideas as a JSON Array:
        `
      ),
    ];
    return messages;
  }

  async groupSolutionsForSubProblem(
    subProblemIndex: number,
    solutions: Array<IEngineSolution>
  ): Promise<void> {
    this.logger.info(`Grouping solutions for subproblem ${subProblemIndex}`);
    const solutionsToGroup: Array<IEngineSolutionForGroupCheck> = solutions.map(
      (solution, index) => ({
        index: index,
        title: solution.title,
      })
    );

    this.logger.debug(`Solutions going into LLM ${solutionsToGroup.length}`);

    const groupedIndexes: Array<Array<number>> = await this.callLLM(
      "group-solutions",
      IEngineConstants.groupSolutionsModel,
      await this.renderGroupPrompt(solutionsToGroup)
    );

    this.logger.debug(
      `Solutions coming out of LLM ${JSON.stringify(groupedIndexes, null, 2)}`
    );

    let groupIndex = 0;
    for (const group of groupedIndexes) {
      if (group.length > 1) {
        // Ignore groups with only one solution
        for (let k = 0; k < group.length; k++) {
          const solutionIndex = group[k];
          if (solutionIndex < solutions.length) {
            if (k === 0) {
              solutions[solutionIndex].similarityGroup = {
                index: groupIndex,
                isFirst: k === 0,
                totalCount: group.length,
              };
            } else {
              solutions[solutionIndex].similarityGroup = {
                index: groupIndex,
              };
            }
            this.logger.info(
              `Grouped solution: ${solutions[solutionIndex].title}`
            );
          }
        }
        groupIndex += 1;
      }
    }
  }

  async calculateGroupStats(solutions: Array<IEngineSolution>): Promise<void> {
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
      IEngineConstants.maxSubProblems
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

        await this.saveMemory();
      }
    );

    await Promise.all(subProblemsPromises);
    this.logger.info("Finished Grouping for all");
  }

  async process() {
    this.logger.info("Group Solutions Processor");
    super.process();

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.groupSolutionsModel.temperature,
      maxTokens: IEngineConstants.groupSolutionsModel.maxOutputTokens,
      modelName: IEngineConstants.groupSolutionsModel.name,
      verbose: IEngineConstants.groupSolutionsModel.verbose,
    });

    try {
      await this.groupSolutions();
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
