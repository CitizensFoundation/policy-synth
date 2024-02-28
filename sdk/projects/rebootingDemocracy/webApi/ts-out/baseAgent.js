import path from "path";
import crypto, { createHash } from "crypto";
import { ChatOpenAI } from "@langchain/openai";
import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "./constants.js";
export class BaseIngestionAgent extends PolicySynthAgentBase {
    minChunkTokenLength = 1000;
    maxChunkTokenLength = 3500;
    maxFileProcessTokenLength = 110000;
    roughFastWordTokenRatio = 1.25;
    constructor() {
        super();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.ingestionModel.temperature,
            maxTokens: IEngineConstants.ingestionModel.maxOutputTokens,
            modelName: IEngineConstants.ingestionModel.name,
            verbose: IEngineConstants.ingestionModel.verbose,
        });
    }
    resetLlmTemperature() {
        this.chat.temperature = IEngineConstants.ingestionModel.temperature;
    }
    randomizeLlmTemperature() {
        this.chat.temperature = Math.random() * (0.55 - 0.01) + 0.01;
    }
    splitDataForProcessing(data, maxTokenLength = this.maxFileProcessTokenLength) {
        let processedData = data;
        // Step 1: Preprocess to add line breaks carefully, avoiding disrupting list formats
        const lineBreakDensityCheck = (processedData.match(/\n/g) || []).length / processedData.length < 0.001;
        if (lineBreakDensityCheck) {
            // Attempting to add line breaks after sentences, avoiding those that are part of a list
            const sentenceBoundaryRegex = /(?<!\d)\.(\s+)(?=[A-Z])/g;
            processedData = processedData.replace(sentenceBoundaryRegex, '.$1\n');
        }
        const parts = [];
        let remainingData = processedData;
        // Step 2: Split the text, taking care not to disrupt the integrity of ordered lists
        while (this.getEstimateTokenLength(remainingData) > maxTokenLength) {
            let splitPosition = remainingData.lastIndexOf("\n\n", maxTokenLength);
            if (splitPosition === -1) {
                splitPosition = remainingData.lastIndexOf("\n", maxTokenLength);
            }
            if (splitPosition === -1 || splitPosition > maxTokenLength) {
                // Default split position if no suitable newline character is found or if it's too far
                splitPosition = maxTokenLength;
            }
            // Ensure split doesn't break a sentence or a list item
            if (splitPosition !== 0 && (remainingData[splitPosition - 1].match(/\w/) || remainingData[splitPosition].match(/^\d+\./))) {
                // Find the nearest previous newline to avoid breaking words or list items
                const lastNewLine = remainingData.lastIndexOf("\n", splitPosition - 1);
                splitPosition = lastNewLine !== -1 ? lastNewLine : splitPosition;
            }
            parts.push(remainingData.substring(0, splitPosition).trim());
            remainingData = remainingData.substring(splitPosition).trimStart();
        }
        if (remainingData) {
            parts.push(remainingData);
        }
        return parts;
    }
    getEstimateTokenLength(data) {
        const words = data.split(" ");
        return words.length * this.roughFastWordTokenRatio;
    }
    computeHash(data) {
        return createHash("sha256").update(data).digest("hex");
    }
    getFirstMessages(systemMessage, userMessage) {
        return [systemMessage, userMessage];
    }
    getFileName(url, isJsonData) {
        const urlObj = new URL(url);
        let baseName = path.basename(urlObj.pathname);
        // Ensure there's a meaningful baseName, especially for JSON data
        if (!baseName || isJsonData) {
            // Fallback filename for JSON or when basename is missing
            baseName = isJsonData ? "data.json" : "content.bin"; // 'content.bin' as a generic binary data filename
        }
        if (isJsonData) {
            const folderHash = this.generateFileId(url);
            const folderPath = `./ingestion/cache/${folderHash}`;
            return path.join(folderPath, baseName);
        }
        return path.join("./ingestion/cache", baseName);
    }
    getExternalUrlsFromJson(jsonData) {
        const urls = [];
        const checkAndCollectUrls = (obj) => {
            if (typeof obj === "string" &&
                (obj.startsWith("http://") || obj.startsWith("https://"))) {
                urls.push(obj);
            }
            else if (Array.isArray(obj)) {
                for (const item of obj) {
                    checkAndCollectUrls(item);
                }
            }
            else if (typeof obj === "object" && obj !== null) {
                for (const key of Object.keys(obj)) {
                    checkAndCollectUrls(obj[key]);
                }
            }
        };
        checkAndCollectUrls(jsonData);
        return urls;
    }
    generateFileId(url) {
        return crypto.createHash("md5").update(url).digest("hex");
    }
}
