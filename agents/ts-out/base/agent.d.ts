import { PsAgent } from "../dbModels/agent.js";
import { PolicySynthAgentBase } from "./agentBase.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
import { PsAiModelManager } from "./agentModelManager.js";
import { PsProgressTracker } from "./agentProgressTracker.js";
import { PsConfigManager } from "./agentConfigManager.js";
import Redis from "ioredis";
export declare class AgentExecutionStoppedError extends Error {
    constructor(message: string);
}
export declare abstract class PolicySynthAgent extends PolicySynthAgentBase {
    memory: PsAgentMemoryData;
    agent: PsAgent;
    modelManager: PsAiModelManager | undefined;
    progressTracker: PsProgressTracker | undefined;
    configManager: PsConfigManager;
    redis: Redis;
    skipAiModels: boolean;
    skipCheckForProgress: boolean;
    startProgress: number;
    endProgress: number;
    maxModelTokensOut: number;
    modelTemperature: number;
    pauseCheckInterval: number;
    pauseTimeout: number;
    private memorySaveTimer;
    private memorySaveError;
    constructor(agent: PsAgent, memory: PsAgentMemoryData | undefined, startProgress: number, endProgress: number);
    process(): Promise<void>;
    loadAgentMemoryFromRedis(): Promise<PsAgentMemoryData>;
    callModel(modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], parseJson?: boolean, limitedRetries?: boolean, tokenOutEstimate?: number, streamingCallbacks?: Function): Promise<any>;
    updateRangedProgress(progress: number | undefined, message: string): Promise<void>;
    updateProgress(progress: number | undefined, message: string): Promise<void>;
    getConfig<T>(uniqueId: string, defaultValue: T): T;
    getConfigOld<T>(uniqueId: string, defaultValue: T): T;
    loadStatusFromRedis(): Promise<PsAgentStatus | undefined>;
    checkProgressForPauseOrStop(): Promise<void>;
    scheduleMemorySave(): void;
    checkLastMemorySaveError(): void;
    saveMemory(): Promise<void>;
    getTokensFromMessages(messages: PsModelMessage[]): Promise<number>;
    setCompleted(message: string): Promise<void>;
    setError(errorMessage: string): Promise<void>;
    getModelUsageEstimates(): PsAgentModelUsageEstimate[] | undefined;
    getApiUsageEstimates(): PsAgentApiUsageEstimate[] | undefined;
    getMaxTokensOut(): number | undefined;
    getTemperature(): number | undefined;
}
//# sourceMappingURL=agent.d.ts.map