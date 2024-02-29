/// <reference types="node" resolution-mode="require"/>
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
export declare abstract class BaseIngestionAgent extends PolicySynthAgentBase {
    minChunkTokenLength: number;
    maxChunkTokenLength: number;
    maxFileProcessTokenLength: number;
    roughFastWordTokenRatio: number;
    constructor();
    resetLlmTemperature(): void;
    randomizeLlmTemperature(): void;
    splitDataForProcessing(data: string, maxTokenLength?: number): string[];
    splitDataForProcessingWorksBigChunks(data: string, maxTokenLength?: number): string[];
    getEstimateTokenLength(data: string): number;
    computeHash(data: Buffer): string;
    getFirstMessages(systemMessage: SystemMessage, userMessage: BaseMessage): BaseMessage[];
    getFileName(url: string, isJsonData: boolean): string;
    getExternalUrlsFromJson(jsonData: any): string[];
    generateFileId(url: string): string;
}
//# sourceMappingURL=baseAgent.d.ts.map