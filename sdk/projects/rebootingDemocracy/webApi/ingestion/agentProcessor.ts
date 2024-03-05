import fs from "fs/promises";
import path from "path";
import crypto, { createHash } from "crypto";
import fetch from "node-fetch";

import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IngestionCleanupAgent } from "./cleanupAgent.js";
import { IngestionSplitAgent } from "./splitAgent.js";
import { BaseIngestionAgent } from "./baseAgent.js";
import { IngestionChunkCompressorAgent } from "./chunkCompressorAgent.js";
import { IngestionContentParser } from "./contentParser.js";
import { IngestionDocAnalyzerAgent } from "./docAnalyzerAgent.js";
import { IngestionChunkAnalzyerAgent } from "./chunkAnalyzer.js";
import { IngestionChunkRanker } from "./chunkRanker.js";

export abstract class IngestionAgentProcessor extends BaseIngestionAgent {
  dataLayoutPath: string;
  cachedFiles: string[] = [];
  fileMetadataPath: string = "./ingestion/cache/fileMetadata.json";
  fileMetadata: Record<string, DocumentSource> = {};
  initialFileMetadata: Record<string, DocumentSource> = {};

  cleanupAgent: IngestionCleanupAgent;
  splitAgent: IngestionSplitAgent;
  chunkCompressor: IngestionChunkCompressorAgent;
  chunkAnalysisAgent: IngestionChunkAnalzyerAgent;
  docAnalysisAgent: IngestionDocAnalyzerAgent;

  constructor(dataLayoutPath: string = "file://ingestion/dataLayout.json") {
    super();
    this.dataLayoutPath = dataLayoutPath;

    this.loadFileMetadata()
      .then(() => {
        console.log("Metadata loaded");
      })
      .catch((err) => {
        console.error("Failed to load file metadata:", err);
      });

    this.cleanupAgent = new IngestionCleanupAgent();
    this.splitAgent = new IngestionSplitAgent();
    this.chunkCompressor = new IngestionChunkCompressorAgent();
    this.docAnalysisAgent = new IngestionDocAnalyzerAgent();
    this.chunkAnalysisAgent = new IngestionChunkAnalzyerAgent();
  }

  async processDataLayout(): Promise<void> {
    await this.loadFileMetadata(); // Load existing metadata to compare against
    this.initialFileMetadata = JSON.parse(JSON.stringify(this.fileMetadata)); // Deep copy for initial state comparison

    const dataLayout = await this.readDataLayout();
    //await this.downloadAndCache(dataLayout.documentUrls, false);
    //await this.processJsonUrls(dataLayout.jsonUrls);
    //await this.saveFileMetadata();

    const filesForProcessing = this.getFilesForProcessing(true);
    console.log("Files for processing:", filesForProcessing);
    this.processFiles(filesForProcessing);
  }

  async processFiles(files: string[]): Promise<void> {
    for (const filePath of files) {
      try {
        let weaviateDocumentId = "TBD";
        console.log(`Processing file: ${filePath}`);
        const parser = new IngestionContentParser();
        const data = await parser.parseFile(filePath);
        const metadataEntry = Object.values(this.fileMetadata).find(
          (meta) => meta.filePath === filePath
        );
        if (!metadataEntry) {
          console.error(`Metadata not found for filePath: ${filePath}`);
          continue;
        }

        //if (metadataEntry.fileId !== "8211f8f7011d29e3da018207b2d991da")
        //  continue;


        const reAnalyze = false;
        if (
          reAnalyze ||
          !this.fileMetadata[metadataEntry!.fileId].documentMetaData
        ) {
          (await this.docAnalysisAgent.analyze(
            metadataEntry.fileId,
            data,
            this.fileMetadata
          )) as LlmDocumentAnalysisReponse;
          await this.saveFileMetadata();

          // Create Weaviate object for document with all analyzies and get and id for the parts
        }

        // Cleanup fullContentsColumns in docAnalysis and redo the summaries

        const reCleanData = false;

        const cleanedUpData =
          (!reCleanData &&
            this.fileMetadata[metadataEntry.fileId].cleanedDocument) ||
          (await this.cleanupAgent.clean(data));

        console.log(`Cleaned up data: ${cleanedUpData}`);
        await this.saveFileMetadata();

        if (
          this.getEstimateTokenLength(cleanedUpData) >
          this.maxFileProcessTokenLength
        ) {
          const dataParts = this.splitDataForProcessing(cleanedUpData);
          for (const part of dataParts) {
            await this.processFilePartTree(
              metadataEntry.fileId,
              part,
              weaviateDocumentId
            );
          }
        } else {
          await this.processFilePartTree(
            metadataEntry.fileId,
            cleanedUpData,
            weaviateDocumentId
          );
        }
      } catch (error) {
        console.error(`Failed to process file ${filePath}:`, error);
      }
    }
    await this.saveFileMetadata();
  }

  aggregateChunkData = (
    chunks: LlmDocumentChunksStrategy[]
  ): string => {
    return chunks.reduce((acc, chunk) => {
      const chunkData = chunk.chunkData || "";
      const subChunkData = chunk.subChunks
        ? this.aggregateChunkData(chunk.subChunks)
        : "";
      return acc + chunkData + subChunkData;
    }, "");
  };

  async createTreeChunks(
    metadata: DocumentSource,
    cleanedUpData: string
  ) {
    const chunks = (await this.splitAgent.splitDocumentIntoChunks(
      cleanedUpData
    )) as LlmDocumentChunksStrategy[];

    console.log(JSON.stringify(chunks, null, 2));

    console.log(`Split into ${chunks.length} chunks`);

    const processChunk = async (
      chunk: LlmDocumentChunksStrategy,
      parentChunkIndex: number | null = null
    ) => {
      let hasAggregatedChunkData = false;
      if (!chunk.chunkData && chunk.subChunks) {
        chunk.chunkData = this.aggregateChunkData([chunk]);
        hasAggregatedChunkData = true;
      }
      if (chunk.chunkData) {
        let chunkAnalyzeResponse = await this.chunkAnalysisAgent.analyze(
          chunk.chunkData
        );

        console.log(`\n\nAnalyzed chunk: ${JSON.stringify(chunkAnalyzeResponse)}`);

        if (!hasAggregatedChunkData) {
          console.log(`\nBefore compression:\n${chunk.chunkData}\n`);
          chunkAnalyzeResponse.fullCompressedContent =
            await this.chunkCompressor.compress(chunk.chunkData);
          console.log(`\nAfter compression:\n${chunkAnalyzeResponse.fullCompressedContent}\n\n`);
        }

        const chunkMetadata: PsIngestionChunkData = {
          chunkIndex: chunk.chapterIndex, // Using chapterIndex directly
          title: chunkAnalyzeResponse.title,
          mainExternalUrlFound: chunkAnalyzeResponse.mainExternalUrlFound,
          importantContextChunkIndexes: chunk.importantContextChapterIndexes,
          shortSummary: chunkAnalyzeResponse.shortDescription,
          compressedContent: chunkAnalyzeResponse.fullCompressedContent,
          metaData: chunkAnalyzeResponse.textMetaData,
          uncompressedContent: chunk.chunkData,
          subChunks: [],
        };

        if (parentChunkIndex === null) {
          metadata.chunks!.push(chunkMetadata); // Pushing to array directly for top-level chunks
        } else {
          // Ensure the parentChunk's subChunks array exists and is accessible
          if (!metadata.chunks![parentChunkIndex - 1].subChunks) {
            metadata.chunks![parentChunkIndex - 1].subChunks = [];
          }
          metadata.chunks![parentChunkIndex - 1].subChunks!.push(chunkMetadata);
          // Note: No manual adjustment of chunkIndex for subChunks needed
        }

        if (chunk.subChunks && chunk.subChunks.length > 0) {
          for (let subChunk of chunk.subChunks) {
            await processChunk(subChunk, chunkMetadata.chunkIndex); // Recursively process subChunks
          }
        }
      }
    };

    for (let chunk of chunks) {
      await processChunk(chunk); // Initial call to process top-level chunks
    }
  }

  async processFilePartTree(
    fileId: string,
    cleanedUpData: string,
    weaviateDocumentId: string
  ): Promise<void> {
    console.log(`Processing file part for fileId: ${fileId}`);

    this.fileMetadata[fileId].cleanedDocument = cleanedUpData;

    await this.saveFileMetadata();

    const metadata = this.fileMetadata[fileId] || {};

    metadata.chunks = [];

    metadata.weaviteId = weaviateDocumentId;

    await this.createTreeChunks(metadata, cleanedUpData);

    await this.saveFileMetadata();

    console.log(`Metadata after chunking:\n${JSON.stringify(metadata, null, 2)}`);

    await this.rankChunks(metadata);

    await this.saveFileMetadata();

    console.log(`Metadata after ranking:\n${JSON.stringify(metadata, null, 2)}`);

    // Wait for 3 minutes
    await new Promise((resolve) => setTimeout(resolve, 150000));

    //    await this.saveFileMetadata();

  }

  async rankChunks(metadata: DocumentSource) {
    const ranker = new IngestionChunkRanker();

    const relevanceRules = "Rank the two chunks based on the relevance to the document";
    await ranker.rankDocumentChunks(metadata.chunks!, relevanceRules, metadata.compressedFullDescriptionOfAllContents!, "relevanceEloRating");

    const substanceRules = "Rank the two chunks based substance and completeness of the information";
    await ranker.rankDocumentChunks(metadata.chunks!, substanceRules, metadata.compressedFullDescriptionOfAllContents!, "substanceEloRating");

    const qualityRules = "Rank the two chunks based on quality of the information";
    await ranker.rankDocumentChunks(metadata.chunks!, qualityRules, metadata.compressedFullDescriptionOfAllContents!, "qualityEloRating");
  }

  extractFileIdFromPath(filePath: string): string | null {
    const url = Object.values(this.fileMetadata).find((meta) =>
      filePath.includes(meta.key)
    )?.url;
    return url ? this.generateFileId(url) : null;
  }

  public getFilesForProcessing(forceProcessing = false): string[] {
    const filesForProcessing: string[] = [];

    // Compare current fileMetadata with initialFileMetadata
    for (const [fileId, metadata] of Object.entries(this.fileMetadata)) {
      console.log(`Checking file ${JSON.stringify(metadata)}`);
      const initialMetadata = this.initialFileMetadata[fileId];
      // Check if file is new or has been changed
      if (
        forceProcessing ||
        !initialMetadata ||
        initialMetadata.hash !== metadata.hash
      ) {
        // Use the filePath from the metadata to ensure correct file is processed
        if (metadata.filePath) {
          filesForProcessing.push(metadata.filePath); // filePath is assumed to be stored in metadata
        } else {
          console.error(`File path missing in metadata for fileId: ${fileId}`);
        }
      } else {
        console.log(`File ${metadata.filePath} has not been modified`);
      }
    }

    return filesForProcessing;
  }

  updateCachedFilesAndMetadata(
    relativePath: string,
    url: string,
    data: Buffer,
    contentType: string,
    lastModifiedOnServer: string
  ) {
    const fileId = this.generateFileId(url);
    const hash = this.computeHash(data);

    // Update or create new metadata entry
    this.fileMetadata[fileId] = {
      ...this.fileMetadata[fileId], // Retain existing metadata
      url,
      fileId,
      contentType,
      filePath: relativePath, // Ensure filePath is set here
      lastModified: new Date().toISOString(),
      lastModifiedOnServer,
      size: data.length,
      hash,
    };

    console.log(
      `Cached file ${relativePath} ${JSON.stringify(
        this.fileMetadata[fileId],
        null,
        2
      )}`
    );
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

  getFileNameAndPath(
    url: string,
    extension: string
  ): { fullPath: string; relativePath: string } {
    const urlObj = new URL(url);
    let basename = path.basename(urlObj.pathname);
    const folderHash = crypto.createHash("md5").update(url).digest("hex");
    const baseDir = `./ingestion/cache/${folderHash}`;

    // Check if basename is empty or does not look like a filename, then use a default name
    if (!basename || basename === "/" || !basename.includes(".")) {
      basename = `default${extension}`; // Use a default basename if necessary
    } else {
      // Ensure the filename uses the determined extension without duplication
      basename = basename.replace(new RegExp(`${extension}$`), "") + extension;
    }

    const fullPath = path.join(baseDir, basename);
    const relativePath = fullPath; // Using fullPath as relativePath for simplicity

    return { fullPath, relativePath };
  }

  async downloadAndCache(urls: string[], isJsonData: boolean): Promise<void> {
    for (const url of urls) {
      try {
        const fileId = this.generateFileId(url);
        const metadata = this.fileMetadata[fileId];
        const responseHead = await fetch(url, { method: "HEAD" });
        const lastModified = responseHead.headers.get("Last-Modified");

        // Check if the file already exists and matches the cached version
        if (metadata) {
          const contentLength = parseInt(
            responseHead.headers.get("Content-Length") ?? "0",
            10
          );
          const cachedLastModified = new Date(metadata.lastModifiedOnServer);
          const fetchedLastModified = new Date(lastModified!);

          console.log(`Last modified: ${lastModified}`);
          console.log(`Content length: ${contentLength}`);
          console.log(`Cached last modified: ${cachedLastModified}`);
          console.log(`Fetched last modified: ${fetchedLastModified}`);
          console.log(`Metadata lastmod: ${metadata.lastModified}`);

          console.log(
            `-----> ${fetchedLastModified.getTime()} === ${cachedLastModified.getTime()}`
          );

          // Then compare the time values directly
          if (
            fetchedLastModified.getTime() === cachedLastModified.getTime() &&
            contentLength === metadata.size
          ) {
            console.log(`Using cached version for ${url}`);
            continue; // Skip downloading if the cached file is up to date
          } else {
            console.log(`Cached file for ${url} is outdated, re-downloading`);
          }
        }

        // Existing logic to download and cache the file
        const contentResponse = await fetch(url);
        if (!contentResponse.ok) {
          throw new Error(
            `Content fetch failed with status ${contentResponse.status} for URL: ${url}`
          );
        }

        const contentType =
          contentResponse.headers.get("Content-Type") || "unknown";
        let extension = this.determineExtension(contentType, isJsonData);

        const arrayBuffer = await contentResponse.arrayBuffer();
        const data = Buffer.from(arrayBuffer);

        const { fullPath, relativePath } = this.getFileNameAndPath(
          url,
          extension
        );
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, data);

        this.updateCachedFilesAndMetadata(
          relativePath,
          url,
          data,
          contentType,
          lastModified || ""
        );
      } catch (error) {
        console.error(`Failed to download content for URL ${url}:`, error);
      }
    }
    await this.saveFileMetadata();
  }

  determineExtension(contentType: string, isJsonData: boolean): string {
    // Default extension for unknown content types or when specific handling is not required
    let extension = ".bin";

    if (contentType.includes("application/pdf")) {
      extension = ".pdf";
    } else if (contentType.includes("text/html")) {
      extension = ".html";
    } else if (contentType.includes("application/json") || isJsonData) {
      extension = ".json";
    } else if (contentType.includes("image/jpeg")) {
      extension = ".jpg";
    } else if (contentType.includes("image/png")) {
      extension = ".png";
    } else if (contentType.includes("image/gif")) {
      extension = ".gif";
    } else if (contentType.includes("image/svg+xml")) {
      extension = ".svg";
    } else if (contentType.includes("image/webp")) {
      extension = ".webp";
    } else if (contentType.includes("image/avif")) {
      extension = ".avif";
    } else if (contentType.includes("text/plain")) {
      extension = ".txt";
    } else if (contentType.includes("text/markdown")) {
      extension = ".md";
    } else if (contentType.includes("application/msword")) {
      extension = ".doc";
    } else if (
      contentType.includes(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ) {
      extension = ".docx";
    } else if (contentType.includes("application/vnd.ms-excel")) {
      extension = ".xls";
    } else if (
      contentType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ) {
      extension = ".xlsx";
    }

    return extension;
  }

  protected async processJsonUrls(urls: string[]): Promise<void> {
    for (const url of urls) {
      const response = await fetch(url);
      const jsonData = await response.json();
      const folderHash = crypto.createHash("md5").update(url).digest("hex");
      const folderPath = `./ingestion/cache/${folderHash}`;
      await fs.mkdir(folderPath, { recursive: true });
      const jsonFilePath = `${folderPath}/data.json`;
      await fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2));
      this.cachedFiles.push(jsonFilePath); // Track cached JSON file

      const urlsToFetch = this.getExternalUrlsFromJson(jsonData);
      await this.downloadAndCache(urlsToFetch, true); // Download and cache content from URLs found in JSON
    }
  }

  async loadFileMetadata(): Promise<void> {
    try {
      const metadataJson = await fs.readFile(this.fileMetadataPath, "utf-8");
      this.fileMetadata = JSON.parse(metadataJson);
    } catch (error) {
      console.log("No existing metadata found: " + error);
      process.exit(1);
      this.fileMetadata = {};
    }
  }

  async saveFileMetadata(): Promise<void> {
    await fs.writeFile(
      this.fileMetadataPath,
      JSON.stringify(this.fileMetadata, null, 2)
    );
  }
}
