import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";

const DISABLE_LLM_FOR_DEBUG = false;

export class CreateInitialSolutionsAgent extends SolutionsEvolutionSmarterCrowdsourcingAgent {
   renderCreateSystemMessage() {
    return this.createSystemMessage(
      `As an expert, you are tasked with creating innovative solutions for sub problems, considering the affected entities based on the <UserSolutionsToBaseYourSolutionsOn> provided by the user.

      Instructions:
      1. Generate four simple solutions, focused on the sub problem and its affected entities directly.
      2. Use <UserSolutionsToBaseYourSolutionsOn> as the source for your solutions but:
      2.1. Solutions should be specific, not just improving this or enhancing that.
      2.2. Solutions should be actionable, innovative, and equitable.
      3. Each solution should include a short title, description, mainBenefitOfSolution, and mainObstacleToSolutionAdoption.
      4. Limit the description of each solution to six sentences maximum and the description should be accessible and free of technical jargon.
      5. Never re-create solution listed under '<AlreadyCreatedSolutions>'.
      ${this.generateInLanguage ? `7. Always output in ${this.generateInLanguage}` : ""}
      ${
        false && this.createSolutionsInstructions
          ? `
        Important Instructions (override the previous instructions if needed):${this.createSolutionsInstructions}

    `
          : ""
      }

      Always output your solutions in the following JSON format:
      [
        {
          "title": string,
          "description": string,
          "mainBenefitOfSolution": string,
          "mainObstacleToSolutionAdoption": string
        }
      ]

      `
    );
  }
  async renderCreatePrompt(
    subProblemIndex: number,
    solutionsForInspiration: PsSolution[],
    alreadyCreatedSolutions: string | undefined = undefined
  ) {
    const messages = [
      this.renderCreateSystemMessage(),
      this.createHumanMessage(
        `
        ${this.renderProblemStatementSubProblemsAndEntities(
          subProblemIndex,
          false
        )}

        <UserSolutionsToBaseYourSolutionsOn>
          ${solutionsForInspiration
            .map((s) => `# ${s.title}\n\n${s.description}`)
            .join("\n\n")}
        </UserSolutionsToBaseYourSolutionsOn>

        ${
          alreadyCreatedSolutions
            ? `
          <AlreadyCreatedSolutions>
          ${alreadyCreatedSolutions}
          </AlreadyCreatedSolutions>
        `
            : ``
        }

        Output in JSON Format:
       `
      ),
    ];

    return messages;
  }

  async createSolutions(
    subProblemIndex: number,
    solutionsForInspiration: PsSolution[],
    alreadyCreatedSolutions: string | undefined = undefined,
    stageName: string = "create-seed-solutions"
  ): Promise<PsSolution[]> {
    if (DISABLE_LLM_FOR_DEBUG) {
      this.logger.info("DISABLE_LLM_FOR_DEBUG is true, skipping LLM call");
      await this.renderCreatePrompt(
        subProblemIndex,
        solutionsForInspiration,
        alreadyCreatedSolutions
      );
      return [];
    } else {
      this.logger.info(`Calling LLM for sub problem ${subProblemIndex}`);
      let results = await this.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Medium,
        await this.renderCreatePrompt(
          subProblemIndex,
          solutionsForInspiration,
          alreadyCreatedSolutions
        ),
        true,
        false,
        860
      );

      return results;
    }
  }

  async countTokensForString(text: string) {
    const tokenCountData = await this.getTokensFromMessages([
      this.createHumanMessage(text),
    ]);
    return tokenCountData;
  }

  getRandomSolutions(
    subProblemIndex: number,
    alreadyCreatedSolutions: string | undefined
  ): PsSolution[] {
    this.logger.info(
      `Getting random solutions for sub problem ${subProblemIndex}`
    );
    const subProblemSolutions =
      this.memory.subProblems[subProblemIndex].solutionsFromSearch!;

    const problemStatementSolutions =
      this.memory.problemStatement.solutionsFromSearch!;

    // Aggregate solutions from entities
    const entitiesSolutions: PsSolution[] = [];
    this.memory.subProblems[subProblemIndex].entities.forEach(entity => {
      if (entity.solutionsFromSearch && Array.isArray(entity.solutionsFromSearch)) {
        entitiesSolutions.push(...entity.solutionsFromSearch);
      }
    });

    this.logger.debug(
      `Lengths: Entities: ${entitiesSolutions.length}, SubProblem: ${subProblemSolutions.length}, ProblemStatement: ${problemStatementSolutions.length}`
    );

    const getFilteredSolutions = (
      solutions: PsSolution[],
      minEloScore: number
    ): PsSolution[] => {
      return solutions.filter((solution) => solution.eloRating! > minEloScore);
    };

    let selectedSolutions: PsSolution[];

    const randomValue = Math.random(); // Value between 0 and 1

    const numberOfSolutionComponents = 4;

    if (randomValue < 0.05) {
      selectedSolutions = this.getRandomItemsFromArray(
        problemStatementSolutions,
        numberOfSolutionComponents
      );
      this.logger.debug(
        `Selected solutions from problem statement: ${JSON.stringify(
          selectedSolutions.map((s) => `${s.title}: ${s.description}`),
          null,
          2
        )}`
      );
    } else if (randomValue < 0.55) { // 50% chance for entities solutions
      if (subProblemSolutions.length > 8 && Math.random() < 0.5) {
        selectedSolutions = this.getRandomItemsFromArray(
          getFilteredSolutions(entitiesSolutions, 1000),
          numberOfSolutionComponents
        );
        this.logger.debug(
          `Selected solutions from sub problem > 1000 Elo: ${JSON.stringify(
            selectedSolutions.map((s) => `${s.title}: ${s.description}`),
            null,
            2
          )}`
        );
      } else {
        selectedSolutions = this.getRandomItemsFromArray(
          entitiesSolutions,
          numberOfSolutionComponents
        );
      }
      this.logger.debug(
        `Selected solutions from entities: ${JSON.stringify(
          selectedSolutions.map((s) => `${s.title}: ${s.description}`),
          null,
          2
        )}`
      );
    } else { // 45% chance for subproblem solutions
      if (subProblemSolutions.length > 15 && Math.random() < 0.5) {
        selectedSolutions = this.getRandomItemsFromArray(
          getFilteredSolutions(subProblemSolutions, 1000),
          numberOfSolutionComponents
        );
        this.logger.debug(
          `Selected solutions from sub problem > 1000 Elo: ${JSON.stringify(
            selectedSolutions.map((s) => `${s.title}: ${s.description}`),
            null,
            2
          )}`
        );
      } else if (subProblemSolutions.length > 15 && Math.random() < 0.8) {
        selectedSolutions = this.getRandomItemsFromArray(
          getFilteredSolutions(subProblemSolutions, 1100),
          numberOfSolutionComponents
        );
        this.logger.debug(
          `Selected solutions from sub problem > 1100 Elo: ${JSON.stringify(
            selectedSolutions.map((s) => `${s.title}: ${s.description}`),
            null,
            2
          )}`
        );
      } else {
        selectedSolutions = this.getRandomItemsFromArray(
          subProblemSolutions,
          numberOfSolutionComponents
        );
        this.logger.debug(
          `Selected solutions from sub problem: ${JSON.stringify(
            selectedSolutions.map((s) => `${s.title}: ${s.description}`),
            null,
            2
          )}`
        );
      }
    }

    if (selectedSolutions.length < numberOfSolutionComponents) {
      this.logger.warn(
        `Not enough solutions found, only ${selectedSolutions.length} selected`
      );

      const missingCount = numberOfSolutionComponents - selectedSolutions.length;
      const missingSolutions = this.getRandomItemsFromArray(
        problemStatementSolutions,
        missingCount
      );

      selectedSolutions = selectedSolutions.concat(missingSolutions);

      this.logger.debug(
        `Missing solutions added: ${JSON.stringify(
          missingSolutions.map((s) => `${s.title}: ${s.description}`),
          null,
          2
        )}`
      );
    }

    return selectedSolutions;
  }

  getRandomItemsFromArray<T>(array: T[], count: number): T[] {
    const shuffledArray = array.sort(() => 0.5 - Math.random());
    return shuffledArray.slice(0, count);
  }

  getRandomItemFromArray<T>(
    array: T[],
    useTopN: number | undefined = undefined
  ) {
    if (array && array.length > 0) {
      const randomIndex = Math.floor(
        Math.random() *
          (useTopN ? Math.min(useTopN, array.length) : array.length)
      );
      return array[randomIndex];
    } else {
      return "";
    }
  }

  async createAllSeedSolutions() {
    for (
      let subProblemIndex = 0;
      subProblemIndex <
      Math.min(this.memory.subProblems.length, this.maxSubProblems);
      subProblemIndex++
    ) {
      this.currentSubProblemIndex = subProblemIndex;
      this.logger.info(`Creating solutions for sub problem ${subProblemIndex}`);
      let solutions: PsSolution[] = [];

      // Create 60 solutions 4*15
      const solutionBatchCount = 15;
      for (let i = 0; i < solutionBatchCount; i++) {
        this.logger.info(
          `Creating solutions batch ${i + 1}/${solutionBatchCount}`
        );
        let alreadyCreatedSolutions;

        if (i > 0) {
          alreadyCreatedSolutions = solutions
            .map((solution) => solution.title)
            .join("\n");
        }

        const solutionsForInspiration = this.getRandomSolutions(
          subProblemIndex,
          alreadyCreatedSolutions
        );

        const newSolutions = await this.createSolutions(
          subProblemIndex,
          solutionsForInspiration,
          alreadyCreatedSolutions
        );

        this.logger.debug(
          `New Solution Components: ${JSON.stringify(newSolutions, null, 2)}`
        );

        solutions = solutions.concat(newSolutions);

        const seedUrls = [];
        const missingSeedUrls = [];

        for (let i = 0; i < 4; i++) {
          const url = solutionsForInspiration[i]?.fromUrl;
          if (url !== undefined) {
            seedUrls.push(url);
          } else {
            missingSeedUrls.push(i);
          }
        }

        for (let solution of solutions) {
          solution.family = {
            seedUrls,
            gen: 0,
          };
        }

        if (missingSeedUrls.length > 0) {
          console.log(`Missing fromUrl for solutions at indices: ${missingSeedUrls.join(', ')}`);
        }

        for (let solution of solutions) {
          solution.family = {
            seedUrls,
            gen: 0,
          };
        }
      }

      this.logger.debug("Created all solutions batches");

      if (!this.memory.subProblems[subProblemIndex].solutions) {
        this.memory.subProblems[subProblemIndex].solutions = {
          populations: [],
        };
      }

      this.memory.subProblems[subProblemIndex].solutions.populations.push(
        solutions
      );

      this.scheduleMemorySave();
      this.checkLastMemorySaveError();
      this.logger.debug(`Saved memory for sub problem ${subProblemIndex}`);
    }
  }

  async process() {
    this.logger.info("Create Seed Solution Components Agent");
    super.process();

    try {
      await this.createAllSeedSolutions();
    } catch (error: any) {
      this.logger.error("Error creating solutions");
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
