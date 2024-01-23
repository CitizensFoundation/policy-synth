import { BaseMessage } from "langchain/schema";
import winston from "winston";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Callbacks } from "langchain/callbacks";
export declare class PolicySynthAgentBase {
    memory?: IEngineInnovationMemoryData;
    logger: winston.Logger;
    timeStart: number;
    chat: ChatOpenAI | undefined;
    private rateLimits;
    constructor();
    getJsonBlock(text: string): string;
    getRepairedJson(text: string): any;
    callLLM(stage: IEngineStageTypes, modelConstants: IEngineBaseAIModelConstants, messages: BaseMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Callbacks): Promise<any>;
    private updateRateLimits;
    private checkRateLimits;
    formatNumber(number: number, fractions?: number): string;
    saveMemory(): Promise<void>;
}
//# sourceMappingURL=base.d.ts.map