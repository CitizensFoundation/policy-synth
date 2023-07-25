import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import { CreateSolutionsProcessor } from "../create/createSolutions.js";
//TODO: Pentalty for similar ideas in the ranking somehow
//TODO: Track the evolution of the population with a log of parents and mutations, family tree
export class EvolvePopulationProcessor extends CreateSolutionsProcessor {
    renderSolution(solution) {
        return JSON.stringify({
            title: solution.title,
            description: solution.description,
            mainBenefitOfSolution: solution.mainBenefitOfSolution,
            mainObstacleToSolutionAdoption: solution.mainObstacleToSolutionAdoption,
        }, null, 2);
    }
    renderRecombinationPrompt(parentA, parentB, subProblemIndex) {
        return [
            new SystemChatMessage(`
        As an AI genetic algorithm expert, your task is to create a new solution by merging the best attribute of two parent solutions (Parent A and Parent B).

        Please consider the following guidelines when developing your merged solution:
        1. The merged solution should contain one best attribute from "Parent A" and one best attribute from "Parent B".
        2. The combination should be logical, meaningful and present a standalone solution to the problem at hand.
        3. Aim to keep the solution simple and easily implementable. Avoid overly complex combinations that would make the solution impractical or difficult to understand.
        4. If the combined solution is too comprehensive or complicated, simplify the merge solution by removing some attributes from it.
        5. Do not refer to "the merged solution" in your output, the solution should be presented as a standalone solution.
        6. Output your merged solution in the following JSON format: { title, description, mainBenefitOfSolution, mainObstacleToSolutionAdoption }. Do not add any new JSON properties.
        7. Think step by step.
        `),
            new HumanChatMessage(`
        ${this.renderProblemStatementSubProblemsAndEntities(subProblemIndex)}

        Parent A:
        ${this.renderSolution(parentA)}

        Parent B:
        ${this.renderSolution(parentB)}

        Generate and output JSON for the merged solution below:
        `),
        ];
    }
    renderMutatePrompt(individual, subProblemIndex, mutateRate = undefined) {
        if (!mutateRate) {
            const random = Math.random();
            if (random < IEngineConstants.evolution.lowMutationRate) {
                mutateRate = "low";
            }
            else if (random <
                IEngineConstants.evolution.lowMutationRate +
                    IEngineConstants.evolution.mediumMutationRate) {
                mutateRate = "medium";
            }
            else {
                mutateRate = "high";
            }
        }
        this.logger.debug(`Mutate rate: ${mutateRate}`);
        return [
            new SystemChatMessage(`
        As an AI expert specializing in genetic algorithms, your task is to mutate the following solution.

        Please adhere to these guidelines:
        1. Implement mutations corresponding to a "${mutateRate}" rate. The rate determines the extent of changes to the solution.
        2. Mutation can involve introducing new attributes, modifying existing ones, or removing less important ones.
        3. If the solution is overly complex, consider simplifying it by removing the least crucial attributes.
        4. Ensure the mutation is logical, meaningful, and continues to offer a viable solution to the presented problem.
        5. Avoid referring to your output as "the merged solution" or "the mutated solution". Instead, present it as a standalone solution.
        6. Format your mutated solution in the following JSON structure: { title, description, mainBenefitOfSolution, mainObstacleToSolutionAdoption }. Do not introduce any new JSON properties.
        7. Approach the mutation process step by step.
        `),
            new HumanChatMessage(`
        ${this.renderProblemStatementSubProblemsAndEntities(subProblemIndex)}

        Solution to mutate:
        ${this.renderSolution(individual)}

        Generate and output JSON for the mutated solution below:
        `),
        ];
    }
    async performRecombination(parentA, parentB, subProblemIndex) {
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.evolutionRecombineModel.temperature,
            maxTokens: IEngineConstants.evolutionRecombineModel.maxOutputTokens,
            modelName: IEngineConstants.evolutionRecombineModel.name,
            verbose: IEngineConstants.evolutionRecombineModel.verbose,
        });
        return (await this.callLLM("evolve-recombine-population", IEngineConstants.evolutionRecombineModel, this.renderRecombinationPrompt(parentA, parentB, subProblemIndex)));
    }
    async recombine(parentA, parentB, subProblemIndex) {
        const offspring = await this.performRecombination(parentA, parentB, subProblemIndex);
        return offspring;
    }
    async performMutation(individual, subProblemIndex, mutateRate = undefined) {
        this.logger.debug("Performing mutation");
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.evolutionMutateModel.temperature,
            maxTokens: IEngineConstants.evolutionMutateModel.maxOutputTokens,
            modelName: IEngineConstants.evolutionMutateModel.name,
            verbose: IEngineConstants.evolutionMutateModel.verbose,
        });
        this.logger.debug("Before mutation");
        try {
            const mutant = (await this.callLLM("evolve-mutate-population", IEngineConstants.evolutionMutateModel, this.renderMutatePrompt(individual, subProblemIndex, mutateRate)));
            this.logger.debug("After mutation");
            return mutant;
        }
        catch (error) {
            this.logger.error("Error in mutation");
            this.logger.error(error);
            throw error;
        }
    }
    async mutate(individual, subProblemIndex, mutateRate = undefined) {
        try {
            const mutant = await this.performMutation(individual, subProblemIndex, mutateRate);
            return mutant;
        }
        catch (error) {
            this.logger.error("Error in mutate");
            this.logger.error(error);
            throw error;
        }
    }
    async getNewSolutions(alreadyCreatedSolutions, subProblemIndex) {
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
        const textContexts = await this.getTextContext(subProblemIndex, alreadyCreatedSolutionsText);
        this.logger.debug(`Evolution Text contexts: ${JSON.stringify(textContexts, null, 2)}`);
        const newSolutions = await this.createSolutions(subProblemIndex, textContexts.general, textContexts.scientific, textContexts.openData, textContexts.news, alreadyCreatedSolutionsText, "evolve-create-population");
        return newSolutions;
    }
    selectParent(population, excludedIndividual) {
        const tournamentSize = IEngineConstants.evolution.selectParentTournamentSize;
        let tournament = [];
        while (tournament.length < tournamentSize) {
            const randomIndex = Math.floor(Math.random() * population.length);
            if (excludedIndividual && population[randomIndex] === excludedIndividual)
                continue;
            tournament.push(population[randomIndex]);
        }
        tournament.sort((a, b) => b.eloRating - a.eloRating);
        return tournament[0];
    }
    getPreviousPopulation(subProblemIndex) {
        if (!this.memory.subProblems[subProblemIndex].solutions.populations) {
            this.memory.subProblems[subProblemIndex].solutions.populations = [];
        }
        if (this.memory.subProblems[subProblemIndex].solutions.populations.length > 0) {
            return this.memory.subProblems[subProblemIndex].solutions.populations[this.memory.subProblems[subProblemIndex].solutions.populations.length -
                1];
        }
        else {
            this.logger.error("No previous population found." + subProblemIndex);
            throw new Error("No previous population found." + subProblemIndex);
        }
    }
    async evolveSubProblem(subProblemIndex) {
        this.logger.info(`Evolve population for sub problem ${subProblemIndex}`);
        this.logger.info(`Current number of generations: ${this.memory.subProblems[subProblemIndex].solutions.populations.length}`);
        let previousPopulation = this.getPreviousPopulation(subProblemIndex);
        const populationSize = IEngineConstants.evolution.populationSize;
        const newPopulation = [];
        const eliteCount = Math.floor(previousPopulation.length * IEngineConstants.evolution.keepElitePercent);
        this.logger.debug(`Elite count: ${eliteCount}`);
        for (let i = 0; i < eliteCount; i++) {
            newPopulation.push(previousPopulation[i]);
            this.logger.debug(`Elite: ${previousPopulation[i].title}`);
        }
        // Mutation
        let mutationCount = Math.floor(populationSize * IEngineConstants.evolution.mutationOffspringPercent);
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
            }
            catch (error) {
                this.logger.error("Error in mutation top");
                this.logger.error(error);
                throw error;
            }
        }
        // Crossover
        let crossoverCount = Math.floor(populationSize * IEngineConstants.evolution.crossoverPercent);
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
        // Immigration
        let immigrationCount = Math.floor(populationSize * IEngineConstants.evolution.randomImmigrationPercent);
        this.logger.info(`Immigration count: ${immigrationCount}`);
        if (newPopulation.length + immigrationCount > populationSize) {
            immigrationCount = populationSize - newPopulation.length;
        }
        let newSolutions = [];
        this.logger.debug("Before creating new solutions");
        while (newSolutions.length < immigrationCount) {
            const currentSolutions = await this.getNewSolutions(newSolutions, subProblemIndex);
            this.logger.debug("After getting new solutions");
            newSolutions = [...newSolutions, ...currentSolutions];
            this.logger.debug(`New solutions for population: ${JSON.stringify(newSolutions, null, 2)}`);
        }
        if (newSolutions.length > immigrationCount) {
            newSolutions.splice(immigrationCount);
        }
        this.logger.debug("After creating new solutions: " + newSolutions.length);
        newPopulation.push(...newSolutions);
        this.logger.info(`New population size: ${newPopulation.length} for sub problem ${subProblemIndex}`);
        this.memory.subProblems[subProblemIndex].solutions.populations.push(newPopulation);
        this.logger.debug(`Current number of generations after push: ${this.memory.subProblems[subProblemIndex].solutions.populations.length}`);
        await this.saveMemory();
    }
    async evolvePopulation() {
        const subProblemPromises = [];
        for (let subProblemIndex = 0; subProblemIndex <
            Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems); subProblemIndex++) {
            subProblemPromises.push(this.evolveSubProblem(subProblemIndex));
        }
        await Promise.all(subProblemPromises);
        this.logger.info("Evolve population all complete");
    }
    async process() {
        this.logger.info("Evolve Population Processor");
        try {
            await this.evolvePopulation();
        }
        catch (error) {
            this.logger.error("Error in Evolve Population Processor");
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
