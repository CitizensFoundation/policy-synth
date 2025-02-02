import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
export class PsEngineerWebContentRanker extends PairwiseRankingAgent {
    instructions;
    memory;
    defaultModelSize = PsAiModelSize.Medium;
    updatePrefix = "Ranking Results";
    constructor(agent, memory, startProgress = 0, endProgress = 100) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    async voteOnPromptPair(index, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[index][itemOneIndex];
        const itemTwo = this.allItems[index][itemTwoIndex];
        const messages = [
            this.createSystemMessage(`
<psEngineerWebContentRanker>
You are an AI expert trained to rank search queries based on their relevance to the user instructions.

${this.memory.taskTitle ? `<OverallTaskTitle>
${this.memory.taskTitle}
</OverallTaskTitle>` : ""}

${this.memory.taskDescription ? `<OverallTaskDescription>
${this.memory.taskDescription}
</OverallTaskDescription>` : ""}

${this.memory.taskInstructions ? `<OverallTaskInstructions>
${this.memory.taskInstructions}
</OverallTaskInstructions>` : ""}

${this.memory.likelyRelevantNpmPackageDependencies &&
                this.memory.likelyRelevantNpmPackageDependencies.length > 0
                ? `Likely relevant npm dependencies:
${this.memory.likelyRelevantNpmPackageDependencies.join("\n")}`
                : ""}

Instructions:
1. You will see user instructions and two content items.
2. Analyze, compare, and rank the content items based on their relevance.
3. Output your decision as "One", "Two" or "Neither". No explanation is required.
</psEngineerWebContentRanker>
      `),
            this.createHumanMessage(`
User instructions: ${this.instructions}

Content Items to Rank:

Content Item One:
${itemOne}

Content Item Two:
${itemTwo}

The Most Relevant Content Item Is:
      `)
        ];
        // callModel is our new unified method that replaces getResultsFromLLM.
        return await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages, true);
    }
    async rankWebContent(queriesToRank, instructions, maxPrompts = 120) {
        this.instructions = instructions;
        // Set up the prompts for pairwise ranking.
        this.setupRankingPrompts(-1, queriesToRank, maxPrompts, this.progressFunction);
        await this.performPairwiseRanking(-1);
        await this.saveMemory();
        return this.getOrderedListOfItems(-1);
    }
}
//# sourceMappingURL=webPageContentRanker.js.map