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
- If there are case studies those should always be whole chapters or a series of subChapters, under any chapter.
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
- The output should not be the actual contents only the strategy on how to split it up.
- If there are case studies those should always be whole chapters or a series of subChapters - we want to capture all case studies as top level items.
- The start of the document should always be included.
- Make sure line numbers and connected chapters are correct.

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

    const chunkingStrategyReview = (await this.callLLM(
      "ingestion-agent",
      IEngineConstants.ingestionModel,
      this.getFirstMessages(
        this.reviewStrategySystemMessage,
        this.reviewStrategyUserMessage(data, chunkingStrategy)
      ),
      false
    )) as string;

    const lastChunkingStrategyJson = this.parseJsonFromLlmResponse(
      chunkingStrategy
    ) as LlmDocumentChunksStrategy[];

    console.log(JSON.stringify(lastChunkingStrategyJson, null, 2));

    console.log(`Chunking strategy: ${chunkingStrategyReview}`);

    return {
      chunkingStrategy,
      chunkingStrategyReview,
      lastChunkingStrategyJson,
    };
  }

  async splitDocumentIntoChunks(data: string, isSubChunk: boolean = false) {
    console.log(
      `Splitting document into chunks... (isSubChunk: ${isSubChunk})`
    );
    if (!isSubChunk) {
      this.resetLlmTemperature();
    }
    let retryCount = 0;
    let validated = false;
    let lastChunkingStrategyJson: LlmDocumentChunksStrategy[] | undefined;

    while (!validated && retryCount < this.maxSplitRetries) {
      console.log(`Processing chunk...`);
      let dataWithLineNumber = isSubChunk
        ? data
        : data
            .split("\n")
            .map((line, index) => `${index+1}: ${line}`)
            .join("\n");

      let chunkingStrategyReview: string | undefined;

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
          console.log(`Chunking strategy validated.`);
          validated = true;

          for (let i = 0; i < lastChunkingStrategyJson.length; i++) {
            console.log(
              `Processing chunk ${i + 1} of ${lastChunkingStrategyJson.length}`
            );
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

              const subChunks = await this.splitDocumentIntoChunks(
                oversizedChunkContent,
                true
              );
              strategy.subChunks = [];
              strategy.subChunks.push(...subChunks!);
            } else {
              console.log(
                `Chunk ${i + 1} is within size limits (${chunkSize} lines)`
              );
              const finalData = data
                .split("\n")
                .slice(startLine - 1, endLine)
                .join("\n");
            }
          }
        }

        if (!validated) {
          console.warn(`Validation attempt failed, retrying... (${retryCount})`);
          retryCount++;
        }
      } catch (e) {
        console.error(e);
        retryCount++;
      }
    }

    console.log(JSON.stringify(lastChunkingStrategyJson, null, 2));

    // Wait for 10 minutes to debug the data above
    if (!isSubChunk) {
      await new Promise((resolve) => setTimeout(resolve, 600000));
    }

    return lastChunkingStrategyJson;
  }
}
