/// <reference types="node" />
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
export declare abstract class BaseIngestionAgent extends PolicySynthScAgentBase {
    minChunkTokenLength: number;
    maxChunkTokenLength: number;
    maxFileProcessTokenLength: number;
    roughFastWordTokenRatio: number;
    constructor();
    resetLlmTemperature(): void;
    randomizeLlmTemperature(): void;
    logShortLines(text: string, maxLength?: number): void;
    splitDataForProcessing(data: string, maxTokenLength?: number): string[];
    parseJsonFromLlmResponse(data: string): any;
    splitDataForProcessingWorksBigChunks(data: string, maxTokenLength?: number): string[];
    getEstimateTokenLength(data: string): number;
    computeHash(data: Buffer | string): string;
    getFirstMessages(systemMessage: SystemMessage, userMessage: BaseMessage): BaseMessage[];
    getFileName(url: string, isJsonData: boolean): string;
    getExternalUrlsFromJson(jsonData: any): string[];
    generateFileId(url: string): string;
}
//# sourceMappingURL=baseAgent.d.ts.map