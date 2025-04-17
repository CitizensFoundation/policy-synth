import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class SearchResultsRanker extends PairwiseRankingAgent {
    instructions: string | undefined;
    memory: JobDescriptionMemoryData;
    defaultModelSize: PsAiModelSize;
    numberOfMatchesForEachPrompt: number;
    updatePrefix: string;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, progressFunction: Function | undefined, startProgress: number, endProgress: number, useSmallModelForSearchResultsRanking?: boolean);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankSearchResults(queriesToRank: PsSearchResultItem[], instructions: string): Promise<PsSearchResultItem[]>;
}
//# sourceMappingURL=searchResultsRanker.d.ts.map