import { PolicySynthAgentBase } from "./agentBase.js";
export declare class PsProgressTracker extends PolicySynthAgentBase {
    private redis;
    private redisStatusKey;
    private status;
    private startProgress;
    private endProgress;
    constructor(redisStatusKey: string, startProgress: number, endProgress: number, redisUrl?: string);
    loadStatusFromRedis(): Promise<void>;
    updateRangedProgress(progress: number | undefined, message: string): Promise<void>;
    updateProgress(progress: number | undefined, message: string): Promise<void>;
    private saveRedisStatus;
    getProgress(): number;
    getMessages(): string[];
    getState(): string;
    setCompleted(message: string): Promise<void>;
    setError(errorMessage: string): Promise<void>;
    formatNumber(number: number, fractions?: number): string;
}
//# sourceMappingURL=agentProgressTracker.d.ts.map