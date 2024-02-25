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
    this.chat!.temperature = Math.random() * (0.8 - 0.01) + 0.01
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

  getEstimateTokenLength(data: string): number {
    const words = data.split(" ");
    return words.length * this.roughFastWordTokenRatio;
  }

  computeHash(data: Buffer): string {
    return createHash("sha256").update(data).digest("hex");
  }

  getFirstMessages(systemMessage: SystemMessage, userMessage: BaseMessage) {
    return [
      systemMessage,
      userMessage,
     ] as BaseMessage[];
  }

  getFileName(url: string, isJsonData: boolean): string {
    const baseName = path.basename(new URL(url).pathname);
    if (isJsonData) {
      const folderHash = this.generateFileId(url);
      const folderPath = `./cache/${folderHash}`;
      return `${folderPath}/${baseName}`;
    }
    return `./cache/${baseName}`;
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
