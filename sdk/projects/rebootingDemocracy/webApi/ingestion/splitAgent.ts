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
  maxChunkLinesLength = 90;

  strategySystemMessage =
    new SystemMessage(`You are an expert document split strategy generator.

Instructions:
- Your job is to analyze the text document and outline a strategy how best to split this document up into chapters.
- The contents should be split into chapters that cover the same topic, split longer chapters that cover the same topic into subChapters.
- If there are individual case studies or similar those should be different chapters.
- Always include the start of the document at chapterIndex 1.
- Do not output the actual contents only the strategy on how to split it up.
- Use importantContextChapterIndexes for chapters that could be relevant to the current chapter when we will load this chapter for our retrieval augmented generation (RAG) solution. But don't use this for everything only the most important context connections.

Output:
- Reason about the task at hand, let's think step by step.
- Then output a JSON array:
  json\`\`\`
  [
    {
      chapterIndex: number;
      chapterType: 'full' | 'subChapter;
      chapterTitle: string;
      chapterStartLineNumber: number;
      importantContextChapterIndexes: number[];
    }
  ]
  \`\`\`
`);

  strategyUserMessage = (data: string) =>
    new HumanMessage(`Document to analyze and devise a split strategy for:
${data}

Your strategy:
`);

  strategyWithReviewUserMessage = (data: string, reviewComments: string) =>
    new HumanMessage(`Document to analyze and devise a split strategy for:
  ${data}

  This is your second attempt to devise a strategy, here are the reviewers comments on the last attempt:
  ${reviewComments}

  Your improved strategy:
  `);

  reviewStrategySystemMessage =
    new SystemMessage(`You are an expert document split strategy evaluator.

Instructions:
- Your job is to evaluate a split strategy for a document.
- The contents should be split into chapters that cover the same topic so each chapter can be understood as a whole.
- The output should be the actual contents only the strategy on how to split it up.
- The start of the document should always be included.
- Make sure line numbers and connected chapters are correct.
- We always want to capture full contexts for each chunk so the chapters should not be too short.

Output:
- If the strategy is good output only and with no explanation: PASSES
- If you have comments write them out and then output: FAILS
`);

  reviewStrategyUserMessage = (data: string, splitStrategy: string) =>
    new HumanMessage(`Document:
  ${data}

  Split strategy to evaluate for correctness:
  ${splitStrategy}

  Your evaluation: `);

  async fetchLlmChunkingStrategy(
    data: string,
    review: string | undefined,
    lastJson: LlmDocumentChunksStrategy[] | undefined
  ) {
    const chunkingStrategy = (await this.callLLM(
      "ingestion-agent",
      IEngineConstants.ingestionModel,
      this.getFirstMessages(
        this.strategySystemMessage,
        review && lastJson
          ? this.strategyWithReviewUserMessage(data, review)
          : this.strategyUserMessage(data)
      ),
      false
    )) as string;

    const chunkingStrategyReview = "PASSES"; /*(await this.callLLM(
      "ingestion-agent",
      IEngineConstants.ingestionModel,
      this.getFirstMessages(
        this.reviewStrategySystemMessage,
        this.reviewStrategyUserMessage(data, chunkingStrategy)
      )
    )) as string;*/

    const lastChunkingStrategyJson = this.parseJsonFromLlmResponse(
      chunkingStrategy
    ) as LlmDocumentChunksStrategy[];

    console.log(JSON.stringify(lastChunkingStrategyJson, null, 2));

    return {
      chunkingStrategy,
      chunkingStrategyReview,
      lastChunkingStrategyJson,
    };
  }

  async splitDocumentIntoChunks(data: string, isSubChunk: boolean = false) {
    console.log(`Splitting document into chunks... (isSubChunk: ${isSubChunk})`)
    if (!isSubChunk) {
      this.resetLlmTemperature();
    }
    let retryCount = 0;
    let validated = true;

    let chunksToProcess = [
      { data: data, startLine: 1, subChunks: [] as Chunk[] },
    ] as Chunk[];
    let processedChunks = [] as Chunk[];

    while (chunksToProcess.length > 0 && retryCount < this.maxSplitRetries) {
      console.log(`Chunks to process: ${chunksToProcess.length}`);
      let currentChunk = chunksToProcess.shift()!;
      if (!currentChunk) continue;
      let dataWithLineNumber = currentChunk.data
        .split("\n")
        .map((line, index) => `${currentChunk.startLine + index}: ${line}`)
        .join("\n");

      console.log(
        `Finding Chunk Strategy for lines starting at ${currentChunk.startLine}.`
      );
      let chunkingStrategyReview: string | undefined;
      let lastChunkingStrategyJson: LlmDocumentChunksStrategy[] | undefined;

      try {
        const llmResults = await this.fetchLlmChunkingStrategy(
          dataWithLineNumber,
          chunkingStrategyReview,
          lastChunkingStrategyJson
        );
        chunkingStrategyReview = llmResults.chunkingStrategyReview;
        lastChunkingStrategyJson = llmResults.lastChunkingStrategyJson;

        if (
          lastChunkingStrategyJson &&
          chunkingStrategyReview.trim().toUpperCase() === "PASSES" &&
          llmResults.chunkingStrategy &&
          llmResults.chunkingStrategy.length
        ) {
          currentChunk.subChunks = [];
          console.log(`Chunking strategy validated.`);

          for (let i = 0; i < lastChunkingStrategyJson.length; i++) {
            console.log(`Processing chunk ${i + 1} of ${lastChunkingStrategyJson.length}`);
            const strategy = lastChunkingStrategyJson[i];
            const startLine = strategy.chapterStartLineNumber;
            const endLine =
              i + 1 < lastChunkingStrategyJson.length
                ? lastChunkingStrategyJson[i + 1].chapterStartLineNumber - 1
                : dataWithLineNumber.split("\n").length;
            const chunkSize = endLine - startLine + 1;

            if (chunkSize > this.maxChunkLinesLength) {
              console.log(`Chunk ${i + 1} is oversized (${chunkSize} lines)`);
              const oversizedChunkContent = dataWithLineNumber
                .split("\n")
                .slice(startLine - 1, endLine)
                .join("\n");
              // Recursively split oversized chunk
              const subChunks = await this.splitDocumentIntoChunks(
                oversizedChunkContent,
                true
              );
              currentChunk.subChunks.push(...subChunks!); // Add resulting subChunks to the current chunk
            } else {
              console.log(`Chunk ${i + 1} is within size limits (${chunkSize} lines)`)
              currentChunk.subChunks.push({
                data: currentChunk.data
                  .split("\n")
                  .slice(startLine - 1, endLine)
                  .join("\n"),
                startLine: startLine,
                actualStartLine: startLine,
                actualEndLine: endLine,
                subChunks: [], // Initialize as empty; no further split required
              });
            }
          }

          if (!isSubChunk) {
            processedChunks.push(currentChunk); // For top-level chunks, add to processedChunks
          }
        }

        if (!validated) {
          console.warn(`Validation attempt failed, retrying...`);
          chunksToProcess.push(currentChunk); // Re-attempt this chunk
          retryCount++;
        }
      } catch (e) {
        console.error(e);
        retryCount++;
      }
    }

    if (isSubChunk) {
      return processedChunks;
    }

    if (processedChunks.length === 0) {
      console.error("Chunking failed after multiple attempts: "+retryCount);
    }

    processedChunks.sort((a, b) => a.actualStartLine! - b.actualStartLine!);

    console.log(JSON.stringify(processedChunks, null, 2));

    // Wait for 10 minutes
    await new Promise((resolve) => setTimeout(resolve, 600000));

    return processedChunks as unknown as PsIngestionChunkData[];
  }
}
