import winston from "winston";
import { PsConstants } from "../constants.js";
import { jsonrepair } from "jsonrepair";
import ioredis from "ioredis";
//@ts-ignore
const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const logger = winston.createLogger({
    level: process.env.WORKER_LOG_LEVEL || "debug",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
    ],
});
export class PolicySynthBaseAgent {
    memory;
    logger;
    timeStart = Date.now();
    chat;
    rateLimits = {};
    constructor(memory = undefined) {
        if (memory) {
            this.memory = memory;
        }
        this.logger = logger;
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
    repairJson(text) {
        let repaired;
        try {
            repaired = jsonrepair(text);
        }
        catch (error) {
            this.logger.error(error);
            throw new Error("Unable to repair JSON");
        }
        return repaired;
    }
    parseJsonResponse(response) {
        let parsedJson;
        response = response.replace("```json", "").trim();
        if (response.endsWith("```")) {
            response = response.substring(0, response.length - 3);
        }
        try {
            parsedJson = JSON.parse(response);
        }
        catch (error) {
            this.logger.warn(`Error parsing JSON ${response}`);
            try {
                this.logger.info(`Trying to fix JSON`);
                parsedJson = JSON.parse(this.repairJson(response));
                this.logger.info("Fixed JSON");
            }
            catch (error) {
                this.logger.warn(`Error parsing fixed JSON`);
                throw new Error("Unable to parse JSON");
            }
        }
        return parsedJson;
    }
    async callLLM(stage, modelConstants, messages, parseJson = true, limitedRetries = false, tokenOutEstimate = 120, streamingCallbacks) {
        try {
            let retryCount = 0;
            const maxRetries = limitedRetries
                ? PsConstants.limitedLLMmaxRetryCount
                : PsConstants.mainLLMmaxRetryCount;
            let retry = true;
            while (retry && retryCount < maxRetries && this.chat) {
                let response;
                try {
                    const tokensIn = await this.getTokensFromMessages(messages);
                    const estimatedTokensToAdd = tokensIn + tokenOutEstimate;
                    await this.checkRateLimits(modelConstants, estimatedTokensToAdd);
                    await this.updateRateLimits(modelConstants, tokensIn);
                    response = await this.chat.call(messages, undefined, streamingCallbacks ? streamingCallbacks : undefined);
                    if (response) {
                        const tokensOut = await this.getTokensFromMessages([response]);
                        await this.updateRateLimits(modelConstants, tokensOut);
                        if (parseJson) {
                            let parsedJson;
                            try {
                                parsedJson = this.parseJsonResponse(response.text.trim());
                            }
                            catch (error) {
                                retryCount++;
                                this.logger.warn(`Retrying callLLM ${retryCount}`);
                                continue;
                            }
                            if (parsedJson == '"[]"' ||
                                parsedJson == "[]" ||
                                parsedJson == "'[]'") {
                                this.logger.warn(`JSON processing returned an empty array string ${parsedJson}`);
                                parsedJson = [];
                            }
                            return parsedJson;
                        }
                        else {
                            return response.text.trim();
                        }
                    }
                    else {
                        retryCount++;
                        this.logger.warn(`callLLM response was empty, retrying`);
                    }
                }
                catch (error) {
                    this.logger.warn("Error from LLM, retrying");
                    if (error.message && error.message.indexOf("429") > -1) {
                        this.logger.warn("429 error, retrying");
                    }
                    if (error.message &&
                        (error.message.indexOf("Failed to generate output due to special tokens in the input") > -1 ||
                            error.message.indexOf("The model produced invalid content. Consider modifying") > -1)) {
                        this.logger.error("Failed to generate output due to special tokens in the input stopping or The model produced invalid content.");
                        retryCount = maxRetries;
                    }
                    else {
                        this.logger.warn(error);
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
        if (!this.rateLimits[model.name]) {
            this.rateLimits[model.name] = {
                requests: [],
                tokens: [],
            };
        }
        this.addRequestTimestamp(model);
        this.addTokenEntry(model, tokensToAdd);
    }
    async checkRateLimits(model, tokensToAdd) {
        let now = Date.now();
        const windowSize = 60000; // 60 seconds
        if (!this.rateLimits[model.name]) {
            this.rateLimits[model.name] = {
                requests: [],
                tokens: [],
            };
        }
        this.slideWindowForRequests(model);
        this.slideWindowForTokens(model);
        const limits = this.rateLimits[model.name];
        if (limits.requests.length >= model.limitRPM) {
            const remainingTimeRequests = 60000 - (now - limits.requests[0].timestamp);
            this.logger.info(`RPM limit reached (${model.limitRPM}), sleeping for ${this.formatNumber((remainingTimeRequests + 1000) / 1000)} seconds`);
            await new Promise((resolve) => setTimeout(resolve, remainingTimeRequests + 1000));
        }
        now = Date.now();
        const currentTokensCount = limits.tokens.reduce((acc, token) => acc + token.count, 0);
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
    addRequestTimestamp(model) {
        const now = Date.now();
        this.rateLimits[model.name].requests.push({ timestamp: now });
    }
    addTokenEntry(model, tokensToAdd) {
        const now = Date.now();
        this.rateLimits[model.name].tokens.push({
            count: tokensToAdd,
            timestamp: now,
        });
    }
    slideWindowForRequests(model) {
        const now = Date.now();
        const windowSize = 60000; // 60 seconds
        this.rateLimits[model.name].requests = this.rateLimits[model.name].requests.filter((request) => now - request.timestamp < windowSize);
    }
    slideWindowForTokens(model) {
        const now = Date.now();
        const windowSize = 60000; // 60 seconds
        this.rateLimits[model.name].tokens = this.rateLimits[model.name].tokens.filter((token) => now - token.timestamp < windowSize);
    }
    async getTokensFromMessages(messages) {
        const tokens = await this.chat.getNumTokensFromMessages(messages);
        return tokens.totalCount;
    }
}
//# sourceMappingURL=baseAgent.js.map