import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";

import { IEngineConstants } from "../../../constants.js";
import { CreateSolutionsProcessor } from "../create/createSolutions.js";


//TODO: Pentalty for similar ideas in the ranking somehow
//TODO: Track the evolution of the population with a log of parents and mutations, family tree
export class EvolvePopulationProcessor extends CreateSolutionsProcessor {
  renderSolution(solution: IEngineSolution) {
    return JSON.stringify(
      {
        title: solution.title,
        description: solution.description,
        mainBenefitOfSolutionComponent: solution.mainBenefitOfSolutionComponent || solution.mainBenefitOfSolution,
        mainObstacleToSolutionComponentAdoption: solution.mainObstacleToSolutionComponentAdoption || solution.mainObstacleToSolutionAdoption,
      },
      null,
      2
    );
  }

  renderRecombinationPrompt(
    parentA: IEngineSolution,
    parentB: IEngineSolution,
    subProblemIndex: number
  ) {

    return [
      new SystemChatMessage(
        `
        As an AI genetic algorithm expert, your task is to create a new solution component from two parent solution components: "Solution Component Parent A" and "Solution Component Parent B".

        Instructions:
        1. Use one best attribute from "Parent A" and one best attribute from "Parent B" to create a new solution component with one core idea. Be very creative here do not just take one idea from Parent A and one idea from Parent B, make something unique and innovative.
        2. Aim to keep the solution component simple and easily turned into parts of larger policy proposals later.
        3. Avoid overly complex combinations that would make the solution component impractical or difficult to understand.
        4. If the combined solution has more than two unique core ideas remove all but two of the core ideas in the solution component, if the ideas are closely related then do not filter them out.
        5. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
        6. Core ideas are distinct concepts or strategies that are central to the solution component.
        7. Do not refer to "the merged solution component" in your output, the solution component should be presented as a standalone solution component.        ${
        this.memory.customInstructions.createSolutions
            ? `
          Important Instructions (override the previous instructions if needed): ${this.memory.customInstructions.createSolutions}
          `
            : ""
        }

        Always output your merged solution component in the following JSON format: { title, description, mainBenefitOfSolutionComponent, mainObstacleToSolutionComponentAdoption }. Do not add any new JSON properties.
        Think step by step.
        `
      ),
      new HumanChatMessage(
        `
        ${this.renderProblemStatementSubProblemsAndEntities(subProblemIndex)}

        Solution Component Parent A:
        ${this.renderSolution(parentA)}

        Solution Component Parent B:
        ${this.renderSolution(parentB)}

        Generate and output JSON for the merged solution component below:
        `
      ),
    ];
  }

  renderMutatePrompt(
    individual: IEngineSolution,
    subProblemIndex: number,
    mutateRate: IEngineMutationRates | undefined = undefined
  ) {
    if (!mutateRate) {
      const random = Math.random();
      if (random < IEngineConstants.evolution.lowMutationRate) {
        mutateRate = "low";
      } else if (
        random <
        IEngineConstants.evolution.lowMutationRate +
          IEngineConstants.evolution.mediumMutationRate
      ) {
        mutateRate = "medium";
      } else {
        mutateRate = "high";
      }
    }

    this.logger.debug(`Mutate rate: ${mutateRate}`);

    return [
      new SystemChatMessage(
        `
        As an AI expert specializing in genetic algorithms, your task is to mutate the following solution component.

        Instructions:
        1. Implement mutations corresponding to a ${mutateRate} mutation rate.
        2. Mutation can involve introducing new attributes, modifying existing ones, or removing less important ones.
        3. Ensure the mutation is creative, meaningful, and continues to offer a viable solution component to part of the presented problem.
        4. Avoid referring to your output as "the merged solution component" or "the mutated solution component". Instead, present it as a standalone solution component.
        ${
        this.memory.customInstructions.createSolutions
            ? `
          Important Instructions (override the previous instructions if needed): ${this.memory.customInstructions.createSolutions}
          `
            : ""
        }

        Always format your mutated solution component in the following JSON structure: { title, description, mainBenefitOfSolutionComponent, mainObstacleToSolutionComponentAdoption }. Do not introduce any new JSON properties.
        Think step by step.
        `
      ),
      new HumanChatMessage(
        `
        ${this.renderProblemStatementSubProblemsAndEntities(subProblemIndex)}

        Solution component to mutate:
        ${this.renderSolution(individual)}

        Generate and output JSON for the mutated solution component below:
        `
      ),
    ];
  }

  async performRecombination(
    parentA: IEngineSolution,
    parentB: IEngineSolution,
    subProblemIndex: number
  ) {
    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.evolutionRecombineModel.temperature,
      maxTokens: IEngineConstants.evolutionRecombineModel.maxOutputTokens,
      modelName: IEngineConstants.evolutionRecombineModel.name,
      verbose: IEngineConstants.evolutionRecombineModel.verbose,
    });

    return (await this.callLLM(
      "evolve-recombine-population",
      IEngineConstants.evolutionRecombineModel,
      this.renderRecombinationPrompt(parentA, parentB, subProblemIndex)
    )) as IEngineSolution;
  }

  async recombine(
    parentA: IEngineSolution,
    parentB: IEngineSolution,
    subProblemIndex: number
  ) {
    const offspring = await this.performRecombination(
      parentA,
      parentB,
      subProblemIndex
    );
    return offspring;
  }

  async performMutation(
    individual: IEngineSolution,
    subProblemIndex: number,
    mutateRate: IEngineMutationRates | undefined = undefined
  ) {
    this.logger.debug("Performing mutation");
    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.evolutionMutateModel.temperature,
      maxTokens: IEngineConstants.evolutionMutateModel.maxOutputTokens,
      modelName: IEngineConstants.evolutionMutateModel.name,
      verbose: IEngineConstants.evolutionMutateModel.verbose,
    });

    this.logger.debug("Before mutation");

    try {
      const mutant = (await this.callLLM(
        "evolve-mutate-population",
        IEngineConstants.evolutionMutateModel,
        this.renderMutatePrompt(individual, subProblemIndex, mutateRate)
      )) as IEngineSolution;

      this.logger.debug("After mutation");

      return mutant;
    } catch (error) {
      this.logger.error("Error in mutation");
      this.logger.error(error);
      throw error;
    }
  }

  async mutate(
    individual: IEngineSolution,
    subProblemIndex: number,
    mutateRate: IEngineMutationRates | undefined = undefined
  ) {
    try {
      const mutant = await this.performMutation(
        individual,
        subProblemIndex,
        mutateRate
      );
      return mutant;
    } catch (error) {
      this.logger.error("Error in mutate");
      this.logger.error(error);
      throw error;
    }
  }

  async getNewSolutions(
    alreadyCreatedSolutions: IEngineSolution[],
    subProblemIndex: number
  ) {
    this.logger.info(`Getting new solutions`);

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.evolveSolutionsModel.temperature,
      maxTokens: IEngineConstants.evolveSolutionsModel.maxOutputTokens,
      modelName: IEngineConstants.evolveSolutionsModel.name,
      verbose: IEngineConstants.evolveSolutionsModel.verbose,
    });

    let alreadyCreatedSolutionsText;

    if (alreadyCreatedSolutions.length > 0) {
      alreadyCreatedSolutionsText = alreadyCreatedSolutions
        .map((solution) => solution.title)
        .join("\n");
    }

    const textContexts = await this.getTextContext(
      subProblemIndex,
      alreadyCreatedSolutionsText
    );

    this.logger.debug(
      `Evolution Text contexts: ${JSON.stringify(textContexts, null, 2)}`
    );

    const newSolutions = await this.createSolutions(
      subProblemIndex,
      textContexts.general,
      textContexts.scientific,
      textContexts.openData,
      textContexts.news,
      alreadyCreatedSolutionsText,
      "evolve-create-population"
    );

    return newSolutions;
  }

  selectParent(
    population: IEngineSolution[],
    excludedIndividual?: IEngineSolution
  ) {
    const tournamentSize =
      IEngineConstants.evolution.selectParentTournamentSize;

    let tournament = [];
    while (tournament.length < tournamentSize) {
      const randomIndex = Math.floor(Math.random() * population.length);
      if (excludedIndividual && population[randomIndex] === excludedIndividual)
        continue;
      tournament.push(population[randomIndex]);
    }

    tournament.sort((a, b) => b.eloRating! - a.eloRating!);
    return tournament[0];
  }

  getPreviousPopulation(subProblemIndex: number) {
    if (!this.memory.subProblems[subProblemIndex].solutions.populations) {
      this.memory.subProblems[subProblemIndex].solutions.populations = [];
    }

    if (
      this.memory.subProblems[subProblemIndex].solutions.populations.length > 0
    ) {
      return this.getActiveSolutionsLastPopulation(subProblemIndex);
    } else {
      this.logger.error("No previous population found." + subProblemIndex);
      throw new Error("No previous population found." + subProblemIndex);
    }
  }

  async addRandomMutation(
    newPopulation: IEngineSolution[],
    previousPopulation: IEngineSolution[],
    subProblemIndex: number
  ) {
    const populationSize = IEngineConstants.evolution.populationSize;
    let mutationCount = Math.floor(
      populationSize * IEngineConstants.evolution.mutationOffspringPercent
    );

    if (newPopulation.length + mutationCount > populationSize) {
      mutationCount = populationSize - newPopulation.length;
    }

    this.logger.debug(`Mutation count: ${mutationCount}`);

    for (let i = 0; i < mutationCount; i++) {
      this.logger.debug(`Mutation ${i + 1} of ${mutationCount}`);
      const parent = this.selectParent(previousPopulation);
      this.logger.debug(`Parent: ${parent.title}`);
      try {
        const mutant = await this.mutate(parent, subProblemIndex);
        this.logger.debug(`Mutant: ${JSON.stringify(mutant, null, 2)}`);
        newPopulation.push(mutant);
        this.logger.debug("After mutant push");
      } catch (error) {
        this.logger.error("Error in mutation top");
        this.logger.error(error);
        throw error;
      }
    }
  }

  async addCrossover(
    newPopulation: IEngineSolution[],
    previousPopulation: IEngineSolution[],
    subProblemIndex: number
  ) {
    // Crossover
    let crossoverCount = Math.floor(
      IEngineConstants.evolution.populationSize *
        IEngineConstants.evolution.crossoverPercent
    );

    this.logger.debug(`Crossover count: ${crossoverCount}`);

    for (let i = 0; i < crossoverCount; i++) {
      const parentA = this.selectParent(previousPopulation);
      const parentB = this.selectParent(previousPopulation, parentA);

      this.logger.debug(`Parent A: ${parentA.title}`);
      this.logger.debug(`Parent B: ${parentB.title}`);

      let offspring = await this.recombine(parentA, parentB, subProblemIndex);

      if (Math.random() < IEngineConstants.evolution.crossoverMutationPercent) {
        offspring = await this.mutate(offspring, subProblemIndex, "low");
      }

      this.logger.debug(`Offspring: ${JSON.stringify(offspring, null, 2)}`);

      newPopulation.push(offspring);
    }
  }

  async addRandomImmigration(
    newPopulation: IEngineSolution[],
    subProblemIndex: number
  ) {
    const populationSize = IEngineConstants.evolution.populationSize;

    let immigrationCount = Math.floor(
      populationSize * IEngineConstants.evolution.randomImmigrationPercent
    );

    this.logger.info(`Immigration count: ${immigrationCount}`);

    if (newPopulation.length + immigrationCount > populationSize) {
      immigrationCount = populationSize - newPopulation.length;
    }

    let newSolutions: IEngineSolution[] = [];

    this.logger.debug("Before creating new solutions");

    while (newSolutions.length < immigrationCount) {
      const currentSolutions = await this.getNewSolutions(
        newSolutions,
        subProblemIndex
      );
      this.logger.debug("After getting new solutions");

      newSolutions = [...newSolutions, ...currentSolutions];

      this.logger.debug(
        `New solutions for population: ${JSON.stringify(newSolutions, null, 2)}`
      );
    }

    if (newSolutions.length > immigrationCount) {
      newSolutions.splice(immigrationCount);
    }

    this.logger.debug("After creating new solutions: " + newSolutions.length);

    newPopulation.push(...newSolutions);
  }

  async evolveSubProblem(subProblemIndex: number) {
    this.logger.info(`Evolve population for sub problem ${subProblemIndex}`);
    this.logger.info(
      `Current number of generations: ${this.memory.subProblems[subProblemIndex].solutions.populations.length}`
    );

    let previousPopulation = this.getPreviousPopulation(subProblemIndex);

    this.logger.debug(`Previous populations size: ${previousPopulation.length}`)

    const newPopulation = [];

    const eliteCount = Math.floor(
      previousPopulation.length * IEngineConstants.evolution.keepElitePercent
    );

    this.logger.debug(`Elite count: ${eliteCount}`);

    // Add Elities
    for (let i = 0; i < eliteCount; i++) {
      if (previousPopulation[i].mainBenefitOfSolution) {
        previousPopulation[i].mainBenefitOfSolutionComponent = previousPopulation[i].mainBenefitOfSolution!;
      }

      if (previousPopulation[i].mainObstacleToSolutionAdoption) {
        previousPopulation[i].mainObstacleToSolutionComponentAdoption = previousPopulation[i].mainObstacleToSolutionAdoption!;
      }
      newPopulation.push(previousPopulation[i]);
      this.logger.debug(`Elite: ${previousPopulation[i].title}`);
    }

    await this.addRandomMutation(newPopulation, previousPopulation, subProblemIndex);

    await this.addRandomImmigration(newPopulation, subProblemIndex);

    await this.addCrossover(newPopulation, previousPopulation, subProblemIndex);

    this.logger.info(
      `New population size: ${newPopulation.length} for sub problem ${subProblemIndex}`
    );

    this.memory.subProblems[subProblemIndex].solutions.populations.push(
      newPopulation
    );

    this.logger.debug(
      `Current number of generations after push: ${this.memory.subProblems[subProblemIndex].solutions.populations.length}`
    );

    await this.saveMemory();
  }

  async evolvePopulation() {
    const subProblemPromises = [];
    for (
      let subProblemIndex = 0;
      subProblemIndex <
      Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
      subProblemIndex++
    ) {
      subProblemPromises.push(this.evolveSubProblem(subProblemIndex));
    }
    await Promise.all(subProblemPromises);
    this.logger.info("Evolve population all complete");
  }

  async process() {
    this.logger.info("Evolve Population Processor");

    try {
      await this.evolvePopulation();
    } catch (error: any) {
      this.logger.error("Error in Evolve Population Processor");
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
