import { Base } from "../../base.js";
import { IEngineConstants } from "../../constants.js";
import { jsonrepair } from 'jsonrepair';
import ioredis from "ioredis";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
export class BaseProcessor extends Base {
    memory;
    job;
    chat;
    currentSubProblemIndex;
    constructor(job, memory) {
        super();
        this.job = job;
        this.memory = memory;
    }
    async process() {
        if (!this.memory) {
            this.logger.error("Memory is not initialized");
            throw new Error("Memory is not initialized");
        }
    }
    async saveMemory() {
        await redis.set(this.memory.redisKey, JSON.stringify(this.memory));
    }
    lastPopulationIndex(subProblemIndex) {
        return this.memory.subProblems[subProblemIndex].solutions.populations.length - 1;
    }
    renderSubProblem(subProblemIndex, useProblemAsHeader = false) {
        const subProblem = this.memory.subProblems[subProblemIndex];
        return `
      ${useProblemAsHeader ? 'Problem' : 'Sub Problem'}:
      ${subProblem.title}

      ${subProblem.description}

      ${subProblem.whyIsSubProblemImportant}
      `;
    }
    getActiveSolutionsLastPopulation(subProblemIndex) {
        const populations = this.memory.subProblems[subProblemIndex].solutions.populations;
        const lastPopulation = populations[populations.length - 1];
        return lastPopulation.filter(solution => !solution.reaped);
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
    renderProblemStatement() {
        return `
      Problem Statement:
      ${this.memory.problemStatement.description}
      `;
    }
    renderProblemStatementSubProblemsAndEntities(index) {
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
    renderEntityPosNegReasons(item) {
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
    async callLLM(stage, modelConstants, messages, parseJson = true) {
        try {
            let retryCount = 0;
            const maxRetries = IEngineConstants.mainLLMmaxRetryCount;
            let retry = true;
            while (retry && retryCount < maxRetries && this.chat) {
                let response;
                try {
                    response = await this.chat.call(messages);
                    if (response) {
                        this.logger.debug("Got response from LLM");
                        const tokensIn = await this.chat.getNumTokensFromMessages(messages);
                        const tokensOut = await this.chat.getNumTokensFromMessages([
                            response,
                        ]);
                        if (!this.memory.stages[stage]) {
                            this.memory.stages[stage] = {
                                tokensIn: 0,
                                tokensOut: 0,
                                tokensInCost: 0,
                                tokensOutCost: 0,
                            };
                        }
                        if (this.memory.stages[stage].tokensIn === undefined) {
                            this.memory.stages[stage].tokensIn = 0;
                            this.memory.stages[stage].tokensOut = 0;
                            this.memory.stages[stage].tokensInCost = 0;
                            this.memory.stages[stage].tokensOutCost = 0;
                        }
                        this.memory.stages[stage].tokensIn += tokensIn.totalCount;
                        this.memory.stages[stage].tokensOut += tokensOut.totalCount;
                        this.memory.stages[stage].tokensInCost +=
                            tokensIn.totalCount * modelConstants.inTokenCostUSD;
                        this.memory.stages[stage].tokensOutCost +=
                            tokensOut.totalCount * modelConstants.outTokenCostUSD;
                        try {
                            await this.saveMemory();
                        }
                        catch (error) {
                            this.logger.error("Error saving memory");
                        }
                        if (parseJson) {
                            let parsedJson;
                            try {
                                parsedJson = JSON.parse(response.text.trim());
                            }
                            catch (error) {
                                this.logger.warn(`Error parsing JSON ${response.text.trim()}`);
                                try {
                                    this.logger.info(`Trying to fix JSON`);
                                    const repaired = jsonrepair(response.text.trim());
                                    parsedJson = JSON.parse(repaired);
                                }
                                catch (error) {
                                    this.logger.warn(`Error parsing fixed JSON`);
                                    this.logger.error(error);
                                    retryCount++;
                                }
                            }
                            if (parsedJson) {
                                retry = false;
                                return parsedJson;
                            }
                            retryCount++;
                            this.logger.warn(`Retrying callLLM ${retryCount}`);
                        }
                        else {
                            retry = false;
                            if (response.text) {
                                return response.text.trim();
                            }
                            else {
                                throw new Error(`callLLM response was empty ${JSON.stringify(response)}`);
                            }
                        }
                    }
                    else {
                        retry = false;
                        this.logger.warn(`callLLM response was empty, retrying`);
                        if (retryCount >= maxRetries) {
                            throw new Error("callLLM response was empty");
                            ;
                        }
                        else {
                            retryCount++;
                        }
                    }
                }
                catch (error) {
                    this.logger.warn("Error from LLM, retrying");
                    if (error.message && error.message.indexOf("429") > -1) {
                        this.logger.warn("429 error, retrying");
                    }
                    else {
                        this.logger.warn(error);
                        // Output the stack strace
                        this.logger.warn(error.stack);
                    }
                    if (retryCount >= maxRetries) {
                        throw error;
                    }
                    else {
                        retryCount++;
                    }
                }
                const sleepTime = 4500 + retryCount * 5000;
                this.logger.debug(`Sleeping for ${sleepTime} ms before retrying. Retry count: ${retryCount}}`);
                await new Promise((resolve) => setTimeout(resolve, sleepTime));
            }
        }
        catch (error) {
            this.logger.error("Unrecoverable Error in callLLM method");
            this.logger.error(error);
            throw error;
        }
    }
}
