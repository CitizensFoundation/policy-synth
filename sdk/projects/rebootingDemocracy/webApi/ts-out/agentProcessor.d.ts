/// <reference types="node" resolution-mode="require"/>
import { BaseIngestionAgent } from "./baseAgent.js";
export declare abstract class IngestionAgentProcessor extends BaseIngestionAgent {
    protected dataLayoutPath: string;
    private cachedFiles;
    private fileMetadataPath;
    private fileMetadata;
    private initialFileMetadata;
    constructor(dataLayoutPath?: string);
    processDataLayout(): Promise<void>;
    processFilePart(fileId: string, dataPart: string): Promise<void>;
    processFiles(files: string[]): Promise<void>;
    extractFileIdFromPath(filePath: string): string | null;
    getFilesForProcessing(): string[];
    updateCachedFilesAndMetadata(relativePath: string, url: string, data: Buffer, contentType: string): void;
    protected readDataLayout(): Promise<DataLayout>;
    getFileNameAndPath(url: string, extension: string): {
        fullPath: string;
        relativePath: string;
    };
    downloadAndCache(urls: string[], isJsonData: boolean): Promise<void>;
    protected processJsonUrls(urls: string[]): Promise<void>;
    loadFileMetadata(): Promise<void>;
    saveFileMetadata(): Promise<void>;
}
//# sourceMappingURL=agentProcessor.d.ts.map