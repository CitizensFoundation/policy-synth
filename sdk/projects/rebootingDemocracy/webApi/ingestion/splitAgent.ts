import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { BaseIngestionAgent } from "./baseAgent.js";

export class IngestionSplitAgent extends BaseIngestionAgent {
  maxSplitRetries = 15;
  minChunkCharacterLength = 50;

  strategySystemMessage =
    new SystemMessage(`You are an expert document split strategy generator.

Instructions:
- Your job is to analyze the text document and outline a strategy how best to split this document up into smaller sections based on it's contents.
- The contents should be split into sections that cover the same or very close connected topics so each section can be understood as a whole.
- Do not output the actual contents only the strategy on how to split it up.
- Do not split into sub sections, keep one core topic per section.
- Do not talk about or suggest sub sections.
- Do not make up section names.
- Always include the start of the document.
- If for example there is a short case study about one project, that should be one section not split into different sections.
- Use directlyConnectedSectionIndexes for sections that could be relevant to the current section in retrieval, but not just because they are next to each other in the text
- Always capture the full contexts for each chunk, so the sections should not be too short.

Output:
- Reason about the task at hand.
- Then output a JSON array:
  json\`\`\`
  [
    {
      sectionIndex: number,
      sectionTitle: string,
      sectionStartLineNumber: number,
      directlyConnectedSectionIndexes: string[]
    }
  ]
  \`\`\`
`);

  strategyUserMessage = (
    data: string,
    reviewComments: string | undefined = undefined
  ) =>
    new HumanMessage(`Document to analyze and devise a split strategy for:
${data}
${
  reviewComments
    ? `This is your second attempt to devise a strategy, here are the reviewers comments:\n${reviewComments}\n`
    : ""
}
Your strategy:
`);

  reviewStrategySystemMessage =
    new SystemMessage(`You are an expert document split strategy evaluator.

  Instructions:
  - Your job is to evalute a split strategy for a document.
  - The contents should be split into sections that cover the same topic so each section can be understood as a whole.
  - The output should be the actual contents only the strategy on how to split it up.
  - There should be no sub sections, only one topic per section but the topic be connected in the directlyConnectedSectionIndexes JSON field
  - The start of the document should always be included.
  - Make sure line numbers and connected sections are correct.
  - We always want to capture full contexts for each chunk so the sections should not be too short.

  Output:
  - If the strategy is good output only and with no explaination: PASSES
  - If you have comments write them out and then output: FAILS
  `);

  reviewStrategyUserMessage = (data: string, splitStrategy: string) =>
    new HumanMessage(`Document:
  ${data}

  Split strategy to evalute for correctness:
  ${splitStrategy}

  Your evaluation: `);

  async splitDocumentIntoChunks(data: string) {
    this.resetLlmTemperature();
    let retryCount = 0;
    let validated = false;
    let chunks: { [key: string]: string } | undefined;

    const dataWithLineNumber = data
      .split("\n")
      .map((line, index) => `${index + 1}: ${line}`)
      .join("\n");

    let chunkingStrategyReview: string | undefined;

    while (!validated && retryCount < this.maxSplitRetries) {
      console.log(`Finding Chunk Strategy ${retryCount + 1}. attempt.`);
      const chunkingStrategy = (await this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.strategySystemMessage,
          this.strategyUserMessage(dataWithLineNumber, chunkingStrategyReview)
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

      if (
        chunkingStrategyReview === "PASSES" &&
        chunkingStrategy &&
        chunkingStrategy.length
      ) {
        console.log(`Chunking strategy: ${JSON.stringify(chunkingStrategy)}`);
        try {
          // Initialize chunks object
          chunks = {};
          const lines = data.split("\n"); // Now we have an array of lines

          const jsonChunkingStrategy = this.parseJsonFromLlmResponse(
            chunkingStrategy
          ) as LlmDocumentChunksStrategyReponse[];
          console.log(JSON.stringify(jsonChunkingStrategy, null, 2));
          jsonChunkingStrategy.forEach((strategy, index) => {
            const startLine = strategy.sectionStartLineNumber - 1;
            const endLine =
              index + 1 < jsonChunkingStrategy.length
                ? jsonChunkingStrategy[index + 1].sectionStartLineNumber - 1
                : lines.length;
            const chunkContent = lines.slice(startLine, endLine).join("\n");
            chunks![strategy.sectionTitle] = chunkContent;
          });

          validated = true;
        } catch (error) {
          console.error(`Error chunking document: ${error}`);
        }
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
    }

    if (!chunks) {
      throw new Error("Chunking failed");
    } else {
      return chunks;
    }
  }
}
