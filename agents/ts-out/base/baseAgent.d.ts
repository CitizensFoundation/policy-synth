import winston from "winston";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage } from "@langchain/core/messages";
import { Callbacks } from "@langchain/core/callbacks/manager";
export declare class PolicySynthBaseAgent {
    memory?: PsAgentBaseMemoryData;
    logger: winston.Logger;
    timeStart: number;
    chat: ChatOpenAI | undefined;
    rateLimits: PsModelRateLimitTracking;
    constructor(memory?: PsSmarterCrowdsourcingMemoryData | undefined);
    getJsonBlock(text: string): string;
    repairJson(text: string): string;
    parseJsonResponse(response: string): any;
    callLLM(stage: PsScMemoryStageTypes, modelConstants: PsBaseAIModelConstants, messages: BaseMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Callbacks): Promise<any>;
    updateRateLimits(model: PsBaseAIModelConstants, tokensToAdd: number): Promise<void>;
    checkRateLimits(model: PsBaseAIModelConstants, tokensToAdd: number): Promise<void>;
    formatNumber(number: number, fractions?: number): string;
    addRequestTimestamp(model: PsBaseAIModelConstants): void;
    addTokenEntry(model: PsBaseAIModelConstants, tokensToAdd: number): void;
    slideWindowForRequests(model: PsBaseAIModelConstants): void;
    slideWindowForTokens(model: PsBaseAIModelConstants): void;
    getTokensFromMessages(messages: BaseMessage[]): Promise<number>;
}
//# sourceMappingURL=baseAgent.d.ts.map