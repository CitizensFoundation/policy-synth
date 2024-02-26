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
  - The contents should be split into sections that cover the same topic so each section can be understood as a whole.
  - Do not output the actual contents only the strategy on how to split it up.
  - Do not split into sub sections, keep one topic per section but keep the sections roughly similar length.
  - Do not talk about or suggest sub sections.
  - Do not make up section names.
  - Always include the start of the document.
  - If for example there is a short case study about one project, that should be one section not split into different sections.
  - We always want to capture full contexts

  Output:
  - Reason about the task at hand.
  - Then output a JSON array: [ {
  sectionIndex: number,
  sectionTitle: string,
  directlyConnectedSectionIndexes: string[]
  ]`);

  strategyUserMessage = (data: string) =>
    new HumanMessage(`Document to analyze and devise a split strategy for:
${data}
`);

  splitIndexSystemMessage =
    new SystemMessage(`You are an expert document splitter using a split strategy to split a document into smaller sections.

Instructions:
- You identify start, maximum first five words, of text lines as split point indexes for a larger document.
- You will receive detailed split strategy for how to identify the one line text.
- Always follow the split strategy given to you in detail.
- If the split strategy suggest 5 section, only create split indexes for 5 sections.
- The first split index is always the first line of the document.
- Output in this JSON format:
{ oneLineTextIndexesForSplittingDocument: string []
}`);

  splitIndexUserMessage = (data: string, strategy: string) =>
    new HumanMessage(`Split strategy to follow in detail:
${strategy}

The large document to find the split lines from:
${data}
Your JSON output:
`);

  async splitDocumentIntoChunks(data: string) {
    this.resetLlmTemperature();
    let retryCount = 0;
    let validated = false;
    let chunks: { [key: string]: string } | undefined;

    while (!validated && retryCount < this.maxSplitRetries) {
      console.log(`Finding Chunk Strategy ${retryCount + 1}. attempt.`);
      const chunkingStrategy = (await this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.strategySystemMessage,
          this.strategyUserMessage(data)
        ),
        false
      )) as string;

      if (chunkingStrategy) {
        console.log(`Chunking strategy: ${chunkingStrategy}`);
        try {
          chunks = await this.chunkDocument(data, chunkingStrategy);
          if (chunks) {
            validated = true;
          } else {
            console.error("No chunks found in the response.");
          }
        } catch (error) {
          console.error(`Error chunking document: ${error}`);
        }
      } else {
        console.error("No chunking strategy found.");
      }
      retryCount++;

      if (!validated) {
        console.warn(`\nValidation failed ${retryCount}\n`);
      }

      if (retryCount > 2) {
        this.randomizeLlmTemperature();
      }
    }

    if (!chunks) {
      throw new Error("Chunking failed");
    } else {
      return chunks;
    }
  }

  async chunkDocument(data: string, strategy: string): Promise<{ [key: string]: string }> {
    if (this.getEstimateTokenLength(data) < this.minChunkTokenLength) {
      return { chunk1: data };
    } else {
      const chunkIdentifiersResponse = (await this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.splitIndexSystemMessage,
          this.splitIndexUserMessage(data, strategy)
        )
      )) as LlmDocumentChunksIdentificationReponse; // Ensure the type name is correct
      const chunkingStrings = chunkIdentifiersResponse.oneLineTextIndexesForSplittingDocument;

      console.log(`Chunking strings: ${chunkingStrings.join(',')}`);

      let chunks: { [key: string]: string } = {};
      let currentPosition = 0;
      let chunkIndex = 1;

      if (chunkingStrings && chunkingStrings.length > 1) {
        chunkingStrings.shift();
        chunkingStrings.forEach((chunkStr: string, index: number) => {
          const normalizedData = data.replace(/\s+/g, " ").toLowerCase().trim();
          const normalizedChunkStr = chunkStr.replace(/\s+/g, " ").trim().toLowerCase();

          let nextPosition = normalizedData.indexOf(normalizedChunkStr, currentPosition);
          console.log(`Next Position: ${nextPosition}, Current Position: ${currentPosition}, For: ${normalizedChunkStr}`)

          if (nextPosition !== -1 && nextPosition !== currentPosition) { // Check to prevent zero-length chunks
            const chunk = data.substring(currentPosition, nextPosition).trim();

            console.log(`Attempting Chunk ${chunkIndex}: Start=${currentPosition}, End=${nextPosition}, Length=${chunk.length}`);

            if (chunk.length < this.minChunkCharacterLength) {
              console.error(`Chunk ${chunkIndex} (Start=${currentPosition}, End=${nextPosition}) length (${chunk.length}) is less than the minimum character length.`);
              throw Error(`Chunk ${chunkIndex} length is less than the minimum character length.`);
            } else {
              chunks[`chunk${chunkIndex}`] = chunk;
              currentPosition = nextPosition + chunkStr.length; // Ensure we move past the current chunk string
              chunkIndex++;
            }
          } else {
            console.error(`Chunking string:'\n${chunkStr}\n' not found in the document or results in zero-length chunk.\n${data}\n\n`);
            throw Error(`Chunking string not found in the document or results in zero-length chunk.`);
          }
        });

        // Handle the last chunk from the last found position to the end of the document
        if (currentPosition < data.length) {
          const lastChunk = data.substring(currentPosition).trim();
          if (lastChunk.length >= this.minChunkCharacterLength) {
            console.log(`Chunk ${chunkIndex} (Final Chunk) Length: ${lastChunk.length}`);
            chunks[`chunk${chunkIndex}`] = lastChunk;
          } else {
            console.error(`Final chunk length (${lastChunk.length}) is less than the minimum character length, merging with previous.`);
            // Optional: Merge this small final chunk with the previous chunk if it's too small
          }
        }
      } else {
        throw Error("No chunking strings found in the response.");
      }

      return chunks;
    }
  }


}
