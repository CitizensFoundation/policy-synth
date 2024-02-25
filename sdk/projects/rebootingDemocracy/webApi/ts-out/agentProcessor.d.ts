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
    private updateCachedFilesAndMetadata;
    protected readDataLayout(): Promise<DataLayout>;
    downloadAndCache(urls: string[], isJsonData: boolean): Promise<void>;
    protected processJsonUrls(urls: string[]): Promise<void>;
    loadFileMetadata(): Promise<void>;
    saveFileMetadata(): Promise<void>;
}
//# sourceMappingURL=agentProcessor.d.ts.map