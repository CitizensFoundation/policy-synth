import { BaseIngestionAgent } from "./baseAgent.js";
import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export class IngestionCleanupAgent extends BaseIngestionAgent {
    maxCleanupTokenLength = 20000;
    systemMessage = new SystemMessage(`You are an expert document cleaner. Your job is to help cleanup documents coming from various sources. PDFs, etc.

Instruction:
- We own all copyright to the materials we are cleaning for our RAG chatbot.
- Please cleanup the document and only output actual contents.
- Do no output any initial acknowledgments, table of contents, page numers, or any other PDF conversion artifacts, etc.
- Remove all repeated titles as those are coming from the PDF footer pages
- Only output titles and content paragraphs.
`);
    userMessage = (data) => new HumanMessage(`Document to cleanup and output in full:
${data}
`);
    async clean(data) {
        const splitPartsForCleanup = this.splitDataForProcessing(data, this.maxCleanupTokenLength);
        let cleanedUpDataParts = [];
        for (const part of splitPartsForCleanup) {
            const cleanedPart = (await this.callLLM("ingestion-agent", IEngineConstants.ingestionModel, this.getFirstMessages(this.systemMessage, this.userMessage(part)), false));
            cleanedUpDataParts.push(cleanedPart);
        }
        return cleanedUpDataParts.join(" ");
    }
}
