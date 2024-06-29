import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { PsAgent } from "../dbModels/agent.js";
import { PolicySynthBaseAgent } from "./agent.js";
import { PsAiModelType } from "../aiModelTypes.js";
export declare abstract class PolicySynthOperationsAgent extends PolicySynthBaseAgent {
    memory: PsAgentMemoryData;
    agent: PsAgent;
    models: Map<PsAiModelType, BaseChatModel>;
    modelIds: Map<PsAiModelType, number>;
    limitedLLMmaxRetryCount: number;
    mainLLMmaxRetryCount: number;
    maxModelTokensOut: number;
    modelTemperature: number;
    startProgress: number;
    endProgress: number;
    rateLimits: PsModelRateLimitTracking;
    constructor(agent: PsAgent, memory: PsAgentMemoryData | undefined, startProgress: number, endProgress: number);
    process(): Promise<void>;
    loadAgentMemoryFromRedis(): Promise<void>;
    initializeModels(): Promise<void>;
    callModel(modelType: PsAiModelType, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function): Promise<any>;
    callTextModel(messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function): Promise<any>;
    callEmbeddingModel(messages: PsModelMessage[]): Promise<null>;
    callMultiModalModel(messages: PsModelMessage[]): Promise<null>;
    callAudioModel(messages: PsModelMessage[]): Promise<null>;
    callVideoModel(messages: PsModelMessage[]): Promise<null>;
    callImageModel(messages: PsModelMessage[]): Promise<null>;
    saveTokenUsage(modelType: PsAiModelType, tokensIn: number, tokensOut: number): Promise<void>;
    formatNumber(number: number, fractions?: number): string;
    updateRangedProgress(progress: number, message: string): Promise<void>;
    updateProgress(progress: number | undefined, message: string): Promise<void>;
    saveMemory(): Promise<void>;
    getConfigOld<T>(uniqueId: string, defaultValue: T): T;
    getConfig<T>(uniqueId: string, defaultValue: T): T;
}
//# sourceMappingURL=operationsAgent.d.ts.map