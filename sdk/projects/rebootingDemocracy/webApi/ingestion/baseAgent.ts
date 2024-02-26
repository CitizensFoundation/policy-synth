import path from "path";
import crypto, { createHash } from "crypto";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "./constants.js";

export abstract class BaseIngestionAgent extends PolicySynthAgentBase {
  minChunkTokenLength: number = 1000;
  maxChunkTokenLength: number = 3500;
  maxFileProcessTokenLength: number = 110000;
  roughFastWordTokenRatio: number = 1.25;

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
    this.chat!.temperature = IEngineConstants.ingestionModel.temperature;
  }

  randomizeLlmTemperature() {
    this.chat!.temperature = Math.random() * (0.55 - 0.01) + 0.01;
  }

  splitDataForProcessing(data: string, maxTokenLength: number = this.maxFileProcessTokenLength): string[] {
    const parts: string[] = [];
    let remainingData = data;

    while (this.getEstimateTokenLength(remainingData) > maxTokenLength) {
      let splitPosition = remainingData.lastIndexOf("\n\n", maxTokenLength);
      if (splitPosition === -1) {
        splitPosition = remainingData.lastIndexOf("\n", maxTokenLength);
      }

      if (splitPosition === -1) {
        // Initialize the best position as -1 indicating no suitable split found yet
        let bestPosition = -1;

        // Search backwards for a digit followed by a period, indicating the start of a list item
        for (let i = maxTokenLength; i > 0; i--) {
          if (remainingData[i] === '.' && i > 1 && /\d/.test(remainingData[i-1])) {
            // Found a potential list start, now check for spaces or line starts before the digit
            if (remainingData[i-2] === ' ' || remainingData[i-2] === '\n' || i-2 === 0) {
              // Split before the digit to preserve context
              bestPosition = i-1;
              break;
            }
          }
        }

        splitPosition = bestPosition !== -1 ? bestPosition : maxTokenLength;
      }

      // Ensure the split position does not exceed the length of the remaining data
      splitPosition = Math.min(splitPosition, remainingData.length);

      parts.push(remainingData.substring(0, splitPosition).trim());
      remainingData = remainingData.substring(splitPosition).trimStart();
    }

    if (remainingData) {
      parts.push(remainingData); // Add the remaining data as the last part
    }
    return parts;
  }



  getEstimateTokenLength(data: string): number {
    const words = data.split(" ");
    return words.length * this.roughFastWordTokenRatio;
  }

  computeHash(data: Buffer): string {
    return createHash("sha256").update(data).digest("hex");
  }

  getFirstMessages(systemMessage: SystemMessage, userMessage: BaseMessage) {
    return [systemMessage, userMessage] as BaseMessage[];
  }

  getFileName(url: string, isJsonData: boolean): string {
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

  getExternalUrlsFromJson(jsonData: any): string[] {
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

  generateFileId(url: string): string {
    return crypto.createHash("md5").update(url).digest("hex");
  }
}
