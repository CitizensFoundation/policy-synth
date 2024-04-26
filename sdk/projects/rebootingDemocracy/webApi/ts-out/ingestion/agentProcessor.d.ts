/// <reference types="node" />
import { Page } from "puppeteer";
import { IngestionAgentProcessor } from "@policysynth/agents/rag/ingestion/processor.js";
import { DocumentCleanupAgent } from "@policysynth/agents/rag/ingestion/docCleanup.js";
import { DocumentTreeSplitAgent } from "@policysynth/agents/rag/ingestion/docTreeSplitter.js";
import { IngestionChunkCompressorAgent } from "@policysynth/agents/rag/ingestion/chunkCompressorAgent.js";
import { DocumentAnalyzerAgent } from "@policysynth/agents/rag/ingestion/docAnalyzer.js";
import { IngestionChunkAnalzyerAgent } from "@policysynth/agents/rag/ingestion/chunkAnalyzer.js";
export declare class RebootingDemocracyIngestionProcessor extends IngestionAgentProcessor {
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