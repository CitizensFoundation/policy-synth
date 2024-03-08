import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import fetch from "node-fetch";
import puppeteer from "puppeteer-extra";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { DocumentCleanupAgent } from "./docCleanup.js";
import { DocumentTreeSplitAgent } from "./docTreeSplitter.js";
import { BaseIngestionAgent } from "./baseAgent.js";
import { IngestionChunkCompressorAgent } from "./chunkCompressorAgent.js";
import { IngestionContentParser } from "./contentParser.js";
import { DocumentAnalyzerAgent } from "./docAnalyzer.js";
import { IngestionChunkAnalzyerAgent } from "./chunkAnalyzer.js";
import { IngestionChunkRanker } from "./chunkRanker.js";
import { IngestionDocumentRanker } from "./docRanker.js";
import { DocumentClassifierAgent } from "./docClassifier.js";
export class IngestionAgentProcessor extends BaseIngestionAgent {
    dataLayoutPath;
    cachedFiles = [];
    fileMetadataPath = "./ingestion/cache/fileMetadata.json";
    fileMetadata = {};
    initialFileMetadata = {};
    cleanupAgent;
    splitAgent;
    chunkCompressor;
    chunkAnalysisAgent;
    docAnalysisAgent;
    constructor(dataLayoutPath = "file://ingestion/dataLayout.json") {
        super();
        this.dataLayoutPath = dataLayoutPath;
        this.loadFileMetadata()
            .then(() => {
            console.log("Metadata loaded");
        })
            .catch((err) => {
            console.error("Failed to load file metadata:", err);
        });
        this.cleanupAgent = new DocumentCleanupAgent();
        this.splitAgent = new DocumentTreeSplitAgent();
        this.chunkCompressor = new IngestionChunkCompressorAgent();
        this.docAnalysisAgent = new DocumentAnalyzerAgent();
        this.chunkAnalysisAgent = new IngestionChunkAnalzyerAgent();
    }
    async processDataLayout() {
        await this.loadFileMetadata(); // Load existing metadata to compare against
        this.initialFileMetadata = JSON.parse(JSON.stringify(this.fileMetadata)); // Deep copy for initial state comparison
        const downloadContent = false;
        const dataLayout = await this.readDataLayout();
        if (downloadContent) {
            const browser = await puppeteer.launch({ headless: true });
            try {
                this.logger.debug("Launching browser");
                const browserPage = await browser.newPage();
                browserPage.setDefaultTimeout(IEngineConstants.webPageNavTimeout);
                browserPage.setDefaultNavigationTimeout(IEngineConstants.webPageNavTimeout);
                await browserPage.setUserAgent(IEngineConstants.currentUserAgent);
                await this.downloadAndCache(dataLayout.documentUrls, false, browserPage);
                await this.saveFileMetadata();
                const disableJsonUrls = true;
                if (!disableJsonUrls) {
                    await this.processJsonUrls(dataLayout.jsonUrls, browserPage);
                    await this.saveFileMetadata();
                }
            }
            catch (error) {
                console.error("Failed to process data layout:", error);
            }
            finally {
                await browser.close();
            }
        }
        const filesForProcessing = this.getFilesForProcessing(true);
        console.log("Files for processing:", filesForProcessing);
        this.processFiles(filesForProcessing);
        const allDocumentSources = this.getMetaDataForAllFiles();
        await this.processAllSources(allDocumentSources, dataLayout);
    }
    async processAllSources(allDocumentSources, dataLayout) {
        console.log("Classifying all documents");
        const classifier = new DocumentClassifierAgent();
        await classifier.classifyAllDocuments(allDocumentSources, dataLayout);
        const ranker = new IngestionDocumentRanker();
        console.log("Ranking by relevance");
        const relevanceRules = "Rank the two documents based on the relevance to the project";
        await ranker.rankDocuments(allDocumentSources, relevanceRules, dataLayout.aboutProject, "relevanceEloRating");
        console.log("Ranking by substance");
        const substanceRules = "Rank the two documents based substance and completeness of the information";
        await ranker.rankDocuments(allDocumentSources, substanceRules, dataLayout.aboutProject, "substanceEloRating");
        for (const category of dataLayout.categories) {
            console.log(`Ranking documents in the ${category} category`);
            // Filter documents that fall into the current category
            const documentsInCategory = allDocumentSources.filter((doc) => doc.primaryCategory === category || doc.secondaryCategory === category);
            // Define a dynamic ELO rating field name based on the category
            const eloRatingFieldName = `${category.toLowerCase()}EloRating`;
            // Rank documents within the category
            const categoryRankingRules = `Rank the documents based on their relevance and substance within the ${category} category`;
            await ranker.rankDocuments(documentsInCategory, categoryRankingRules, dataLayout.aboutProject, eloRatingFieldName);
        }
    }
    async processSource(source) {
        const fileId = source.fileId;
        const cleanedUpData = source.cleanedDocument || "";
        const ranker = new IngestionDocumentRanker();
    }
    async processFiles(files) {
        for (const filePath of files) {
            try {
                let weaviateDocumentId = "TBD";
                console.log(`Processing file: ${filePath}`);
                const parser = new IngestionContentParser();
                const data = await parser.parseFile(filePath);
                const metadataEntry = Object.values(this.fileMetadata).find((meta) => meta.filePath === filePath);
                if (!metadataEntry) {
                    console.error(`Metadata not found for filePath: ${filePath}`);
                    continue;
                }
                //if (metadataEntry.fileId !== "735de0621e35c642758954aae1c3f0aa")
                //  continue;
                const reAnalyze = false;
                if (reAnalyze ||
                    !this.fileMetadata[metadataEntry.fileId].documentMetaData) {
                    (await this.docAnalysisAgent.analyze(metadataEntry.fileId, data, this.fileMetadata));
                    await this.saveFileMetadata();
                    // Create Weaviate object for document with all analyzies and get and id for the parts
                }
                // Cleanup fullContentsColumns in docAnalysis and redo the summaries
                const reCleanData = false;
                const cleanedUpData = (!reCleanData &&
                    this.fileMetadata[metadataEntry.fileId].cleanedDocument) ||
                    (await this.cleanupAgent.clean(data));
                console.log(`Cleaned up data: ${cleanedUpData}`);
                await this.saveFileMetadata();
                if (this.getEstimateTokenLength(cleanedUpData) >
                    this.maxFileProcessTokenLength) {
                    const dataParts = this.splitDataForProcessing(cleanedUpData);
                    for (const part of dataParts) {
                        await this.processFilePartTree(metadataEntry.fileId, part, weaviateDocumentId);
                    }
                }
                else {
                    await this.processFilePartTree(metadataEntry.fileId, cleanedUpData, weaviateDocumentId);
                }
            }
            catch (error) {
                console.error(`Failed to process file ${filePath}:`, error);
            }
        }
        await this.saveFileMetadata();
    }
    aggregateChunkData = (chunks) => {
        return chunks.reduce((acc, chunk) => {
            const chunkData = chunk.chunkData || "";
            const subChunkData = chunk.subChunks
                ? this.aggregateChunkData(chunk.subChunks)
                : "";
            return acc + chunkData + subChunkData;
        }, "");
    };
    async createTreeChunks(metadata, cleanedUpData) {
        let chunks;
        if (!metadata.cachedChunkStrategy) {
            chunks = (await this.splitAgent.splitDocumentIntoChunks(cleanedUpData));
            metadata.cachedChunkStrategy = chunks;
            await this.saveFileMetadata();
        }
        else {
            chunks = metadata.cachedChunkStrategy;
        }
        console.log(JSON.stringify(chunks, null, 2));
        console.log(`Split into ${chunks.length} chunks`);
        let masterChunkIndex = 0;
        const processChunk = async (chunk, parentChunk = undefined) => {
            let hasAggregatedChunkData = false;
            if (!chunk.chunkData && chunk.subChunks) {
                chunk.chunkData = this.aggregateChunkData([chunk]);
                hasAggregatedChunkData = true;
            }
            if (chunk.chunkData) {
                let chunkAnalyzeResponse = await this.chunkAnalysisAgent.analyze(chunk.chunkData);
                console.log(`\n\nAnalyzed chunk: ${JSON.stringify(chunkAnalyzeResponse)}`);
                if (!hasAggregatedChunkData) {
                    console.log(`\nBefore compression:\n${chunk.chunkData}\n`);
                    chunkAnalyzeResponse.fullCompressedContent =
                        await this.chunkCompressor.compress(chunk.chunkData);
                    console.log(`\nAfter compression:\n${chunkAnalyzeResponse.fullCompressedContent}\n\n`);
                }
                const chunkMetadata = {
                    chunkIndex: masterChunkIndex++,
                    chapterIndex: chunk.chapterIndex,
                    title: chunkAnalyzeResponse.title,
                    mainExternalUrlFound: chunkAnalyzeResponse.mainExternalUrlFound,
                    importantContextChunkIndexes: chunk.importantContextChapterIndexes,
                    shortSummary: chunkAnalyzeResponse.shortDescription,
                    fullSummary: chunkAnalyzeResponse.fullDescription,
                    compressedContent: chunkAnalyzeResponse.fullCompressedContent,
                    metaData: chunkAnalyzeResponse.textMetaData,
                    uncompressedContent: chunk.chunkData,
                    subChunks: [],
                };
                if (parentChunk === undefined) {
                    metadata.chunks.push(chunkMetadata);
                }
                else if (parentChunk) {
                    if (!parentChunk.subChunks) {
                        parentChunk.subChunks = [];
                    }
                    parentChunk.subChunks.push(chunkMetadata);
                }
                if (chunk.subChunks && chunk.subChunks.length > 0) {
                    for (let subChunk of chunk.subChunks) {
                        await processChunk(subChunk, chunkMetadata); // Recursively process subChunks
                    }
                }
            }
        };
        for (let chunk of chunks) {
            await processChunk(chunk); // Initial call to process top-level chunks
        }
    }
    async processFilePartTree(fileId, cleanedUpData, weaviateDocumentId) {
        console.log(`Processing file part for fileId: ${fileId}`);
        this.fileMetadata[fileId].cleanedDocument = cleanedUpData;
        await this.saveFileMetadata();
        const metadata = this.fileMetadata[fileId] || {};
        metadata.weaviteId = weaviateDocumentId;
        let rechunk = false;
        if (fileId != "735de0621e35c642758954aae1c3f0aa" &&
            fileId != "8211f8f7011d29e3da018207b2d991da") {
            rechunk = true;
            console.log("RECHUNKING --------------------------------------- >");
        }
        if (rechunk || !metadata.chunks || metadata.chunks.length === 0) {
            metadata.chunks = [];
            console.log(`Creating tree chunks for fileId: ${fileId}`);
            await this.createTreeChunks(metadata, cleanedUpData);
        }
        else {
            console.log(`Chunks already exist for fileId: ${fileId}`);
        }
        await this.saveFileMetadata();
        console.log(`Metadata after chunking:\n${JSON.stringify(metadata, null, 2)}`);
        const reRank = false;
        if (reRank || metadata.chunks[0].relevanceEloRating === undefined) {
            await this.rankChunks(metadata);
            await this.saveFileMetadata();
        }
        console.log(`Metadata after ranking:\n${JSON.stringify(metadata, null, 2)}`);
        await new Promise((resolve) => setTimeout(resolve, 15000));
        //    await this.saveFileMetadata();
    }
    async rankChunks(metadata) {
        const ranker = new IngestionChunkRanker();
        const flattenedChunks = metadata.chunks.reduce((acc, chunk) => acc.concat(chunk, chunk.subChunks || []), []);
        console.log("Ranking by relevance");
        const relevanceRules = "Rank the two chunks based on the relevance to the document";
        await ranker.rankDocumentChunks(flattenedChunks, relevanceRules, metadata.compressedFullDescriptionOfAllContents, "relevanceEloRating");
        console.log("Ranking by substance");
        const substanceRules = "Rank the two chunks based substance and completeness of the information";
        await ranker.rankDocumentChunks(flattenedChunks, substanceRules, metadata.compressedFullDescriptionOfAllContents, "substanceEloRating");
        console.log("Ranking by quality");
        const qualityRules = "Rank the two chunks based on quality of the information";
        await ranker.rankDocumentChunks(flattenedChunks, qualityRules, metadata.compressedFullDescriptionOfAllContents, "qualityEloRating");
    }
    extractFileIdFromPath(filePath) {
        const url = Object.values(this.fileMetadata).find((meta) => filePath.includes(meta.key))?.url;
        return url ? this.generateFileId(url) : null;
    }
    getFilesForProcessing(forceProcessing = false) {
        const filesForProcessing = [];
        // Compare current fileMetadata with initialFileMetadata
        for (const [fileId, metadata] of Object.entries(this.fileMetadata)) {
            console.log(`Checking file ${JSON.stringify(metadata)}`);
            const initialMetadata = this.initialFileMetadata[fileId];
            // Check if file is new or has been changed
            if (forceProcessing ||
                !initialMetadata ||
                initialMetadata.hash !== metadata.hash) {
                // Use the filePath from the metadata to ensure correct file is processed
                if (metadata.filePath) {
                    filesForProcessing.push(metadata.filePath); // filePath is assumed to be stored in metadata
                }
                else {
                    console.error(`File path missing in metadata for fileId: ${fileId}`);
                }
            }
            else {
                console.log(`File ${metadata.filePath} has not been modified`);
            }
        }
        return filesForProcessing;
    }
    getAllFilesForProcessing() {
        return Object.values(this.fileMetadata).map((meta) => meta.filePath);
    }
    getMetaDataForAllFiles() {
        return Object.values(this.fileMetadata);
    }
    updateCachedFilesAndMetadata(relativePath, url, data, contentType, lastModifiedOnServer) {
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
        console.log(`Cached file ${relativePath} ${JSON.stringify(this.fileMetadata[fileId], null, 2)}`);
    }
    async readDataLayout() {
        let dataLayout;
        if (this.dataLayoutPath.startsWith("file://")) {
            const filePath = this.dataLayoutPath.replace("file://", "");
            const data = await fs.readFile(filePath, "utf-8");
            dataLayout = JSON.parse(data);
        }
        else {
            try {
                const response = await fetch(this.dataLayoutPath);
                dataLayout = (await response.json());
            }
            catch (error) {
                throw new Error(`Failed to read data layout from ${this.dataLayoutPath}: ${error}`);
            }
        }
        return dataLayout;
    }
    getFileNameAndPath(url, extension) {
        const urlObj = new URL(url);
        let basename = path.basename(urlObj.pathname);
        const folderHash = crypto.createHash("md5").update(url).digest("hex");
        const baseDir = `./ingestion/cache/${folderHash}`;
        // Check if basename is empty or does not look like a filename, then use a default name
        if (!basename || basename === "/" || !basename.includes(".")) {
            basename = `default${extension}`; // Use a default basename if necessary
        }
        else {
            // Ensure the filename uses the determined extension without duplication
            basename = basename.replace(new RegExp(`${extension}$`), "") + extension;
        }
        const fullPath = path.join(baseDir, basename);
        const relativePath = fullPath; // Using fullPath as relativePath for simplicity
        return { fullPath, relativePath };
    }
    async downloadAndCache(urls, isJsonData, browserPage) {
        for (const url of urls) {
            try {
                const fileId = this.generateFileId(url);
                const metadata = this.fileMetadata[fileId];
                const responseHead = await fetch(url, { method: "HEAD" });
                const lastModified = responseHead.headers.get("Last-Modified");
                // Check if the file already exists and matches the cached version
                if (metadata) {
                    const contentLength = parseInt(responseHead.headers.get("Content-Length") ?? "0", 10);
                    const cachedLastModified = new Date(metadata.lastModifiedOnServer);
                    const fetchedLastModified = new Date(lastModified);
                    console.log(`Last modified: ${lastModified}`);
                    console.log(`Content length: ${contentLength}`);
                    console.log(`Cached last modified: ${cachedLastModified}`);
                    console.log(`Fetched last modified: ${fetchedLastModified}`);
                    console.log(`Metadata lastmod: ${metadata.lastModified}`);
                    console.log(`-----> ${fetchedLastModified.getTime()} === ${cachedLastModified.getTime()}`);
                    const skipIfChunked = true;
                    if ((skipIfChunked && metadata.chunks && metadata.chunks.length > 0) ||
                        (fetchedLastModified.getTime() === cachedLastModified.getTime() &&
                            contentLength === metadata.size)) {
                        console.log(`Using cached version for ${url}`);
                        continue; // Skip downloading if the cached file is up to date
                    }
                    else {
                        console.log(`Cached file for ${url} is outdated, re-downloading`);
                    }
                }
                // Existing logic to download and cache the file
                const contentResponse = await fetch(url);
                if (!contentResponse.ok) {
                    throw new Error(`Content fetch failed with status ${contentResponse.status} for URL: ${url}`);
                }
                const contentType = contentResponse.headers.get("Content-Type") || "unknown";
                let extension = this.determineExtension(contentType, isJsonData);
                // If an image file
                if (extension.indexOf("pdf") > -1) {
                    const arrayBuffer = await contentResponse.arrayBuffer();
                    const data = Buffer.from(arrayBuffer);
                    //TODO: Refactor so not to do this twice
                    const { fullPath, relativePath } = this.getFileNameAndPath(url, extension);
                    await fs.mkdir(path.dirname(fullPath), { recursive: true });
                    await fs.writeFile(fullPath, data);
                    this.updateCachedFilesAndMetadata(relativePath, url, data, contentType, lastModified || "");
                }
                else if (!contentType.includes("image")) {
                    console.log(`Downloading content for URL: ${url}`);
                    const response = await browserPage.goto(url, {
                        waitUntil: ["load", "networkidle0"],
                    });
                    if (response) {
                        // Wait for 10 seconds
                        //await new Promise((resolve) => setTimeout(resolve, 10000));
                        const data = await browserPage.content();
                        const { fullPath, relativePath } = this.getFileNameAndPath(url, extension);
                        await fs.mkdir(path.dirname(fullPath), { recursive: true });
                        await fs.writeFile(fullPath, data);
                        this.updateCachedFilesAndMetadata(relativePath, url, data, contentType, lastModified || "");
                    }
                    else {
                        console.log(`Failed to fetch content for URL: ${url}`);
                    }
                }
                else {
                    console.log(`Skipping download for image URL: ${url}`);
                }
            }
            catch (error) {
                console.error(`Failed to download content for URL ${url}:`, error);
            }
        }
        await this.saveFileMetadata();
    }
    determineExtension(contentType, isJsonData) {
        // Default extension for unknown content types or when specific handling is not required
        let extension = ".bin";
        if (contentType.includes("application/pdf")) {
            extension = ".pdf";
        }
        else if (contentType.includes("text/html")) {
            extension = ".html";
        }
        else if (contentType.includes("application/json") || isJsonData) {
            extension = ".json";
        }
        else if (contentType.includes("image/jpeg")) {
            extension = ".jpg";
        }
        else if (contentType.includes("image/png")) {
            extension = ".png";
        }
        else if (contentType.includes("image/gif")) {
            extension = ".gif";
        }
        else if (contentType.includes("image/svg+xml")) {
            extension = ".svg";
        }
        else if (contentType.includes("image/webp")) {
            extension = ".webp";
        }
        else if (contentType.includes("image/avif")) {
            extension = ".avif";
        }
        else if (contentType.includes("text/plain")) {
            extension = ".txt";
        }
        else if (contentType.includes("text/markdown")) {
            extension = ".md";
        }
        else if (contentType.includes("application/msword")) {
            extension = ".doc";
        }
        else if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
            extension = ".docx";
        }
        else if (contentType.includes("application/vnd.ms-excel")) {
            extension = ".xls";
        }
        else if (contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            extension = ".xlsx";
        }
        return extension;
    }
    async processJsonUrls(urls, browserPage) {
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
            await this.downloadAndCache(urlsToFetch, true, browserPage); // Download and cache content from URLs found in JSON
        }
    }
    async loadFileMetadata() {
        try {
            const metadataJson = await fs.readFile(this.fileMetadataPath, "utf-8");
            this.fileMetadata = JSON.parse(metadataJson);
        }
        catch (error) {
            // First, check if the error is an instance of Error and has a 'code' property
            if (error instanceof Error && "code" in error) {
                const readError = error; // Type assertion
                if (readError.code === "ENOENT") {
                    console.log("File does not exist, initializing empty metadata.");
                    this.fileMetadata = {}; // Initialize as empty object
                }
                else {
                    // Handle other types of errors that might have occurred during readFile
                    throw error;
                }
            }
            else {
                console.error("Error loading metadata: " + error);
                process.exit(1); // Consider if this is the desired behavior
            }
        }
    }
    async saveFileMetadata() {
        await fs.writeFile(this.fileMetadataPath, JSON.stringify(this.fileMetadata, null, 2));
    }
}
