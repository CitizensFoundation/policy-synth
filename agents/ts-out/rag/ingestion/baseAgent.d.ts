import { PolicySynthSimpleAgentBase } from "../../base/simpleAgent.js";
export declare abstract class BaseIngestionAgent extends PolicySynthSimpleAgentBase {
    minChunkTokenLength: number;
    maxChunkTokenLength: number;
    maxFileProcessTokenLength: number;
    roughFastWordTokenRatio: number;
    maxModelTokensOut: number;
    modelTemperature: number;
    logShortLines(text: string, maxLength?: number): void;
    splitDataForProcessing(data: string, maxTokenLength?: number): string[];
    parseJsonFromLlmResponse(data: string): any;
    splitDataForProcessingWorksBigChunks(data: string, maxTokenLength?: number): string[];
    getEstimateTokenLength(data: string): number;
    computeHash(data: Buffer | string): string;
    getFirstMessages(systemMessage: PsModelMessage, userMessage: PsModelMessage): PsModelMessage[];
    getFileName(url: string, isJsonData: boolean): string;
    getExternalUrlsFromJson(jsonData: any): string[];
    generateFileId(url: string): string;
}
//# sourceMappingURL=baseAgent.d.ts.map