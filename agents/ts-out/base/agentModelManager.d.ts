import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { PolicySynthAgentBase } from "./agentBase.js";
export declare class PsAiModelManager extends PolicySynthAgentBase {
    private models;
    private modelsByType;
    private modelIds;
    private modelIdsByType;
    private rateLimits;
    private userId;
    private agentId;
    maxModelTokensOut: number;
    modelTemperature: number;
    limitedLLMmaxRetryCount: number;
    mainLLMmaxRetryCount: number;
    constructor(aiModels: PsAiModelAttributes[], accessConfiguration: YpGroupPrivateAccessConfiguration[], maxModelTokensOut: number | undefined, modelTemperature: number | undefined, agentId: number, userId: number);
    private initializeModels;
    callModel(modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function): Promise<any>;
    callTextModel(modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function): Promise<any>;
    callEmbeddingModel(messages: PsModelMessage[]): Promise<null>;
    callMultiModalModel(messages: PsModelMessage[]): Promise<null>;
    callAudioModel(messages: PsModelMessage[]): Promise<null>;
    callVideoModel(messages: PsModelMessage[]): Promise<null>;
    callImageModel(messages: PsModelMessage[]): Promise<null>;
    saveTokenUsage(modelType: PsAiModelType, modelSize: PsAiModelSize, tokensIn: number, tokensOut: number): Promise<void>;
    getTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
}
//# sourceMappingURL=agentModelManager.d.ts.map