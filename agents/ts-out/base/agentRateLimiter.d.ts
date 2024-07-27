import { PolicySynthAgentBase } from "./agentBase.js";
export declare class PsRateLimitManager extends PolicySynthAgentBase {
    rateLimits: PsModelRateLimitTracking;
    updateRateLimits(model: any, tokensToAdd: number): Promise<void>;
    checkRateLimits(model: any, tokensToAdd: number): Promise<void>;
    addRequestTimestamp(model: any): void;
    addTokenEntry(model: any, tokensToAdd: number): void;
    slideWindowForRequests(model: any): void;
    slideWindowForTokens(model: any): void;
}
//# sourceMappingURL=agentRateLimiter.d.ts.map