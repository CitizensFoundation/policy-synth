import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PsConstants } from "../../../constants.js";
import { BasePairwiseRankingsProcessor } from "../../../base/basePairwiseRanking.js";
export class RankEntitiesProcessor extends BasePairwiseRankingsProcessor {
    async voteOnPromptPair(subProblemIndex, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[subProblemIndex][itemOneIndex];
        const itemTwo = this.allItems[subProblemIndex][itemTwoIndex];
        let itemOneTitle = itemOne.name;
        let itemOneEffects = this.renderEntityPosNegReasons(itemOne);
        let itemTwoTitle = itemTwo.name;
        let itemTwoEffects = this.renderEntityPosNegReasons(itemTwo);
        const messages = [
            new SystemMessage(`
        You are an AI expert specializing in analyzing complex problem statements, sub-problems, and ranking affected entities.

        Instructions:

        1. You will be provided with a problem statement followed by a sub-problem.
        2. Two entities affected by the sub-problem will be given, labelled as "Entity One" and "Entity Two".
        3. Analyze and compare the entities, and then decide which one is more significantly impacted.
        4. Consider both positive and negative impacts, if available, while ranking.
        5. Output your decision as either "One", "Two" or "Neither". An explanation is not required.
        6. Let's think step by step.`),
            new HumanMessage(`
         ${this.renderProblemStatement()}

         ${this.renderSubProblem(subProblemIndex)}

         Entities for Ranking:

         Entity One:
         ${itemOneTitle}
         ${itemOneEffects}

         Entity Two:
         ${itemTwoTitle}
         ${itemTwoEffects}

         The More Affected Entity Is:
       `),
        ];
        return await this.getResultsFromLLM(subProblemIndex, "rank-entities", PsConstants.entitiesRankingsModel, messages, itemOneIndex, itemTwoIndex);
    }
    async process() {
        this.logger.info("Rank Entities Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: PsConstants.entitiesRankingsModel.temperature,
            maxTokens: PsConstants.entitiesRankingsModel.maxOutputTokens,
            modelName: PsConstants.entitiesRankingsModel.name,
            verbose: PsConstants.entitiesRankingsModel.verbose,
        });
        const subProblemsLimit = Math.min(this.memory.subProblems.length, PsConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const filteredEntities = this.memory.subProblems[subProblemIndex].entities.filter((entity) => {
                return ((entity.positiveEffects && entity.positiveEffects.length > 0) ||
                    (entity.negativeEffects && entity.negativeEffects.length > 0));
            });
            this.setupRankingPrompts(subProblemIndex, filteredEntities);
            await this.performPairwiseRanking(subProblemIndex);
            this.memory.subProblems[subProblemIndex].entities =
                this.getOrderedListOfItems(subProblemIndex, true);
            await this.saveMemory();
        });
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished ranking entities for all subproblems");
    }
}
//# sourceMappingURL=rankEntities.js.map