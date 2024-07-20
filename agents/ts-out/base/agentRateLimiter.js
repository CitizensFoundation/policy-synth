import { PolicySynthAgentBase } from "./agentBase.js";
export class PsRateLimitManager extends PolicySynthAgentBase {
    rateLimits = {};
    //TODO: Update this with new logic
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
}
//# sourceMappingURL=agentRateLimiter.js.map