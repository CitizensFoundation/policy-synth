import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { BaseIngestionAgent } from "./baseAgent.js";

interface Chunk {
  data: string;
  startLine: number;
  actualStartLine?: number;
  actualEndLine?: number;
  subChunks?: Chunk[];
}

export class IngestionSplitAgent extends BaseIngestionAgent {
  maxSplitRetries = 15;
  minChunkCharacterLength = 50;
  maxChunkLinesLength = 40;

  strategySystemMessage =
    new SystemMessage(`You are an expert document split strategy generator.

Instructions:
- Your job is to analyze the text document and outline a strategy how best to split this document up into chapters.
- The contents should be split into chapters that cover the same topic or very connected topics.
- If there are case studies those should always be whole chapters or if very long, one long chapter.
- Always include the start of the document at chapterIndex 1.
- Do not output the actual contents only the strategy on how to split it up.
- At the start of each line you will see a line number in this format "1: " pay special attention to those line numbers and always output those line number as the chapterStartLineNumber for each chapter.
- Always output the chapterStartLineNumber for each chapter as a number not text.
- Chapters should never start on an empty line that just shows the line number.
- Use importantContextChapterIndexes for chapters that could be relevant to the current chapter when we will load this chapter for our retrieval augmented generation (RAG) solution. But don't use this for everything only the most important context connections.

Output:
- Reason about the task at hand, let's think step by step.
- Then ALWAYS output a JSON array at the end with your results:
  \`\`\`json
  [
    {
      chapterIndex: number;
      chapterTitle: string;
      chapterStartLineNumber: number;
      importantContextChapterIndexes: number[];
    }
  ]
  \`\`\`
`);

  strategyUserMessage = (data: string) =>
    new HumanMessage(`<DOCUMENT_TO_ANALYZE_FOR_SPLIT_STRATEGY>
    ${data}
</DOCUMENT_TO_ANALYZE_FOR_SPLIT_STRATEGY>

YOUR THOUGHTFUL STRATEGY:
`);

  strategyWithReviewUserMessage = (data: string, reviewComments: string) =>
    new HumanMessage(`<DOCUMENT_TO_ANALYZE_FOR_SPLIT_STRATEGY>
    ${data}
  </DOCUMENT_TO_ANALYZE_FOR_SPLIT_STRATEGY>

  This is your second attempt to devise a strategy, here are the reviewers comments on the last attempt:
  <REVIEW_FOR_LAST_ATTEMPT>
    ${reviewComments}
  </REVIEW_FOR_LAST_ATTEMPT>

  YOUR IMPROVED STRATEGY:
  `);

  reviewStrategySystemMessage =
    new SystemMessage(`You are an expert document split strategy evaluator.

Instructions:
- Your job is to evaluate a split strategy for a document.
- The contents should be split into chapters that cover the same topic or very connected topics.
- There can be long chapters covering many topics.
- The output should not be the actual contents only the strategy on how to split it up.
- If there are case studies those should be whole chapters or if long a part of longer chapters.
- Do not suggest any changes to the order of the document, it can't be changed.
- This is a recursive process, there might be long chapters we will alter split into sub chapters.
- At the start of each line you will see a line number in this format "1: " pay special attention to those line numbers, those should always align with the chapterStartLineNumber for each chapter.
- Chapters should never start on an empty line that just shows the line number.
- Make sure connected chapters are correct.

Output:
- If the strategy is good output only and with no explanation: PASSES
- If you have comments write them out and then output: FAILS
`);

  reviewStrategyUserMessage = (data: string, splitStrategy: string) =>
    new HumanMessage(`<DOCUMENT_FOR_SPLIT_STRATEGY>
    ${data}
</DOCUMENT_FOR_SPLIT_STRATEGY>

<SPLIT_STRATEGY_TO_EVALUATE>
  ${splitStrategy}
</SPLIT_STRATEGY_TO_EVALUATE>

YOUR EVALUATION: `);

  generateDiff(str1: string, str2: string): string {
    const maxLength = Math.min(str1.length, str2.length);
    let diffIndex = -1;
    for (let i = 0; i < maxLength; i++) {
      if (str1[i] !== str2[i]) {
        diffIndex = i;
        break;
      }
    }

    // If a difference is found, provide context around the difference.
    if (diffIndex !== -1) {
      const contextRange = 10; // Number of characters to show before and after the difference.
      const start = Math.max(0, diffIndex - contextRange);
      const end = Math.min(maxLength, diffIndex + contextRange);
      const str1Context = str1.substring(start, end);
      const str2Context = str2.substring(start, end);

      return `First difference at position ${diffIndex}: '${str1[diffIndex]}' (aggregated) vs '${str2[diffIndex]}' (original).\nContext (aggregated): "${str1Context}"\nContext (original): "${str2Context}"`;
    }

    // If no direct difference in characters but lengths differ, show which is longer.
    if (str1.length !== str2.length) {
      const longerStr = str1.length > str2.length ? "aggregated" : "original";
      return `No direct character difference found, but strings differ in length: ${str1.length} (aggregated) vs ${str2.length} (original). The ${longerStr} string is longer.`;
    }

    return "No difference found.";
  }

  logShortLines(text: string) {
    // Split the text into lines
    // then only console.log the first 100 characters of each line
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      console.log(lines[i].substring(0, 9999990));
    }
  }

  async fetchLlmChunkingStrategy(
    data: string,
    review: string | undefined,
    lastJson: LlmDocumentChunksStrategy[] | undefined
  ) {
    console.log("Generating chunking strategy...");
    const chunkingStrategy = (await this.callLLM(
      "ingestion-agent",
      IEngineConstants.ingestionModel,
      this.getFirstMessages(
        this.strategySystemMessage,
        review
          ? this.strategyWithReviewUserMessage(data, review)
          : this.strategyUserMessage(data)
      ),
      false
    )) as string;

    console.log(`Raw chunking strategy: ${chunkingStrategy}`);

    const lastChunkingStrategyJson = this.parseJsonFromLlmResponse(
      chunkingStrategy
    ) as LlmDocumentChunksStrategy[];

    console.log(
      `JSON strategy: ${JSON.stringify(lastChunkingStrategyJson, null, 2)}`
    );

    console.log("Reviewing chunking strategy...");

    const chunkingStrategyReview = (await this.callLLM(
      "ingestion-agent",
      IEngineConstants.ingestionModel,
      this.getFirstMessages(
        this.reviewStrategySystemMessage,
        this.reviewStrategyUserMessage(data, chunkingStrategy)
      ),
      false
    )) as string;

    console.log(`Chunking strategy: ${chunkingStrategyReview}`);

    return {
      chunkingStrategy,
      chunkingStrategyReview,
      lastChunkingStrategyJson,
    };
  }

  async splitDocumentIntoChunks(
    data: string,
    startingLineNumber: number = 0,
    isSubChunk: boolean = false,
    totalLinesInChunk?: number
  ) {
    console.log(
      `Splitting document into chunks... (Starting line number: ${startingLineNumber}) (isSubChunk: ${isSubChunk}) (totalLinesInChunk: ${totalLinesInChunk})`
    );
    if (!isSubChunk) {
      this.resetLlmTemperature();
    }
    let retryCount = 0;
    let validated = false;
    let lastChunkingStrategyJson: LlmDocumentChunksStrategy[] | undefined;
    let chunkingStrategyReview: string | undefined;

    while (!validated && retryCount < this.maxSplitRetries) {
      console.log(`Processing chunk...`);
      let dataWithLineNumber = data
        .split("\n")
        .map((line, index) => `${startingLineNumber + index + 1}: ${line}`)
        .join("\n");

      if (isSubChunk)
        console.log(`Sub Chunk Data with line numbers:\n`);
      else
        console.log(`Chunk Data with line numbers:\n`);

      this.logShortLines(dataWithLineNumber);

      try {
        const llmResults = await this.fetchLlmChunkingStrategy(
          dataWithLineNumber,
          chunkingStrategyReview,
          lastChunkingStrategyJson
        );
        chunkingStrategyReview = llmResults.chunkingStrategyReview;
        lastChunkingStrategyJson = llmResults.lastChunkingStrategyJson;

        console.log(
          `Strategy validatation results: ${
            chunkingStrategyReview.trim().toUpperCase().indexOf("PASSES") > -1
          }`
        );

        if (
          lastChunkingStrategyJson &&
          chunkingStrategyReview.trim().toUpperCase().indexOf("PASSES") > -1 &&
          llmResults.chunkingStrategy &&
          llmResults.chunkingStrategy.length
        ) {
          validated = true;
          console.log(`Chunking strategy validated.`);

          for (let i = 0; i < lastChunkingStrategyJson.length; i++) {
            console.log(`Processing chunk ${i + 1} of ${lastChunkingStrategyJson.length}`);
            const strategy = lastChunkingStrategyJson[i];
            const startLine = strategy.chapterStartLineNumber;
            let endLine;

            if (i + 1 < lastChunkingStrategyJson.length) {
              endLine = lastChunkingStrategyJson[i + 1].chapterStartLineNumber - 1;
            } else if (totalLinesInChunk) {
              // Ensure the end line does not exceed the total lines available for subchunks
              endLine = startLine + totalLinesInChunk - 1;
            } else {
              // Fallback to the total number of lines in the data if not a subchunk or if totalLinesInChunk is not provided
              endLine = dataWithLineNumber.split("\n").length;
            }

            const chunkSize = endLine - startLine + 1;
            const finalData = data
              .split("\n")
              .slice(startLine - 1, endLine)
              .join("\n");

            if (chunkSize > this.maxChunkLinesLength) {
              console.log(`Chunk ${i + 1} is oversized (${chunkSize} lines)`);
              const oversizedChunkContent = data
                .split("\n")
                .slice(startLine - 1, endLine)
                .join("\n");

                const totalLinesInOversizedChunk =
                oversizedChunkContent.split("\n").length;

              console.log(`Creating subchunks startline ${startLine} endline ${endLine} totalLinesInOversizedChunk ${totalLinesInOversizedChunk}`)

              console.log(`Oversizedchunk content:`)
              this.logShortLines(oversizedChunkContent);

              const subChunks = await this.splitDocumentIntoChunks(
                oversizedChunkContent,
                startLine - 1,
                true,
                totalLinesInOversizedChunk
              );
              strategy.subChunks = [];
              strategy.subChunks.push(...subChunks!);
            } else {
              console.log(
                `Chunk ${i + 1} is within size limits (${chunkSize} lines)`
              );

              strategy.chunkData = finalData;
            }
          }
        }

        if (!validated) {
          retryCount++;
          console.warn(
            `Validation attempt failed, retrying... (${retryCount})`
          );
        }

        const aggregateChunkData = (
          chunks: LlmDocumentChunksStrategy[]
        ): string => {
          return chunks.reduce((acc, chunk) => {
            const chunkData = chunk.chunkData || "";
            const subChunkData = chunk.subChunks
              ? aggregateChunkData(chunk.subChunks)
              : "";
            return acc + chunkData + subChunkData;
          }, "");
        };

        function normalizeLineBreaks(text: string): string {
          return text.replace(/\n/g, "");
        }

        // Existing validation logic...
        if (validated && lastChunkingStrategyJson) {
          const aggregatedChunkData = aggregateChunkData(
            lastChunkingStrategyJson
          );
          // Normalize both the original and aggregated data for comparison
          const normalizedAggregatedData =
            normalizeLineBreaks(aggregatedChunkData);
          const normalizedOriginalData = normalizeLineBreaks(data);

          if (normalizedAggregatedData !== normalizedOriginalData) {
            const diff = this.generateDiff(
              normalizedAggregatedData,
              normalizedOriginalData
            );
            console.error(`Diff: ${diff}`);
            console.error(
              `Validation failed: Normalized chunk data does not match the normalized original data. ${normalizedAggregatedData.length} !== ${normalizedOriginalData.length}`
            );
            validated = false;
          } else {
            console.log(
              "Validation passed: Normalized chunk data matches the normalized original data."
            );
          }
        }
      } catch (e) {
        console.error(e);
        retryCount++;
      }
    }

    console.log(JSON.stringify(lastChunkingStrategyJson, null, 2));

    // Wait for 10 minutes to debug the data above
    if (!isSubChunk) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    return lastChunkingStrategyJson;
  }
}
