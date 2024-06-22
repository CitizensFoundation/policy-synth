import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { PsAgent } from "../dbModels/agent.js";
import { PolicySynthBaseAgent } from "./baseAgent.js";
export declare class PolicySynthOperationsAgent extends PolicySynthBaseAgent {
    agent: PsAgent;
    models: Map<PsAiModelType, BaseChatModel>;
    limitedLLMmaxRetryCount: number;
    mainLLMmaxRetryCount: number;
    rateLimits: PsModelRateLimitTracking;
    constructor(agent: PsAgent);
    initializeModels(): Promise<void>;
    callModel(modelType: PsAiModelType, messages: PsModelChatItem[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function): Promise<any>;
    callTextModel(messages: PsModelChatItem[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function): Promise<any>;
    callEmbeddingModel(messages: PsModelChatItem[]): Promise<null>;
    callMultiModalModel(messages: PsModelChatItem[]): Promise<null>;
    callAudioModel(messages: PsModelChatItem[]): Promise<null>;
    callVideoModel(messages: PsModelChatItem[]): Promise<null>;
    callImageModel(messages: PsModelChatItem[]): Promise<null>;
    saveTokenUsage(modelType: PsAiModelType, tokensIn: number, tokensOut: number): Promise<void>;
    formatNumber(number: number, fractions?: number): string;
}
//# sourceMappingURL=baseOperationsAgent.d.ts.map