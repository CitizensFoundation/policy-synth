/// <reference types="node" />
import { PolicySynthStandaloneAgent } from "@policysynth/agents/base/agentStandalone.js";
export declare abstract class BaseIngestionAgent extends PolicySynthStandaloneAgent {
    minChunkTokenLength: number;
    maxChunkTokenLength: number;
    maxFileProcessTokenLength: number;
    roughFastWordTokenRatio: number;
    logShortLines(text: string, maxLength?: number): void;
    splitDataForProcessing(data: string, maxTokenLength?: number): string[];
    parseJsonFromLlmResponse(data: string): any;
    splitDataForProcessingWorksBigChunks(data: string, maxTokenLength?: number): string[];
    getEstimateTokenLength(data: string): number;
    computeHash(data: Buffer | string): string;
    getFirstMessages(systemMessage: any, userMessage: any): any[];
    getFileName(url: string, isJsonData: boolean): string;
    getExternalUrlsFromJson(jsonData: any): string[];
    generateFileId(url: string): string;
}
//# sourceMappingURL=baseAgent.d.ts.map