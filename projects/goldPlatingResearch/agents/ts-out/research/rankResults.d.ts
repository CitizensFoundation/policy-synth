import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class FoundGoldPlatingRankingAgent extends PairwiseRankingAgent {
    memory: GoldPlatingMemoryData;
    defaultModelSize: PsAiModelSize;
    updatePrefix: string;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(researchItem: GoldplatingResearchItem): Promise<void>;
    private collectArticles;
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
}
//# sourceMappingURL=rankResults.d.ts.map