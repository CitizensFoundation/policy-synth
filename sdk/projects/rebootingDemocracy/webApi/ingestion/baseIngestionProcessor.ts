import fs from "fs/promises";
import path from "path";
import crypto, { createHash } from "crypto";
import fetch from "node-fetch";

interface DataLayout {
  jsonUrls: string[];
  documentUrls: string[];
}

interface ChunkData {
  title: string;
  shortSummary: string;
  fullSummary: string;
  isValid: boolean;
  metaData: { [key: string]: string };
  fullText: string;
}

// Add cache for first the response keyed on the data hashes
// So if user asks a similar question, we lookup in weaviate, and decide in the routing
interface CachedFileMetadata {
  key: string;
  url: string;
  lastModified: string;
  size: number;
  hash: string;
  description?: string;
  shortDescription?: string;
  fullDescriptionOfAllContents?: string;
  title?: string;
  chunks?: { [key: string]: ChunkData };
  references: string[];
  allUrls: string[];
  documentMetaData: { [key: string]: string };
}

interface LlmDocumentAnalysisReponse {
  title: string;
  shortDescription: string;
  description: string;
  fullDescriptionOfAllContents: string;
  references: string[];
  allUrls: string[];
  documentMetaData: { [key: string]: string };
}

interface LlmDocumentChunksStrategyReponse {
  sectionIndex: number;
  sectionTitle: string;
  directlyConnectedSectionIndexes: number[];
}

interface LlmDocumentChunksIdentificationReponse {
  oneLineTextIndexesForSplittingDocument: string[];
}

interface LlmChunkAnalysisReponse {
  title: string;
  shortSummary: string;
  fullSummary: string;
  metaDataFields: string[];
  metaData: { [key: string]: string };
}

interface LlmChunkFullSummaryValidationReponse {
  fullSummaryContainsAllDataFromChunk: boolean;
}

export abstract class IngestionProcessor extends PolicySynthBaseAgent {
  protected dataLayoutPath: string;
  private cachedFiles: string[] = [];
  private fileMetadataPath: string = "./cache/fileMetadata.json";
  private fileMetadata: Record<string, CachedFileMetadata> = {};
  private initialFileMetadata: Record<string, CachedFileMetadata> = {}; // Added for tracking initial state

  minChunkTokenLength: number = 1000;
  maxChunkTokenLength: number = 3500;
  maxFileProcessTokenLength: number = 110000;
  maxCleanupTokenLength: number = 20000;

  roughFastWordTokenRatio: number = 1.25;

  constructor(dataLayoutPath: string = "file://dataLayout.json") {
    this.dataLayoutPath = dataLayoutPath;
  }

  splitDataForProcessing(
    data: string,
    maxTokenLength: number = this.maxFileProcessTokenLength
  ): string[] {
    const parts: string[] = [];
    let remainingData = data;

    while (this.getEstimateTokenLength(remainingData) > maxTokenLength) {
      let splitPosition = remainingData.lastIndexOf("\n\n", maxTokenLength);
      if (splitPosition === -1) {
        // Fallback to single line break if double line break is not found
        splitPosition = remainingData.lastIndexOf("\n", maxTokenLength);
      }
      if (splitPosition === -1) {
        // If no line break is found, force split at max length
        splitPosition = maxTokenLength;
      }
      parts.push(remainingData.substring(0, splitPosition));
      remainingData = remainingData.substring(splitPosition).trimStart();
    }

    if (remainingData) {
      parts.push(remainingData); // Add the remaining data as the last part
    }
    return parts;
  }

  async processDataLayout(): Promise<void> {
    await this.loadFileMetadata(); // Load existing metadata to compare against
    this.initialFileMetadata = JSON.parse(JSON.stringify(this.fileMetadata)); // Deep copy for initial state comparison

    const dataLayout = await this.readDataLayout();
    await this.downloadAndCache(dataLayout.documentUrls, false);
    await this.processJsonUrls(dataLayout.jsonUrls);
    await this.saveFileMetadata();

    const filesForProcessing = this.getFilesForProcessing();
    this.processFiles(filesForProcessing);
  }

  async getMetaData(fileId: string, data: string) {
    // Assuming callLlm is a method that takes file content and returns analysis
    // This method needs to be implemented in your subclass
    const documentAnalysis: LlmDocumentAnalysisReponse = await this.callLlm(
      data
    );

    // Update metadata with analysis results
    const metadata = this.fileMetadata[fileId];
    if (metadata) {
      metadata.title = documentAnalysis.title;
      metadata.shortDescription = documentAnalysis.shortDescription;
      metadata.description = documentAnalysis.description;
      metadata.documentMetaData = {
        ...metadata.documentMetaData,
        ...documentAnalysis.documentMetaData,
      };
      metadata.references = [
        ...metadata.references,
        ...documentAnalysis.references,
      ];
    } else {
      console.error(`No metadata found for fileId: ${fileId}`);
    }

    return metadata;
  }

  async processFilePart(fileId: string, dataPart: string): Promise<void> {
    // Split dataPart for cleanup if it exceeds maxCleanupTokenLength
    const splitPartsForCleanup = this.splitDataForProcessing(
      dataPart,
      this.maxCleanupTokenLength
    );
    let cleanedUpDataParts: string[] = [];
    for (const part of splitPartsForCleanup) {
      const cleanedPart = (await this.callLlm(part)) as string; // Perform cleanup on each part
      cleanedUpDataParts.push(cleanedPart);
    }
    const cleanedUpData = cleanedUpDataParts.join(" "); // Concatenate cleaned parts

    const chunkingStrategy = (await this.callLlm(
      cleanedUpData
    )) as LlmDocumentChunksStrategyReponse;
    const chunks = await this.chunkDocument(
      cleanedUpData,
      chunkingStrategy.chunkStrategy
    );

    for (const [chunkId, chunkData] of Object.entries(chunks)) {
      let chunkAnalysis = await this.analyzeChunk(chunkData);
      let summaryValidation = await this.validateChunkSummary(
        chunkData,
        chunkAnalysis.fullSummary
      );

      // Retry logic for chunk summary validation
      let retryCount = 0;
      while (
        !summaryValidation.fullSummaryContainsAllDataFromChunk &&
        retryCount < 3
      ) {
        chunkAnalysis = await this.analyzeChunk(chunkData); // Re-analyze the chunk
        summaryValidation = await this.validateChunkSummary(
          chunkData,
          chunkAnalysis.fullSummary
        ); // Re-validate
        retryCount++;
      }

      const metadata = this.fileMetadata[fileId] || {};
      metadata.chunks = metadata.chunks || {};
      metadata.chunks[chunkId] = {
        title: chunkAnalysis.title,
        shortSummary: chunkAnalysis.shortSummary,
        fullSummary: chunkAnalysis.fullSummary,
        isValid: summaryValidation.fullSummaryContainsAllDataFromChunk,
        metaData: chunkAnalysis.metaData,
        fullText: chunkData,
      };
    }
  }

  async processFiles(files: string[]): Promise<void> {
    for (const filePath of files) {
      try {
        const data = await fs.readFile(filePath, "utf-8");
        const fileId = this.extractFileIdFromPath(filePath);
        if (!fileId) {
          console.error(`Cannot extract fileId from path: ${filePath}`);
          continue;
        }

        // Split file data if it exceeds the max token length
        if (
          this.getEstimateTokenLength(data) > this.maxFileProcessTokenLength
        ) {
          const dataParts = this.splitDataForProcessing(data);
          for (const part of dataParts) {
            await this.processFilePart(fileId, part); // Process each part of the file
          }
        } else {
          await this.processFilePart(fileId, data); // Process the entire file as one part
        }
      } catch (error) {
        console.error(`Failed to process file ${filePath}:`, error);
      }
    }
    await this.saveFileMetadata();
  }

  getEstimateTokenLength(data: string): number {
    const words = data.split(" ");
    return words.length * this.roughFastWordTokenRatio;
  }

  async chunkDocument(
    data: string,
    strategy: string
  ): Promise<{ [key: string]: string }> {
    if (this.getEstimateTokenLength(data) < this.minChunkTokenLength) {
      return { chunk1: data };
    } else {
      const chunkIdentifiersResponse = (await this.callLlm(
        `Identify chunking strings using ${strategy} strategy.`
      )) as LlmDocumentChunksIdentificationReponse;
      const chunkingStrings = chunkIdentifiersResponse; // Assuming this is an array of strings for chunking

      const chunks = {};
      let currentPosition = 0;
      let chunkIndex = 1;

      // Iterate over each chunking string to split the document
      if (chunkingStrings.oneLineChunkSeperatorLines) {
        chunkingStrings.oneLineChunkSeperatorLines.forEach(
          (chunkStr: string, index) => {
            const nextPosition = data.indexOf(chunkStr, currentPosition);
            if (nextPosition !== -1) {
              // Extract chunk from currentPosition to nextPosition
              const chunk = data.substring(currentPosition, nextPosition);
              console.log(`Chunk ${chunkIndex} length: ${chunk.length}`);
              chunks[`chunk${chunkIndex}`] = chunk;
              currentPosition = nextPosition + chunkStr.length; // Update currentPosition to the end of the current chunkStr
              chunkIndex++;
            } else {
              // If chunkStr not found, log an error but continue
              console.error(
                `Chunking string '${chunkStr}' not found in the document.`
              );
            }
          }
        );
      } else {
        throw Error("No chunking strings found in the response.");
      }

      // Add the last chunk from the last found position to the end of the document
      if (currentPosition < data.length) {
        const lastChunk = data.substring(currentPosition);
        console.log(`Chunk ${chunkIndex} length: ${lastChunk.length}`);
        chunks[`chunk${chunkIndex}`] = lastChunk;
      }

      return chunks;
    }
  }

  async analyzeChunk(data: string): Promise<LlmChunkAnalysisReponse> {
    // Simulate calling LLM for chunk analysis
    const response = await this.callLlm(`Analyze chunk: ${data}`);
    return response; // Assuming response matches LlmChunkAnalysisReponse format
  }

  async validateChunkSummary(
    chunk: string,
    summary: string
  ): Promise<LlmChunkFullSummaryValidationReponse> {
    // Simulate calling LLM for chunk summary validation
    const response = await this.callLlm(
      `Validate chunk summary: Chunk data - ${chunk}, Summary - ${summary}`
    );
    return response; // Assuming response matches LlmChunkFullSummaryValidationReponse format
  }

  private extractFileIdFromPath(filePath: string): string | null {
    const url = Object.values(this.fileMetadata).find((meta) =>
      filePath.includes(meta.key)
    )?.url;
    return url ? this.generateFileId(url) : null;
  }

  public getFilesForProcessing(): string[] {
    const filesForProcessing: string[] = [];

    // Compare current fileMetadata with initialFileMetadata
    for (const [fileId, metadata] of Object.entries(this.fileMetadata)) {
      const initialMetadata = this.initialFileMetadata[fileId];
      // Check if file is new or has been changed
      if (!initialMetadata || initialMetadata.hash !== metadata.hash) {
        filesForProcessing.push(metadata.url); // Add URL to processing list; adjust as needed
      }
    }

    return filesForProcessing;
  }

  private updateCachedFilesAndMetadata(
    fileName: string,
    url: string,
    data: Buffer
  ): void {
    const key = this.generateFileId(url);
    const hash = this.computeHash(data);

    if (!this.cachedFiles.includes(fileName)) {
      this.cachedFiles.push(fileName);
    }

    this.fileMetadata[key] = {
      key, // Include the unique key in metadata
      url,
      lastModified: new Date().toISOString(),
      size: data.length,
      hash,
    };
  }

  protected async readDataLayout(): Promise<DataLayout> {
    let dataLayout: DataLayout;
    if (this.dataLayoutPath.startsWith("file://")) {
      const filePath = this.dataLayoutPath.replace("file://", "");
      const data = await fs.readFile(filePath, "utf-8");
      dataLayout = JSON.parse(data);
    } else {
      try {
        const response = await fetch(this.dataLayoutPath);
        dataLayout = (await response.json()) as DataLayout;
      } catch (error) {
        throw new Error(
          `Failed to read data layout from ${this.dataLayoutPath}: ${error}`
        );
      }
    }
    return dataLayout;
  }

  protected async downloadAndCache(
    urls: string[],
    isJsonData: boolean
  ): Promise<void> {
    for (const url of urls) {
      const fileId = this.generateFileId(url); // Unique key for the file based on its URL
      const response = await fetch(url, { method: "HEAD" });
      const lastModified =
        response.headers.get("Last-Modified") ?? new Date().toISOString();
      const contentLength = parseInt(
        response.headers.get("Content-Length") ?? "0",
        10
      );

      const existingMetadata = this.fileMetadata[fileId];

      if (
        !existingMetadata ||
        existingMetadata.lastModified !== lastModified ||
        existingMetadata.size !== contentLength
      ) {
        const contentResponse = await fetch(url);
        const data = await contentResponse.buffer();
        const fileName = this.getFileName(url, isJsonData);

        await fs.writeFile(fileName, data);

        // Update metadata and cachedFiles list
        this.updateCachedFilesAndMetadata(fileName, url, data);
      }
    }

    // Save the updated metadata to disk
    await this.saveFileMetadata();
  }

  protected async processJsonUrls(urls: string[]): Promise<void> {
    for (const url of urls) {
      const response = await fetch(url);
      const jsonData = await response.json();
      const folderHash = crypto.createHash("md5").update(url).digest("hex");
      const folderPath = `./cache/${folderHash}`;
      await fs.mkdir(folderPath, { recursive: true });
      const jsonFilePath = `${folderPath}/data.json`;
      await fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2));
      this.cachedFiles.push(jsonFilePath); // Track cached JSON file

      const urlsToFetch = this.getExternalUrlsFromJson(jsonData);
      await this.downloadAndCache(urlsToFetch, true); // Download and cache content from URLs found in JSON
    }
  }

  private computeHash(data: Buffer): string {
    return createHash("sha256").update(data).digest("hex");
  }

  private getFileName(url: string, isJsonData: boolean): string {
    const baseName = path.basename(new URL(url).pathname);
    if (isJsonData) {
      const folderHash = this.generateFileId(url);
      const folderPath = `./cache/${folderHash}`;
      return `${folderPath}/${baseName}`;
    }
    return `./cache/${baseName}`;
  }

  private getExternalUrlsFromJson(jsonData: any): string[] {
    const urls: string[] = [];
    const checkAndCollectUrls = (obj: any) => {
      if (
        typeof obj === "string" &&
        (obj.startsWith("http://") || obj.startsWith("https://"))
      ) {
        urls.push(obj);
      } else if (Array.isArray(obj)) {
        for (const item of obj) {
          checkAndCollectUrls(item);
        }
      } else if (typeof obj === "object" && obj !== null) {
        for (const key of Object.keys(obj)) {
          checkAndCollectUrls(obj[key]);
        }
      }
    };

    checkAndCollectUrls(jsonData);
    return urls;
  }

  private generateFileId(url: string): string {
    return crypto.createHash("md5").update(url).digest("hex");
  }

  private async loadFileMetadata(): Promise<void> {
    try {
      const metadataJson = await fs.readFile(this.fileMetadataPath, "utf-8");
      this.fileMetadata = JSON.parse(metadataJson);
    } catch (error) {
      console.log("No existing metadata found, starting fresh.");
      this.fileMetadata = {};
    }
  }

  private async saveFileMetadata(): Promise<void> {
    await fs.writeFile(
      this.fileMetadataPath,
      JSON.stringify(this.fileMetadata, null, 2)
    );
  }

  abstract analyzeContent(): Promise<void>;
}
