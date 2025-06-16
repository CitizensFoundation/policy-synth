import { PolicySynthStandaloneAgent } from "@policysynth/agents/base/agentStandalone.js";
import { PsEcasYeaRagChunkVectorStore } from "../vectorstore/ragChunk.js";
export class PsRagVectorSearch extends PolicySynthStandaloneAgent {
    disableDb = true;
    search = async (question) => {
        const vectorStore = new PsEcasYeaRagChunkVectorStore(undefined);
        const searchResults = await vectorStore.searchChunks(question);
        return searchResults;
    };
}
//# sourceMappingURL=vectorSearch.js.map