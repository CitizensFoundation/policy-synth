/// <reference types="node" />
import { Page } from "puppeteer";
import { DocumentCleanupAgent } from "./docCleanup.js";
import { DocumentTreeSplitAgent } from "./docTreeSplitter.js";
import { BaseIngestionAgent } from "./baseAgent.js";
import { IngestionChunkCompressorAgent } from "./chunkCompressorAgent.js";
import { DocumentAnalyzerAgent } from "./docAnalyzer.js";
import { IngestionChunkAnalzyerAgent } from "./chunkAnalyzer.js";
export declare abstract class IngestionAgentProcessor extends BaseIngestionAgent {
    dataLayoutPath: string;
    cachedFiles: string[];
    fileMetadataPath: string;
    fileMetadata: Record<string, PsRagDocumentSource>;
    initialFileMetadata: Record<string, PsRagDocumentSource>;
    cleanupAgent: DocumentCleanupAgent;
    splitAgent: DocumentTreeSplitAgent;
    chunkCompressor: IngestionChunkCompressorAgent;
    chunkAnalysisAgent: IngestionChunkAnalzyerAgent;
    docAnalysisAgent: DocumentAnalyzerAgent;
    dataLayout: PsIngestionDataLayout;
    constructor(dataLayoutPath?: string);
    processDataLayout(): Promise<void>;
    processAllSources(allDocumentSources: PsRagDocumentSource[]): Promise<void>;
    stringifyIfObjectOrArray(value: any): string;
    transformChunkForVectorstore(chunk: PsRagChunk): any;
    transformDocumentSourceForVectorstore(source: PsRagDocumentSource): any;
    addDocumentsToWeaviate(allDocumentSourcesWithChunks: PsRagDocumentSource[]): Promise<void>;
    countDuplicateUrls(data: any[]): Promise<number>;
    classifyDocuments(allDocumentSourcesWithChunks: PsRagDocumentSource[]): Promise<void>;
    processSource(source: PsRagDocumentSource): Promise<void>;
    processFiles(files: string[]): Promise<void>;
    updateReferencesWithUrls(allReferencesWithUrls: any, newUrls: any): Promise<any>;
    aggregateChunkData: (chunks: LlmDocumentChunksStrategy[]) => string;
    createTreeChunks(metadata: PsRagDocumentSource, cleanedUpData: string): Promise<void>;
    processFilePartTree(fileId: string, cleanedUpData: string, weaviateDocumentId: string): Promise<void>;
    rankChunks(metadata: PsRagDocumentSource): Promise<void>;
    extractFileIdFromPath(filePath: string): string | null;
    getFilesForProcessing(forceProcessing?: boolean): string[];
    getAllFilesForProcessing(): string[];
    getMetaDataForAllFiles(): PsRagDocumentSource[];
    updateCachedFilesAndMetadata(relativePath: string, url: string, data: Buffer | string, contentType: string, lastModifiedOnServer: string): void;
    protected readDataLayout(): Promise<PsIngestionDataLayout>;
    getFileNameAndPath(url: string, extension: string): {
        fullPath: string;
        relativePath: string;
    };
    downloadAndCache(urls: string[], isJsonData: boolean, browserPage: Page): Promise<void>;
    determineExtension(contentType: string, isJsonData: boolean): string;
    protected processJsonUrls(urls: string[], browserPage: Page): Promise<void>;
    loadFileMetadata(): Promise<void>;
    saveFileMetadata(): Promise<void>;
}
//# sourceMappingURL=agentProcessor.d.ts.map