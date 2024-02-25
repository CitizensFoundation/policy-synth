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
        this.chat.temperature = Math.random() * (0.8 - 0.01) + 0.01;
    }
    splitDataForProcessing(data, maxTokenLength = this.maxFileProcessTokenLength) {
        const parts = [];
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
    getEstimateTokenLength(data) {
        const words = data.split(" ");
        return words.length * this.roughFastWordTokenRatio;
    }
    computeHash(data) {
        return createHash("sha256").update(data).digest("hex");
    }
    getFirstMessages(systemMessage, userMessage) {
        return [
            systemMessage,
            userMessage,
        ];
    }
    getFileName(url, isJsonData) {
        const urlObj = new URL(url);
        let baseName = path.basename(urlObj.pathname);
        // Ensure there's a meaningful baseName, especially for JSON data
        if (!baseName || isJsonData) {
            // Fallback filename for JSON or when basename is missing
            baseName = isJsonData ? 'data.json' : 'content.bin'; // 'content.bin' as a generic binary data filename
        }
        if (isJsonData) {
            const folderHash = this.generateFileId(url);
            const folderPath = `./ingestion/cache/${folderHash}`;
            return path.join(folderPath, baseName);
        }
        return path.join('./ingestion/cache', baseName);
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
