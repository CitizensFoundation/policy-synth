import winston from "winston";
import { PsConstants } from "../constants.js";
import ioredis from "ioredis";
import { PolicySynthBaseAgent } from "./baseAgent.js";
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
export class PolicySynthScAgentBase extends PolicySynthBaseAgent {
    logger;
    timeStart = Date.now();
    rateLimits = {};
    constructor(memory = undefined) {
        super(memory);
        if (memory) {
            this.memory = memory;
        }
        this.logger = logger;
    }
    static get emptyDefaultStages() {
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
            "dedup-web-solutions": {},
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
            "ingestion-agent": {},
            "engineering-agent": {},
        };
    }
    get fullLLMCostsForMemory() {
        let totalCost = undefined;
        if (this.memory && this.memory.stages) {
            totalCost = 0;
            Object.values(this.memory.stages).forEach((stage) => {
                if (stage.tokensInCost && stage.tokensOutCost) {
                    totalCost += stage.tokensInCost + stage.tokensOutCost;
                }
            });
        }
        return totalCost;
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
                        if (this.memory) {
                            this.updateMemoryStages(stage, tokensIn, tokensOut, modelConstants);
                            await this.saveMemory();
                        }
                        else {
                            this.logger.debug("Memory is not initialized and token counts not updated");
                        }
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
    updateMemoryStages(stage, tokensIn, tokensOut, modelConstants) {
        if (!this.memory.stages[stage]) {
            this.memory.stages[stage] = {
                tokensIn: 0,
                tokensOut: 0,
                tokensInCost: 0,
                tokensOutCost: 0,
            };
        }
        this.memory.stages[stage].tokensIn += tokensIn;
        this.memory.stages[stage].tokensOut += tokensOut;
        this.memory.stages[stage].tokensInCost +=
            tokensIn * modelConstants.inTokenCostUSD;
        this.memory.stages[stage].tokensOutCost +=
            tokensOut * modelConstants.outTokenCostUSD;
    }
    async saveMemory() {
        if (this.memory) {
            try {
                await redis.set(this.memory.redisKey, JSON.stringify(this.memory));
            }
            catch (error) {
                this.logger.error("Can't save memory to redis", error);
            }
        }
        else {
            this.logger.warn("Memory is not initialized");
        }
    }
}
//# sourceMappingURL=baseScAgentBase.js.map