import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsEcasYeaRagChunkVectorStore } from "../vectorstore/ragChunk.js";

export class PsRagVectorSearch extends PolicySynthScAgentBase {
  search = async (question: string) => {
    const vectorStore = new PsEcasYeaRagChunkVectorStore();
    const searchResults = await vectorStore.searchChunks(question);
    return searchResults;
  }
}
