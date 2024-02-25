import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "./baseAgent.js";
export class IngestionSplitAgent extends BaseIngestionAgent {
    strategySystemMessage = new SystemMessage(`You are an expert document split strategy generator.

  Instructions:
  - Your job is to analyze the text document and outline a strategy how best to split this document up into smaller sections based on it's contents.
  - The contents should be split into sections that cover the same topic.
  - Do not output the actual contents only the strategy on how to split it up.
  - Do not split into sub sections, keep one topic per section.
  - Do not talk about or suggest sub sections.
  - Do not make up section names.
  - If for example there is a short case study about one project, that should be one section not split into different sections.
  - We always want to capture full contexts

  Output:
  - Reason about the task at hand.
  - Then output a JSON array: [ {
  sectionIndex: number,
  sectionTitle: string,
  directlyConnectedSectionIndexes: string[]
  ]`);
    strategyUserMessage = (data) => new HumanMessage(`Document to analyze and devise a split strategy for:
${data}
`);
    splitIndexSystemMessage = new SystemMessage(`You are an expert document splitter.

Instructions:
- You identify start of text lines as split points for a large document.
- You will receive detailed split strategy for how to identify the one line text indexes that I will later use to split up the document with.
- Your splits should never results in very small chunks.
- Always follow the split strategy given to you in detail.
- If the split strategy suggest 5 section, only create split indexes for 5 sections.
- Only split the document by top level topics not sub-topics or sub section.
- Output in this JSON format:
{ oneLineTextIndexesForSplittingDocument: string []
}`);
    splitIndexUserMessage = (data, strategy) => new HumanMessage(`Split strategy to follow in detail:
${strategy}

THE DOCUMENT DATA TO FIND THE SPLIT LINES FROM:
${data}
Your JSON output:
`);
    async splitDocumentIntoChunks(data) {
        const chunkingStrategy = (await this.callLLM("ingestion-agent", IEngineConstants.ingestionModel, this.getFirstMessages(this.strategySystemMessage, this.strategyUserMessage(data)), false));
        if (chunkingStrategy) {
            return await this.chunkDocument(data, chunkingStrategy);
        }
        else {
            throw new Error("No chunking strategy found.");
        }
    }
    async chunkDocument(data, strategy) {
        if (this.getEstimateTokenLength(data) < this.minChunkTokenLength) {
            return { chunk1: data };
        }
        else {
            const chunkIdentifiersResponse = (await this.callLLM("ingestion-agent", IEngineConstants.ingestionModel, this.getFirstMessages(this.splitIndexSystemMessage, this.splitIndexUserMessage(data, strategy))));
            const chunkingStrings = chunkIdentifiersResponse.oneLineTextIndexesForSplittingDocument;
            let chunks = {};
            let currentPosition = 0;
            let chunkIndex = 1;
            // Iterate over each chunking string to split the document
            if (chunkingStrings) {
                chunkingStrings.forEach((chunkStr, index) => {
                    const nextPosition = data.indexOf(chunkStr, currentPosition);
                    if (nextPosition !== -1) {
                        // Extract chunk from currentPosition to nextPosition
                        const chunk = data.substring(currentPosition, nextPosition);
                        console.log(`Chunk ${chunkIndex} length: ${chunk.length}`);
                        chunks[`chunk${chunkIndex}`] = chunk;
                        currentPosition = nextPosition + chunkStr.length; // Update currentPosition to the end of the current chunkStr
                        chunkIndex++;
                    }
                    else {
                        // If chunkStr not found, log an error but continue
                        console.error(`Chunking string '${chunkStr}' not found in the document.`);
                    }
                });
            }
            else {
                throw Error("No chunking strings found in the response.");
            }
            // Add the last chunk from the last found position to the end of the document
            if (currentPosition < data.length) {
                const lastChunk = data.substring(currentPosition);
                console.log(`Chunk ${chunkIndex} length: ${lastChunk.length}`);
                chunks[`chunk${chunkIndex}`] = lastChunk;
            }
            return chunks;
        }
    }
}
