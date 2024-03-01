import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export class IngestionSplitAgent extends BaseIngestionAgent {
    maxSplitRetries = 15;
    minChunkCharacterLength = 50;
    maxChunkLinesLength = 90;
    strategySystemMessage = new SystemMessage(`You are an expert document split strategy generator.

Instructions:
- Your job is to analyze the text document and outline a strategy how best to split this document up into chapters.
- The contents should be split into chapters that cover the same topic, split longer chapters that cover the same topic into subChapters.
- If there are case studies those should always be whole chapters or a series of subChapters - we want to capture all case studies as top level items.
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
    strategyUserMessage = (data) => new HumanMessage(`Document to analyze and devise a split strategy for:
<DOCUMENT_FOR_SPLIT_STRATEGY>
    ${data}
</DOCUMENT_FOR_SPLIT_STRATEGY>

YOUR THOUGHTFUL STRATEGY:
`);
    strategyWithReviewUserMessage = (data, reviewComments) => new HumanMessage(`Document to analyze and devise a split strategy for:
  <DOCUMENT_FOR_SPLIT_STRATEGY>
    ${data}
  </DOCUMENT_FOR_SPLIT_STRATEGY>

  This is your second attempt to devise a strategy, here are the reviewers comments on the last attempt:
  <REVIEW_FOR_LAST_ATTEMPT>
    ${reviewComments}
  </REVIEW_FOR_LAST_ATTEMPT>

  YOUR IMPROVED STRATEGY:
  `);
    reviewStrategySystemMessage = new SystemMessage(`You are an expert document split strategy evaluator.

Instructions:
- Your job is to evaluate a split strategy for a document.
- The contents should be split into chapters that cover the same topic so each chapter can be understood as a whole.
- The output should not be the actual contents only the strategy on how to split it up.
- If there are case studies those should always be whole chapters or a series of subChapters, under any chapter.
- The start of the document should always be included.
- Make sure line numbers and connected chapters are correct.

Output:
- If the strategy is good output only and with no explanation: PASSES
- If you have comments write them out and then output: FAILS
`);
    reviewStrategyUserMessage = (data, splitStrategy) => new HumanMessage(`<DOCUMENT_FOR_SPLIT_STRATEGY>
    ${data}
</DOCUMENT_FOR_SPLIT_STRATEGY>

<SPLIT_STRATEGY_TO_EVALUATE>
  ${splitStrategy}
</SPLIT_STRATEGY_TO_EVALUATE>

YOUR EVALUATION: `);
    async fetchLlmChunkingStrategy(data, review, lastJson) {
        console.log("Generating chunking strategy...");
        const chunkingStrategy = (await this.callLLM("ingestion-agent", IEngineConstants.ingestionModel, this.getFirstMessages(this.strategySystemMessage, review && lastJson
            ? this.strategyWithReviewUserMessage(data, review)
            : this.strategyUserMessage(data)), false));
        const lastChunkingStrategyJson = this.parseJsonFromLlmResponse(chunkingStrategy);
        console.log(JSON.stringify(lastChunkingStrategyJson, null, 2));
        console.log("Reviewing chunking strategy...");
        const chunkingStrategyReview = (await this.callLLM("ingestion-agent", IEngineConstants.ingestionModel, this.getFirstMessages(this.reviewStrategySystemMessage, this.reviewStrategyUserMessage(data, chunkingStrategy)), false));
        console.log(`Chunking strategy: ${chunkingStrategyReview}`);
        return {
            chunkingStrategy,
            chunkingStrategyReview,
            lastChunkingStrategyJson,
        };
    }
    async splitDocumentIntoChunks(data, isSubChunk = false) {
        console.log(`Splitting document into chunks... (isSubChunk: ${isSubChunk})`);
        if (!isSubChunk) {
            this.resetLlmTemperature();
        }
        let retryCount = 0;
        let validated = false;
        let lastChunkingStrategyJson;
        while (!validated && retryCount < this.maxSplitRetries) {
            console.log(`Processing chunk...`);
            let dataWithLineNumber = isSubChunk
                ? data
                : data
                    .split("\n")
                    .map((line, index) => `${index + 1}: ${line}`)
                    .join("\n");
            let chunkingStrategyReview;
            try {
                const llmResults = await this.fetchLlmChunkingStrategy(dataWithLineNumber, chunkingStrategyReview, lastChunkingStrategyJson);
                chunkingStrategyReview = llmResults.chunkingStrategyReview;
                lastChunkingStrategyJson = llmResults.lastChunkingStrategyJson;
                if (lastChunkingStrategyJson &&
                    chunkingStrategyReview.trim().toUpperCase() === "PASSES" &&
                    llmResults.chunkingStrategy &&
                    llmResults.chunkingStrategy.length) {
                    console.log(`Chunking strategy validated.`);
                    validated = true;
                    for (let i = 0; i < lastChunkingStrategyJson.length; i++) {
                        console.log(`Processing chunk ${i + 1} of ${lastChunkingStrategyJson.length}`);
                        const strategy = lastChunkingStrategyJson[i];
                        const startLine = strategy.chapterStartLineNumber;
                        const endLine = i + 1 < lastChunkingStrategyJson.length
                            ? lastChunkingStrategyJson[i + 1].chapterStartLineNumber - 1
                            : dataWithLineNumber.split("\n").length;
                        const chunkSize = endLine - startLine + 1;
                        if (chunkSize > this.maxChunkLinesLength) {
                            console.log(`Chunk ${i + 1} is oversized (${chunkSize} lines)`);
                            const oversizedChunkContent = dataWithLineNumber
                                .split("\n")
                                .slice(startLine - 1, endLine)
                                .join("\n");
                            const subChunks = await this.splitDocumentIntoChunks(oversizedChunkContent, true);
                            strategy.subChunks = [];
                            strategy.subChunks.push(...subChunks);
                        }
                        else {
                            console.log(`Chunk ${i + 1} is within size limits (${chunkSize} lines)`);
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
            }
            catch (e) {
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
