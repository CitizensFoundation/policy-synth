import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
export class DeepResearchWebContentRanker extends PairwiseRankingAgent {
    instructions;
    memory;
    defaultModelSize = PsAiModelSize.Medium;
    updatePrefix = "Ranking Results";
    constructor(agent, memory, progressFunction = undefined, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
        this.progressFunction = progressFunction;
    }
    async voteOnPromptPair(index, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[index][itemOneIndex];
        const itemTwo = this.allItems[index][itemTwoIndex];
        const messages = [
            this.createSystemMessage(`<deepResearchWebContentRanker>
        You are an AI expert trained to rank items on their relevance to the user instructions.

        <OurResearchPlan>
          ${this.memory.researchPlan}
        </OurResearchPlan>

        ${this.memory.additionalGeneralContext ? this.memory.additionalGeneralContext : ""}

        Instructions:
        1. You will see instructions from the user and our deep research plan above.
        2. You will also see two items, each marked as "Item One" and "Item Two".
        3. Your task is to analyze, compare, and rank these items based on their relevance to the user instructions.
        4. Output your decision as "One", "Two" or "Neither". Output nothing else. No explanation is required.
        </deepResearchWebContentRanker>`),
            this.createHumanMessage(`User instructions: ${this.instructions}

        Items to Rank:

        Item One:
        ${JSON.stringify(itemOne)}

        Item Two:
        ${JSON.stringify(itemTwo)}

        The Most Relevant Item Is:
       `),
        ];
        return await this.getResultsFromLLM(index, messages, itemOneIndex, itemTwoIndex);
    }
    async rankWebContent(itemsToRank, instructions) {
        this.instructions = instructions;
        this.setupRankingPrompts(-1, itemsToRank, itemsToRank.length * 10, this.progressFunction, 12);
        await this.performPairwiseRanking(-1);
        await this.saveMemory();
        return this.getOrderedListOfItems(-1, true);
    }
}
//# sourceMappingURL=webPageContentRanker.js.map