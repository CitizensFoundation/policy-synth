import { PolicySynthAgentBase } from "./agentBase.js";
export declare class PsRateLimitManager extends PolicySynthAgentBase {
    private rateLimits;
    updateRateLimits(model: any, tokensToAdd: number): Promise<void>;
    checkRateLimits(model: any, tokensToAdd: number): Promise<void>;
    private addRequestTimestamp;
    private addTokenEntry;
    private slideWindowForRequests;
    private slideWindowForTokens;
}
//# sourceMappingURL=agentRateLimiter.d.ts.map