/// <reference types="node" resolution-mode="require"/>
import { IngestionCleanupAgent } from "./cleanupAgent.js";
import { IngestionSplitAgent } from "./splitAgent.js";
import { BaseIngestionAgent } from "./baseAgent.js";
import { IngestionChunkCompressorAgent } from "./chunkCompressorAgent.js";
import { IngestionDocAnalyzerAgent } from "./docAnalyzerAgent.js";
import { IngestionChunkAnalzyerAgent } from "./chunkAnalyzer.js";
export declare abstract class IngestionAgentProcessor extends BaseIngestionAgent {
    dataLayoutPath: string;
    cachedFiles: string[];
    fileMetadataPath: string;
    fileMetadata: Record<string, CachedFileMetadata>;
    initialFileMetadata: Record<string, CachedFileMetadata>;
    cleanupAgent: IngestionCleanupAgent;
    splitAgent: IngestionSplitAgent;
    chunkCompressor: IngestionChunkCompressorAgent;
    chunkAnalysisAgent: IngestionChunkAnalzyerAgent;
    docAnalysisAgent: IngestionDocAnalyzerAgent;
    constructor(dataLayoutPath?: string);
    processDataLayout(): Promise<void>;
    processFiles(files: string[]): Promise<void>;
    processFilePart(fileId: string, cleanedUpData: string, weaviateDocumentId: string): Promise<void>;
    processFilePartT(fileId: string, cleanedUpData: string, weaviateDocumentId: string): Promise<void>;
    extractFileIdFromPath(filePath: string): string | null;
    getFilesForProcessing(forceProcessing?: boolean): string[];
    updateCachedFilesAndMetadata(relativePath: string, url: string, data: Buffer, contentType: string, lastModifiedOnServer: string): void;
    protected readDataLayout(): Promise<DataLayout>;
    getFileNameAndPath(url: string, extension: string): {
        fullPath: string;
        relativePath: string;
    };
    downloadAndCache(urls: string[], isJsonData: boolean): Promise<void>;
    determineExtension(contentType: string, isJsonData: boolean): string;
    protected processJsonUrls(urls: string[]): Promise<void>;
    loadFileMetadata(): Promise<void>;
    saveFileMetadata(): Promise<void>;
}
//# sourceMappingURL=agentProcessor.d.ts.map