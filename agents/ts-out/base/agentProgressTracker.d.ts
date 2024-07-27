import Redis from "ioredis";
import { PolicySynthAgentBase } from "./agentBase.js";
export declare class PsProgressTracker extends PolicySynthAgentBase {
    redis: Redis;
    redisStatusKey: string;
    status: PsAgentStatus;
    startProgress: number;
    endProgress: number;
    constructor(redisStatusKey: string, startProgress: number, endProgress: number, redisUrl?: string);
    loadStatusFromRedis(): Promise<void>;
    updateRangedProgress(progress: number | undefined, message: string): Promise<void>;
    updateProgress(progress: number | undefined, message: string): Promise<void>;
    saveRedisStatus(): Promise<void>;
    getProgress(): number;
    getMessages(): string[];
    getState(): string;
    setCompleted(message: string): Promise<void>;
    setError(errorMessage: string): Promise<void>;
    formatNumber(number: number, fractions?: number): string;
}
//# sourceMappingURL=agentProgressTracker.d.ts.map