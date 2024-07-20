import { PolicySynthAgentBase } from "./agentBase.js";
export declare class PsProgressTracker extends PolicySynthAgentBase {
    private redis;
    private redisMemoryKey;
    private memory;
    private startProgress;
    private endProgress;
    constructor(redisMemoryKey: string, startProgress: number, endProgress: number, redisUrl?: string);
    loadMemoryFromRedis(): Promise<void>;
    updateRangedProgress(progress: number | undefined, message: string): Promise<void>;
    updateProgress(progress: number | undefined, message: string): Promise<void>;
    private saveMemory;
    getProgress(): number;
    getMessages(): string[];
    getState(): string;
    setAgentId(agentId: number): void;
    setCompleted(message: string): Promise<void>;
    setError(errorMessage: string): Promise<void>;
    formatNumber(number: number, fractions?: number): string;
}
//# sourceMappingURL=agentProgressTracker.d.ts.map