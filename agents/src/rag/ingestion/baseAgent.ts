import path from "path";
import crypto, { createHash } from "crypto";
import { PolicySynthSimpleAgentBase } from "../../base/simpleAgent.js";

export abstract class BaseIngestionAgent extends PolicySynthSimpleAgentBase {
  minChunkTokenLength: number = 1000;
  maxChunkTokenLength: number = 3500;
  maxFileProcessTokenLength: number = 110000;
  roughFastWordTokenRatio: number = 1.25;
  maxModelTokensOut = 4096;
  modelTemperature = 0.0;

  logShortLines(text: string, maxLength = 50) {
    // Split the text into lines
    // then only console.log the first 100 characters of each line
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      console.log(lines[i].substring(0, maxLength));
    }
  }

  splitDataForProcessing(
    data: string,
    maxTokenLength: number = this.maxFileProcessTokenLength
  ): string[] {
    let processedData = data;

    // Preprocess to add line breaks for better readability, especially for texts without sufficient line breaks
    const lineBreakDensityCheck =
      (processedData.match(/\n/g) || []).length / processedData.length < 0.001;
    if (lineBreakDensityCheck) {
      // Add line breaks after sentences, carefully avoiding disrupting list formats
      const sentenceBoundaryRegex = /(?<!\d)\.(\s+)(?=[A-Z])/g;
      processedData = processedData.replace(sentenceBoundaryRegex, ".$1\n");

      // Additionally, for texts that might lack line breaks entirely, consider adding breaks at other potential sentence endings
      // This step is simplified and might need adjustments for specific text formats
    }

    const parts: string[] = [];
    let remainingData = processedData;

    const totalLength = remainingData.length;
    let idealNumberOfParts = Math.ceil(totalLength / maxTokenLength);
    let idealChunkSize = Math.ceil(totalLength / idealNumberOfParts);

    while (remainingData.length > 0) {
      let splitPosition = Math.min(idealChunkSize, remainingData.length);

      // Adjust for natural breaks, avoiding splitting in the middle of sentences or lists
      if (splitPosition < remainingData.length) {
        // Not the last chunk
        let potentialSplitPosition = remainingData.lastIndexOf(
          "\n",
          splitPosition
        );
        if (potentialSplitPosition !== -1) {
          splitPosition = potentialSplitPosition;
        } else {
          // If no natural break is found, look for the next best split position to avoid mid-sentence splits
          potentialSplitPosition = remainingData.indexOf("\n", splitPosition);
          if (potentialSplitPosition !== -1) {
            splitPosition = potentialSplitPosition;
          }
        }
      }

      parts.push(remainingData.substring(0, splitPosition).trim());
      remainingData = remainingData.substring(splitPosition).trimStart();

      // Recalculate idealChunkSize for remaining data to maintain even distribution
      idealChunkSize = remainingData.length / --idealNumberOfParts;
    }

    return parts;
  }

  parseJsonFromLlmResponse(data: string) {
    let startIndex, endIndex;

    startIndex = data.indexOf("```json");
    if (startIndex < 0)
      startIndex = data.indexOf("json```");
    endIndex = data.indexOf("```", startIndex + 6);

    console.log(`JSON PARSE startIndex: ${startIndex}, endIndex: ${endIndex}`);

    if (startIndex > -1 && endIndex > -1) {
      let jsonContent = data.substring(startIndex + 7, endIndex).trim();
      return JSON.parse(jsonContent);
    } else {
      console.error(`JSON PARSE ERROR: Could not find JSON content in response ${data}`);
    }
  }

  splitDataForProcessingWorksBigChunks(
    data: string,
    maxTokenLength: number = this.maxFileProcessTokenLength
  ): string[] {
    let processedData = data;

    // Step 1: Preprocess to add line breaks carefully, avoiding disrupting list formats
    const lineBreakDensityCheck =
      (processedData.match(/\n/g) || []).length / processedData.length < 0.001;
    if (lineBreakDensityCheck) {
      // Attempting to add line breaks after sentences, avoiding those that are part of a list
      const sentenceBoundaryRegex = /(?<!\d)\.(\s+)(?=[A-Z])/g;
      processedData = processedData.replace(sentenceBoundaryRegex, ".$1\n");
    }

    const parts: string[] = [];
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
      if (
        splitPosition !== 0 &&
        (remainingData[splitPosition - 1].match(/\w/) ||
          remainingData[splitPosition].match(/^\d+\./))
      ) {
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

  getEstimateTokenLength(data: string): number {
    const words = data.split(" ");
    return words.length * this.roughFastWordTokenRatio;
  }

  computeHash(data: Buffer | string): string {
    return createHash("sha256").update(data).digest("hex");
  }

  getFirstMessages(systemMessage: PsModelMessage, userMessage: PsModelMessage) {
    return [systemMessage, userMessage] as PsModelMessage[];
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
