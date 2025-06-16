import { PolicySynthStandaloneAgent } from "@policysynth/agents/base/agentStandalone.js";
export declare class PsRagVectorSearch extends PolicySynthStandaloneAgent {
    disableDb: boolean;
    search: (question: string) => Promise<PsEcasRagChunkGraphQlResponse>;
}
//# sourceMappingURL=vectorSearch.d.ts.map