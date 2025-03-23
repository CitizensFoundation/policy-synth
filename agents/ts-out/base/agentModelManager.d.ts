interface PsCallModelOptions {
    parseJson?: boolean;
    limitedRetries?: boolean;
    tokenOutEstimate?: number;
    streamingCallbacks?: Function;
    modelProvider?: string;
    modelName?: string;
    modelTemperature?: number;
    modelMaxTokens?: number;
    modelMaxThinkingTokens?: number;
    modelReasoningEffort?: "low" | "medium" | "high";
}
import { BaseChatModel } from "../aiModels/baseChatModel.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { PolicySynthAgentBase } from "./agentBase.js";
export declare class PsAiModelManager extends PolicySynthAgentBase {
    models: Map<string, BaseChatModel>;
    modelsByType: Map<PsAiModelType, BaseChatModel>;
    modelIds: Map<string, number>;
    modelIdsByType: Map<PsAiModelType, number>;
    rateLimits: PsModelRateLimitTracking;
    userId: number;
    agentId: number;
    maxModelTokensOut: number;
    modelTemperature: number;
    reasoningEffort: "low" | "medium" | "high";
    maxThinkingTokens: number;
    limitedLLMmaxRetryCount: number;
    mainLLMmaxRetryCount: number;
    constructor(aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[], maxModelTokensOut: number | undefined, modelTemperature: number | undefined, reasoningEffort: "low" | "medium" | "high" | undefined, maxThinkingTokens: number | undefined, agentId: number, userId: number);
    initializeOneModelFromEnv(): BaseChatModel | undefined;
    initializeModels(aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[]): void;
    /**
     * Creates a one-off ephemeral model instance, merging overrides from `options`.
     * If provider is not specified, we’ll reuse the provider from the fallback model
     * or environment. This returns `undefined` if no ephemeral override was requested.
     */
    private createEphemeralModel;
    private getApiKeyForProvider;
    callModel(modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options: PsCallModelOptions): Promise<any>;
    callTextModel(modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options: PsCallModelOptions): Promise<any>;
    /**
     * Actually does the call against the chosen model,
     * with your retry logic, parseJson, usage tracking, etc.
     */
    private runTextModelCall;
    private sleepBeforeRetry;
    callEmbeddingModel(messages: PsModelMessage[]): Promise<null>;
    callMultiModalModel(messages: PsModelMessage[]): Promise<null>;
    callAudioModel(messages: PsModelMessage[]): Promise<null>;
    callVideoModel(messages: PsModelMessage[]): Promise<null>;
    callImageModel(messages: PsModelMessage[]): Promise<null>;
    saveTokenUsage(modelType: PsAiModelType, modelSize: PsAiModelSize, tokensIn: number, tokensOut: number): Promise<void>;
    getTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
export {};
//# sourceMappingURL=agentModelManager.d.ts.map