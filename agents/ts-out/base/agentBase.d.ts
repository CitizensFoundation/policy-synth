import winston from "winston";
export declare class PolicySynthAgentBase {
    logger: winston.Logger;
    timeStart: number;
    constructor();
    protected createSystemMessage(content: string): PsModelMessage;
    protected createHumanMessage(content: string): PsModelMessage;
    getJsonBlock(text: string): string | null;
    repairJson(text: string): string;
    parseJsonResponse<T = any>(response: string): T;
    formatNumber(number: number, fractions?: number): string;
    getTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
//# sourceMappingURL=agentBase.d.ts.map