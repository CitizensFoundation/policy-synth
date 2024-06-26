import winston from "winston";
export declare class PolicySynthBaseAgent {
    logger: winston.Logger;
    timeStart: number;
    rateLimits: PsModelRateLimitTracking;
    maxModelTokensOut?: number;
    modelTemperature?: number;
    constructor();
    protected createSystemMessage(content: string): PsModelMessage;
    protected createHumanMessage(content: string): PsModelMessage;
    getJsonBlock(text: string): string;
    repairJson(text: string): string;
    parseJsonResponse(response: string): any;
    updateRateLimits(model: PsBaseAIModelConstants, tokensToAdd: number): Promise<void>;
    checkRateLimits(model: PsBaseAIModelConstants, tokensToAdd: number): Promise<void>;
    formatNumber(number: number, fractions?: number): string;
    addRequestTimestamp(model: PsBaseAIModelConstants): void;
    addTokenEntry(model: PsBaseAIModelConstants, tokensToAdd: number): void;
    slideWindowForRequests(model: PsBaseAIModelConstants): void;
    slideWindowForTokens(model: PsBaseAIModelConstants): void;
    getTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
//# sourceMappingURL=agent.d.ts.map