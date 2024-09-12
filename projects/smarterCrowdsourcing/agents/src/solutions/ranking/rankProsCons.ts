import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";

export class RankProsConsAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
  async voteOnPromptPair(
    subProblemIndex: number,
    promptPair: number[],
    additionalData: {
      solution: string;
      prosOrCons: "pros" | "cons";
      subProblemIndex: number;
    }
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const prosOrConsOne = (
      this.allItems![subProblemIndex]![itemOneIndex] as PsProCon
    ).description;
    const prosOrConsTwo = (
      this.allItems![subProblemIndex]![itemTwoIndex] as PsProCon
    ).description;

    let proConSingle;

    if (additionalData.prosOrCons === "pros") {
      proConSingle = "Pro";
    } else {
      proConSingle = "Con";
    }

    const messages = [
      this.createSystemMessage(
        `
        As an AI expert, your role involves analyzing ${
          additionalData.prosOrCons
        } associated with solution components to problems and decide on which ${
          additionalData!.prosOrCons
        } is more important.

        Instructions:

        1. You will be presented with a problem, a solution component, and two ${
          additionalData.prosOrCons
        }. These will be labeled as "${proConSingle} One" and "${proConSingle} Two".
        2. Analyze and compare the ${
          additionalData.prosOrCons
        } based on their relevance and importance to the solution component and choose which is more important and output your decision as either "One", "Two" or "Neither".
        3. Never explain your reasoning.
        `
      ),
      this.createHumanMessage(
        `
        ${this.renderSubProblem(additionalData.subProblemIndex, true)}

        ${additionalData.solution}

        Which ${proConSingle} is more important regarding the solution component above? Output your decision as either "One", "Two" or "Neither".

        ${proConSingle} One: ${prosOrConsOne}

        ${proConSingle} Two: ${prosOrConsTwo}

        The more important ${proConSingle} is:
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

  convertProsConsToObjects(prosCons: string[]): PsProCon[] {
    return prosCons.map((prosCon) => {
      return {
        description: prosCon,
      };
    });
  }

  async process() {
    this.logger.info("Rank Pros Cons Agent");
    super.process();

    try {
      // Parallel execution of the subproblems
      const subProblemPromises = this.memory.subProblems
        .slice(0, this.maxSubProblems)
        .map((subProblem, subProblemIndex) => {
          return this.processSubProblem(subProblem, subProblemIndex);
        });

      await Promise.all(subProblemPromises);
      this.logger.info("Finished processing all sub problems for pros cons ranking");
    } catch (error) {
      this.logger.error("Error in Rank Pros Cons Agent");
      this.logger.error(error);
    }
  }

  async processSubProblem(
    subProblem: PsSubProblem,
    subProblemIndex: number
  ) {
    this.logger.info(`Ranking pros/cons for sub problem ${subProblemIndex}`);

    const solutions = this.getActiveSolutionsLastPopulation(subProblemIndex);

    for (
      let solutionIndex = 0;
      solutionIndex < solutions.length;
      solutionIndex++
    ) {
      const solution = solutions[solutionIndex];
      const solutionDescription = this.renderSolution(solution);

      for (const prosOrCons of ["pros", "cons"] as const) {
        if (solution[prosOrCons] && solution[prosOrCons]!.length > 0) {
          const firstItem = solution[prosOrCons]![0];

          const hasStrings = typeof firstItem === "string";

          // Only rank if the pros/cons are strings from the creation step
          if (hasStrings) {
            this.logger.debug(
              `${prosOrCons} before ranking: ${JSON.stringify(
                solution[prosOrCons],
                null,
                2
              )}`
            );
            this.logger.debug("Converting pros/cons to objects");
            const convertedProsCons = this.convertProsConsToObjects(
              solution[prosOrCons]! as string[]
            );

            this.setupRankingPrompts(subProblemIndex, convertedProsCons);

            await this.performPairwiseRanking(subProblemIndex, {
              solution: solutionDescription,
              prosOrCons,
              subProblemIndex,
            } as any);

            solution[prosOrCons] = this.getOrderedListOfItems(
              subProblemIndex,
              true
            ) as PsProCon[];

            this.logger.debug(
              `${prosOrCons} after ranking: ${JSON.stringify(
                solution[prosOrCons],
                null,
                2
              )}`
            );
          } else {
            this.logger.debug(
              `${prosOrCons} already ranked: ${JSON.stringify(
                solution[prosOrCons],
                null,
                2
              )}`
            );
          }
        } else {
          this.logger.error(`No ${prosOrCons} to rank ${solution.title} ${solutionIndex} for sub problem ${subProblemIndex}`);
        }
        this.logger.info(`Finished ranking ${prosOrCons} for solution ${solutionIndex} for sub problem ${subProblemIndex}`)
      }

      this.scheduleMemorySave();
      this.checkLastMemorySaveError();
    }
  }

  renderSolution(solution: PsSolution) {
    return `
      Solution Component:
      ${solution.title}
      ${solution.description}
    `;
  }
}
