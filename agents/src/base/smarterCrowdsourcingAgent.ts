import { Job } from "bullmq";
import { PolicySynthSimpleAgentBase } from "./simpleAgent.js";
import { PsConstants } from "../constants.js";
import { PolicySynthOperationsAgent } from "./operationsAgent.js";
import { PsAgent } from "../dbModels/agent.js";

export abstract class BaseSmarterCrowdsourcingAgent extends PolicySynthOperationsAgent {
  declare memory: PsSmarterCrowdsourcingMemoryData;
  job!: Job;
  currentSubProblemIndex: number | undefined;
  private startProgress: number;
  private endProgress: number;

  constructor(agent: PsAgent, startProgress: number, endProgress: number) {
    super(agent);
    this.startProgress = startProgress;
    this.endProgress = endProgress;
  }

  async initSmarterCrowdsourcingMemory() {
    this.memory = {
      ...this.memory,
      ...{
        lastSavedAt: Date.now(),
        customInstructions: {},
        problemStatement: {
          description: jobData.configuration.initialProblemStatement,
          searchQueries: {
            general: [],
            scientific: [],
            news: [],
            openData: [],
          },
          searchResults: {
            pages: {
              general: [],
              scientific: [],
              news: [],
              openData: [],
            },
          },
        },
        subProblems: [],
        currentStageData: undefined,
        status: {
          state: "processing",
          progress: 0,
          messages: [],
          lastUpdated: Date.now(),
        },
      },
    };
    await this.saveAgentMemory();
  }

  getProCons(prosCons: PsProCon[] | undefined) {
    if (prosCons && prosCons.length > 0) {
      return prosCons.map((proCon) => proCon.description);
    } else {
      return [];
    }
  }

  async process() {
    if (!this.memory) {
      this.logger.error("Memory is not initialized");
      throw new Error("Memory is not initialized");
    }

    const currentProgress =
      this.startProgress + (this.endProgress - this.startProgress) * 0.5; // 50% complete

    await this.updateProgress(currentProgress);
  }

  lastPopulationIndex(subProblemIndex: number) {
    return (
      this.memory.subProblems[subProblemIndex].solutions.populations.length - 1
    );
  }

  private async updateProgress(progress: number) {
    if (!this.memory.status) {
      this.memory.status = {
        state: "processing",
        progress: 0,
        messages: [],
        lastUpdated: Date.now(),
      };
    }

    this.memory.status.progress = progress;
    this.memory.status.lastUpdated = Date.now();

    // You might want to add a method in your base class to save memory to Redis
    await this.saveMemoryToRedis();
  }

  renderSubProblem(subProblemIndex: number, useProblemAsHeader = false) {
    const subProblem = this.memory.subProblems[subProblemIndex];
    return `
      ${useProblemAsHeader ? "Problem" : "Sub Problem"}:
      ${subProblem.title}

      ${subProblem.description}

      ${subProblem.whyIsSubProblemImportant}
      `;
  }

  renderSubProblemSimple(subProblemIndex: number) {
    const subProblem = this.memory.subProblems[subProblemIndex];
    return `
      ${subProblem.title}
      ${subProblem.description}
      `;
  }

  getActiveSolutionsLastPopulation(subProblemIndex: number) {
    const populations =
      this.memory.subProblems[subProblemIndex].solutions.populations;
    const lastPopulation = populations[populations.length - 1];
    return lastPopulation.filter((solution) => !solution.reaped);
  }

  getActiveSolutionsFromPopulation(
    subProblemIndex: number,
    populationIndex: number
  ) {
    const populations =
      this.memory.subProblems[subProblemIndex].solutions.populations;
    const lastPopulation = populations[populationIndex];
    return lastPopulation.filter((solution) => !solution.reaped);
  }

  numberOfPopulations(subProblemIndex: number) {
    return this.memory.subProblems[subProblemIndex].solutions.populations
      .length;
  }

  renderSubProblems() {
    return `
      Sub Problems:
      ${this.memory.subProblems.map((subProblem, index) => {
        return `
        ${index + 1}. ${subProblem.title}\n

        ${subProblem.description}\n

        ${subProblem.whyIsSubProblemImportant}\n
        `;
      })}
   `;
  }

  renderEntity(subProblemIndex: number, entityIndex: number) {
    const entity =
      this.memory.subProblems[subProblemIndex].entities[entityIndex];
    return `
      Entity: ${entity.name}
      ${this.renderEntityPosNegReasons(entity)}
      `;
  }

  renderProblemStatement() {
    return `
      Problem Statement:
      ${this.memory.problemStatement.description}
      `;
  }

  renderProblemStatementSubProblemsAndEntities(
    index: number,
    includeMainProblemStatement = true
  ) {
    const subProblem = this.memory.subProblems[index];
    const entitiesText = `
      ${subProblem.entities
        .slice(0, PsConstants.maxTopEntitiesToRender)
        .map((entity) => {
          let entityEffects = this.renderEntityPosNegReasons(entity);

          if (entityEffects.length > 0) {
            entityEffects = `\n${entity.name}\n${entityEffects}\n}`;
          }

          return entityEffects;
        })
        .join("")}`;
    return `
      ${
        includeMainProblemStatement
          ? `Problem Statement:\n${this.memory.problemStatement.description}\n\nSub Problem:\n`
          : `Problem:\n`
      }
      ${subProblem.title}\n
      ${subProblem.description}\n

      ${entitiesText ? `Top Affected Entities:\n${entitiesText}` : ""}
    `;
  }

  renderEntityPosNegReasons(item: PsAffectedEntity) {
    let itemEffects = "";

    if (item.positiveEffects && item.positiveEffects.length > 0) {
      itemEffects += `
      Positive Effects:
      ${item.positiveEffects.join("\n")}
      `;
    }

    if (item.negativeEffects && item.negativeEffects.length > 0) {
      itemEffects += `
      Negative Effects:
      ${item.negativeEffects.join("\n")}
      `;
    }

    return itemEffects;
  }
}
