import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class SearchQueriesRanker extends PairwiseRankingAgent {
    instructions: string | undefined;
    memory: JobDescriptionMemoryData;
    defaultModelSize: PsAiModelSize;
    updatePrefix: string;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, progressFunction: Function | undefined, startProgress: number, endProgress: number);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankSearchQueries(queriesToRank: string[], instructions: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=searchQueriesRanker.d.ts.map