import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
export declare class PsEngineerWebContentRanker extends PairwiseRankingAgent {
    instructions: string | undefined;
    memory: PsEngineerMemoryData;
    defaultModelSize: PsAiModelSize;
    defaultModelType: PsAiModelType;
    updatePrefix: string;
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress?: number, endProgress?: number);
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    rankWebContent(queriesToRank: string[], instructions: string, maxPrompts?: number): Promise<string[]>;
}
//# sourceMappingURL=webPageContentRanker.d.ts.map