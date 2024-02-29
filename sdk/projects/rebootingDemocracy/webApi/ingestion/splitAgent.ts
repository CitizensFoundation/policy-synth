import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { BaseIngestionAgent } from "./baseAgent.js";

export class IngestionSplitAgent extends BaseIngestionAgent {
  maxSplitRetries = 15;
  minChunkCharacterLength = 50;

  strategySystemMessage =
    new SystemMessage(`You are an expert document split strategy generator.

Instructions:
- Your job is to analyze the text document and outline a strategy how best to split this document up into smaller chapters based on it's contents.
- The contents should be split into chapters that cover the same topic so each chapter can be understood as a whole.
- Do not output the actual contents only the strategy on how to split it up.
- If the chapters are long split them into subChapters
- Always include the start of the document.
- Use importantContextChapterIndexes for chapter that could be relevant to the current chapter when we will load this chapter for our retrieval augmented generation (RAG) solution. But don't use this for everything only the most important context connections.

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

  strategyWithReviewUserMessage = (
    data: string,
    reviewComments: string
  ) =>
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

  async splitDocumentIntoChunks(data: string) {
    this.resetLlmTemperature();
    let retryCount = 0;
    let validated = false;

    const dataWithLineNumber = data
      .split("\n")
      .map((line, index) => `${index + 1}: ${line}`)
      .join("\n");

    let chunkingStrategyReview: string | undefined;
    let lastChunkingStrategyJson:
      | LlmDocumentChunksStrategy[]
      | undefined;

    while (!validated && retryCount < this.maxSplitRetries) {
      console.log(`Finding Chunk Strategy ${retryCount + 1}. attempt.`);
      try {
        const chunkingStrategy = (await this.callLLM(
          "ingestion-agent",
          IEngineConstants.ingestionModel,
          this.getFirstMessages(
            this.strategySystemMessage,
            chunkingStrategyReview && lastChunkingStrategyJson
              ? this.strategyWithReviewUserMessage(
                  dataWithLineNumber,
                  chunkingStrategyReview
                )
              : this.strategyUserMessage(dataWithLineNumber)
          ),
          false
        )) as string;

        chunkingStrategyReview = (await this.callLLM(
          "ingestion-agent",
          IEngineConstants.ingestionModel,
          this.getFirstMessages(
            this.reviewStrategySystemMessage,
            this.reviewStrategyUserMessage(dataWithLineNumber, chunkingStrategy)
          ),
          false
        )) as string;

        lastChunkingStrategyJson = this.parseJsonFromLlmResponse(
          chunkingStrategy
        ) as LlmDocumentChunksStrategy[];

        if (
          lastChunkingStrategyJson &&
          chunkingStrategyReview === "PASSES" &&
          chunkingStrategy &&
          chunkingStrategy.length
        ) {
          console.log(`Chunking strategy: ${JSON.stringify(chunkingStrategy)}`);
          const lines = data.split("\n");

          console.log(JSON.stringify(lastChunkingStrategyJson, null, 2));
          lastChunkingStrategyJson.forEach((strategy, index) => {
            const startLine = strategy.chapterStartLineNumber - 1;
            const endLine =
              index + 1 < lastChunkingStrategyJson!.length
                ? lastChunkingStrategyJson![index + 1].chapterStartLineNumber -
                  1
                : lines.length;
            const chunkContent = lines.slice(startLine, endLine).join("\n");
            strategy.chunkData = chunkContent;
          });

          validated = true;
        } else {
          console.error("No chunking strategy found.");
          if (chunkingStrategyReview !== "FAILS") {
            console.error(
              "Chunking strategy review failed: " + chunkingStrategyReview
            );
          }
        }

        retryCount++;

        if (!validated) {
          console.warn(`\nValidation failed ${retryCount}\n`);
        }

        if (retryCount > 5) {
          this.randomizeLlmTemperature();
        }
      } catch (error) {
        console.error(`Error chunking document: ${error}`);
        retryCount++;
      }
    }

    if (!lastChunkingStrategyJson) {
      throw new Error("Chunking failed");
    } else {
      return lastChunkingStrategyJson;
    }
  }
}
