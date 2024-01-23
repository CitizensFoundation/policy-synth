import { Job } from "bullmq";
import { PolicySynthAgentBase } from "../base.js";
import {
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { IEngineConstants } from "../constants.js";

export abstract class BaseProcessor extends PolicySynthAgentBase {
  override memory: IEngineInnovationMemoryData;
  job!: Job;
  currentSubProblemIndex: number | undefined;

  constructor(job: Job, memory: IEngineInnovationMemoryData) {
    super();
    this.job = job;
    this.memory = memory;
  }

  getProCons(prosCons: IEngineProCon[] | undefined) {
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
  }

  lastPopulationIndex(subProblemIndex: number) {
    return (
      this.memory.subProblems[subProblemIndex].solutions.populations.length - 1
    );
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

  renderProblemStatementSubProblemsAndEntities(index: number) {
    const subProblem = this.memory.subProblems[index];
    const entitiesText = `
      ${subProblem.entities
        .slice(0, IEngineConstants.maxTopEntitiesToRender)
        .map((entity) => {
          let entityEffects = this.renderEntityPosNegReasons(entity);

          if (entityEffects.length > 0) {
            entityEffects = `\n${entity.name}\n${entityEffects}\n}`;
          }

          return entityEffects;
        })
        .join("")}`;
    return `
      Problem Statement:\n
      ${this.memory.problemStatement.description}\n

      Sub Problem:\n
      ${subProblem.title}\n
      ${subProblem.description}\n

      ${entitiesText ? `Top Affected Entities:\n${entitiesText}` : ""}
    `;
  }

  renderEntityPosNegReasons(item: IEngineAffectedEntity) {
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
