import winston from "winston";
import { jsonrepair } from "jsonrepair";
export class PolicySynthBaseAgent {
    logger;
    timeStart = Date.now();
    rateLimits = {};
    maxModelTokensOut;
    modelTemperature;
    constructor() {
        this.logger = winston.createLogger({
            level: process.env.WORKER_LOG_LEVEL || "debug",
            format: winston.format.json(),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
                }),
            ],
        });
    }
    createSystemMessage(content) {
        return { role: "system", message: content };
    }
    createHumanMessage(content) {
        return { role: "human", message: content };
    }
    getJsonBlock(text) {
        let startIndex = text.indexOf("```json");
        let endIndex = text.indexOf("```", startIndex + 6);
        if (endIndex !== -1) {
            return text.substring(startIndex + 7, endIndex).trim();
        }
        else {
            throw new Error("Unable to find JSON block");
        }
    }
    repairJson(text) {
        try {
            return jsonrepair(text);
        }
        catch (error) {
            this.logger.error(error);
            throw new Error("Unable to repair JSON");
        }
    }
    parseJsonResponse(response) {
        response = response.replace("```json", "").trim();
        if (response.endsWith("```")) {
            response = response.substring(0, response.length - 3);
        }
        try {
            return JSON.parse(response);
        }
        catch (error) {
            this.logger.warn(`Error parsing JSON ${response}`);
            try {
                this.logger.info(`Trying to fix JSON`);
                const parsedJson = JSON.parse(this.repairJson(response));
                this.logger.info("Fixed JSON");
                return parsedJson;
            }
            catch (error) {
                this.logger.warn(`Error parsing fixed JSON`);
                throw new Error("Unable to parse JSON");
            }
        }
    }
    async updateRateLimits(model, tokensToAdd) {
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
        const tokens = await this.getTokensFromMessages(messages);
        return tokens;
    }
}
//# sourceMappingURL=agent.js.map