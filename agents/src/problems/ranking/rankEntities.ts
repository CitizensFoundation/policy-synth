import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { IEngineConstants } from "../../constants.js";
import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";

export class RankEntitiesProcessor extends BasePairwiseRankingsProcessor {
  async voteOnPromptPair(
    subProblemIndex: number,
    promptPair: number[]
  ): Promise<IEnginePairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![subProblemIndex]![itemOneIndex] as IEngineAffectedEntity;
    const itemTwo = this.allItems![subProblemIndex]![itemTwoIndex] as IEngineAffectedEntity;

    let itemOneTitle = itemOne.name;
    let itemOneEffects = this.renderEntityPosNegReasons(itemOne);

    let itemTwoTitle = itemTwo.name;
    let itemTwoEffects = this.renderEntityPosNegReasons(itemTwo);

    const messages = [
      new SystemMessage(
        `
        You are an AI expert specializing in analyzing complex problem statements, sub-problems, and ranking affected entities.

        Instructions:

        1. You will be provided with a problem statement followed by a sub-problem.
        2. Two entities affected by the sub-problem will be given, labelled as "Entity One" and "Entity Two".
        3. Analyze and compare the entities, and then decide which one is more significantly impacted.
        4. Consider both positive and negative impacts, if available, while ranking.
        5. Output your decision as either "One", "Two" or "Neither". An explanation is not required.
        6. Let's think step by step.`
      ),
      new HumanMessage(
        `
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
       `
      ),
    ];


    return await this.getResultsFromLLM(
      subProblemIndex,
      "rank-entities",
      IEngineConstants.entitiesRankingsModel,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  async process() {
    this.logger.info("Rank Entities Processor");
    super.process();

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.entitiesRankingsModel.temperature,
      maxTokens: IEngineConstants.entitiesRankingsModel.maxOutputTokens,
      modelName: IEngineConstants.entitiesRankingsModel.name,
      verbose: IEngineConstants.entitiesRankingsModel.verbose,
    });

    const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {

        const filteredEntities = this.memory.subProblems[subProblemIndex].entities.filter(
          (entity) => {
            return (
              (entity.positiveEffects && entity.positiveEffects.length > 0) ||
              (entity.negativeEffects && entity.negativeEffects.length > 0)
            );
          }
        );

        this.setupRankingPrompts(subProblemIndex, filteredEntities);
        await this.performPairwiseRanking(subProblemIndex);

        this.memory.subProblems[subProblemIndex].entities =
          this.getOrderedListOfItems(subProblemIndex, true) as IEngineAffectedEntity[];

        await this.saveMemory();
      }
    );

    await Promise.all(subProblemsPromises);
    this.logger.info("Finished ranking entities for all subproblems");
  }
}
