import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsEcasYeaRagChunkVectorStore } from "../vectorstore/ragChunk.js";
export class PsRagVectorSearch extends PolicySynthAgentBase {
    search = async (question) => {
        const vectorStore = new PsEcasYeaRagChunkVectorStore();
        const searchResults = await vectorStore.searchChunks(question);
        return searchResults;
    };
}
//# sourceMappingURL=vectorSearch.js.map