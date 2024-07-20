import winston from "winston";
export declare class PolicySynthAgentBase {
    logger: winston.Logger;
    timeStart: number;
    constructor();
    protected createSystemMessage(content: string): PsModelMessage;
    protected createHumanMessage(content: string): PsModelMessage;
    getJsonBlock(text: string): string;
    repairJson(text: string): string;
    parseJsonResponse(response: string): any;
    formatNumber(number: number, fractions?: number): string;
    getTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
//# sourceMappingURL=agentBase.d.ts.map