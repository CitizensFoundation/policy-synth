import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { PolicySynthAgentBase } from "./agentBase.js";
import { PsAiModelType } from "../aiModelTypes.js";
export declare class PolicySynthSimpleAgentBase extends PolicySynthAgentBase {
    memory?: PsSimpleAgentMemoryData;
    timeStart: number;
    rateLimits: PsModelRateLimitTracking;
    models: Map<PsAiModelType, BaseChatModel>;
    private tokenizer;
    needsAiModel: boolean;
    maxModelTokensOut: number;
    modelTemperature: number;
    constructor(memory?: PsSimpleAgentMemoryData | undefined);
    private initializeTokenizer;
    private getTokenizer;
    protected getNumTokensFromMessages(messages: PsModelMessage[]): number;
    protected getNumTokensFromText(text: string): number;
    private getApproximateTokenCount;
    initializeModels(): void;
    callLLM(stage: string, messages: PsModelMessage[], parseJson?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function): Promise<any>;
    updateMemoryStages(stage: string, tokensIn: number, tokensOut: number, model: BaseChatModel): void;
    get redisKey(): string;
    saveMemory(): Promise<void>;
    get fullLLMCostsForMemory(): number;
}
//# sourceMappingURL=simpleAgent.d.ts.map