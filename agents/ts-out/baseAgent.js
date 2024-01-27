import winston from "winston";
import { IEngineConstants } from "./constants.js";
import { jsonrepair } from "jsonrepair";
import ioredis from "ioredis";
//@ts-ignore
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const logger = winston.createLogger({
    level: process.env.WORKER_LOG_LEVEL || "debug",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
    ],
});
export class PolicySynthAgentBase {
    constructor(memory = undefined) {
        this.timeStart = Date.now();
        this.rateLimits = {};
        if (memory) {
            this.memory = memory;
        }
        this.logger = logger;
    }
    static get emptyStages() {
        return {
            "create-root-causes-search-queries": {},
            "web-search-root-causes": {},
            "web-get-root-causes-pages": {},
            "rank-web-root-causes": {},
            "rate-web-root-causes": {},
            "web-get-refined-root-causes": {},
            "get-metadata-for-top-root-causes": {},
            "create-problem-statement-image": {},
            "create-sub-problems": {},
            "rank-sub-problems": {},
            "policies-seed": {},
            "policies-create-images": {},
            "create-entities": {},
            "rank-entities": {},
            "reduce-sub-problems": {},
            "create-search-queries": {},
            "rank-root-causes-search-results": {},
            "rank-root-causes-search-queries": {},
            "create-sub-problem-images": {},
            "rank-search-queries": {},
            "web-search": {},
            "rank-web-solutions": {},
            "rate-solutions": {},
            "rank-search-results": {},
            "web-get-pages": {},
            "create-seed-solutions": {},
            "create-pros-cons": {},
            "create-solution-images": {},
            "rank-pros-cons": {},
            "rank-solutions": {},
            "group-solutions": {},
            "evolve-create-population": {},
            "evolve-mutate-population": {},
            "evolve-recombine-population": {},
            "evolve-reap-population": {},
            "topic-map-solutions": {},
            "evolve-rank-population": {},
            "analyse-external-solutions": {},
            "create-evidence-search-queries": {},
            "web-get-evidence-pages": {},
            "web-search-evidence": {},
            "rank-web-evidence": {},
            "rate-web-evidence": {},
            "web-get-refined-evidence": {},
            "get-metadata-for-top-evidence": {},
            "validation-agent": {},
        };
    }
    getJsonBlock(text) {
        let startIndex, endIndex;
        startIndex = text.indexOf("```json");
        endIndex = text.indexOf("```", startIndex + 6);
        if (endIndex !== -1) {
            let jsonContent = text.substring(startIndex + 7, endIndex).trim();
            return jsonContent;
        }
        else {
            throw new Error("Unable to find JSON block");
        }
    }
    get fullLLMCostsForMemory() {
        let totalCost = undefined;
        if (this.memory && this.memory.stages) {
            totalCost = 0;
            Object.values(this.memory.stages).forEach(stage => {
                if (stage.tokensInCost && stage.tokensOutCost) {
                    totalCost += stage.tokensInCost + stage.tokensOutCost;
                }
            });
        }
        return totalCost;
    }
    getRepairedJson(text) {
        let repaired;
        try {
            repaired = jsonrepair(text);
            return JSON.parse(repaired);
        }
        catch (error) {
            this.logger.error(error);
        }
        if (repaired) {
            return JSON.parse(repaired);
        }
        else if (text.indexOf("```json") > -1) {
            repaired = this.getJsonBlock(text);
            if (repaired) {
                return JSON.parse(repaired);
            }
        }
        else {
            throw new Error("Unable to repair JSON");
        }
    }
    async callLLM(stage, modelConstants, messages, parseJson = true, limitedRetries = false, tokenOutEstimate = 120, streamingCallbacks) {
        try {
            let retryCount = 0;
            const maxRetries = limitedRetries
                ? IEngineConstants.limitedLLMmaxRetryCount
                : IEngineConstants.mainLLMmaxRetryCount;
            let retry = true;
            while (retry && retryCount < maxRetries && this.chat) {
                let response;
                try {
                    const tokensIn = await this.chat.getNumTokensFromMessages(messages);
                    const estimatedTokensToAdd = tokensIn.totalCount + tokenOutEstimate;
                    await this.checkRateLimits(modelConstants, estimatedTokensToAdd);
                    await this.updateRateLimits(modelConstants, tokensIn.totalCount);
                    //TODO: Get JSON param to work when that option can be tested in the playground
                    //response = await this.chat.call(messages, {response_format: {"type": "json_object"}});
                    response = await this.chat.call(messages, undefined, streamingCallbacks ? streamingCallbacks : undefined);
                    if (response) {
                        //this.logger.debug("Got response from LLM");
                        const tokensIn = await this.chat.getNumTokensFromMessages(messages);
                        const tokensOut = await this.chat.getNumTokensFromMessages([
                            response,
                        ]);
                        if (this.memory) {
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
                        }
                        else {
                            this.logger.debug("Memory is not initialized and token counts not updated");
                        }
                        await this.updateRateLimits(modelConstants, tokensOut.totalCount);
                        if (parseJson) {
                            let parsedJson, originalText;
                            try {
                                originalText = response.text.trim();
                                parsedJson = response.text.trim().replace(/```json/g, "");
                                parsedJson = parsedJson.replace(/```/g, "");
                                parsedJson = JSON.parse(parsedJson);
                            }
                            catch (error) {
                                this.logger.warn(`Error parsing JSON ${response.text.trim()}`);
                                try {
                                    this.logger.info(`Trying to fix JSON 1`);
                                    parsedJson = this.getRepairedJson(originalText);
                                    this.logger.info("Fixed JSON");
                                }
                                catch (error) {
                                    this.logger.warn(`Error parsing fixed JSON`);
                                    try {
                                        this.logger.info(`Trying to fix JSON AGAIN`);
                                        // Edge case hack that jsonrepair can't fix
                                        const preprocessed = response.text
                                            .trim()
                                            .replace(/"(\d+)(-[A-Za-z]+)"/g, "$1$2");
                                        const repaired = jsonrepair(preprocessed);
                                        parsedJson = JSON.parse(repaired);
                                    }
                                    catch (error) {
                                        this.logger.warn(`Error parsing fixed JSON AGAIN`);
                                        this.logger.error(error);
                                        retryCount++;
                                    }
                                }
                            }
                            if (parsedJson) {
                                retry = false;
                                if (parsedJson == '"[]"' ||
                                    parsedJson == "[]" ||
                                    parsedJson == "'[]'") {
                                    this.logger.warn(`JSON processing returned an empty array string ${parsedJson}`);
                                    parsedJson = [];
                                }
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
    async updateRateLimits(model, tokensToAdd) {
        const now = Date.now();
        // If the model's rate limits are not defined, initialize them
        if (!this.rateLimits[model.name]) {
            this.rateLimits[model.name] = {
                requests: [],
                tokens: [],
            };
        }
        // Add a new request timestamp
        this.rateLimits[model.name].requests.push({ timestamp: now });
        // Add a new token entry with the count and timestamp
        this.rateLimits[model.name].tokens.push({
            count: tokensToAdd,
            timestamp: now,
        });
        // Optionally, you may log the updated limits
        //this.logger.debug(`Updated rate limits for ${model.name} model: ${JSON.stringify(this.rateLimits[model.name])}`);
    }
    async checkRateLimits(model, tokensToAdd) {
        let now = Date.now();
        const windowSize = 60000; // 60 seconds
        // Initialize if not exist
        if (!this.rateLimits[model.name]) {
            this.rateLimits[model.name] = {
                requests: [],
                tokens: [],
            };
        }
        const limits = this.rateLimits[model.name];
        // Slide the window for requests
        limits.requests = limits.requests.filter((request) => now - request.timestamp < windowSize);
        // Check and update requests
        if (limits.requests.length >= model.limitRPM) {
            const remainingTimeRequests = 60000 - (now - limits.requests[0].timestamp);
            this.logger.info(`RPM limit reached (${model.limitRPM}), sleeping for ${this.formatNumber((remainingTimeRequests + 1000) / 1000)} seconds`);
            await new Promise((resolve) => setTimeout(resolve, remainingTimeRequests + 1000));
        }
        now = Date.now();
        // Slide the window for tokens
        limits.tokens = limits.tokens.filter((token) => now - token.timestamp < windowSize);
        // Check and update tokens
        const currentTokensCount = limits.tokens.reduce((acc, token) => acc + token.count, 0);
        /*this.logger.debug(
          `Current ${limits.requests.length}/${currentTokensCount}`
        );*/
        if (currentTokensCount + tokensToAdd > model.limitTPM) {
            const remainingTimeTokens = 60000 - (now - limits.tokens[0].timestamp);
            this.logger.info(`TPM limit reached (${model.limitTPM}), sleeping for ${this.formatNumber((remainingTimeTokens + 1000) / 1000)} seconds`);
            await new Promise((resolve) => setTimeout(resolve, remainingTimeTokens + 1000));
        }
    }
    formatNumber(number, fractions = 0) {
        return new Intl.NumberFormat("en-US", {
            maximumFractionDigits: fractions,
        }).format(number);
    }
    async saveMemory() {
        if (this.memory) {
            await redis.set(this.memory.redisKey, JSON.stringify(this.memory));
        }
        else {
            this.logger.warn("Memory is not initialized");
        }
    }
}
//# sourceMappingURL=baseAgent.js.map