import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
export declare class DeepResearchWebContentRanker extends PairwiseRankingAgent {
    instructions: string | undefined;
    memory: JobDescriptionMemoryData;
    defaultModelSize: PsAiModelSize;
    updatePrefix: string;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, progressFunction: Function | undefined, startProgress: number, endProgress: number);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankWebContent(itemsToRank: any[], instructions: string): Promise<string[]>;
}
//# sourceMappingURL=webPageContentRanker.d.ts.map