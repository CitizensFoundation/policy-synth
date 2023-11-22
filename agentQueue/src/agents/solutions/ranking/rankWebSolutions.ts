import { BaseProcessor } from "../../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";

import { IEngineConstants } from "../../../constants.js";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";

export class RankWebSolutionsProcessor extends BaseProcessor {
  webPageVectorStore = new WebPageVectorStore();

  async renderProblemPrompt(
    solutionsToRank: string[],
    subProblemIndex: number | null
  ) {
    return [
      new SystemMessage(
        `
        You are an expert in filtering and ranking solution components.

        1. Remove irrelevant and inactionable solution components.
        2. Eliminate duplicates or near duplicates.
        3. Rank solutions by importance and practicality.
        4. Always and only output a JSON string Array: [ solution ].

        Let's think step by step. Never explain your actions.`
      ),
      new HumanMessage(
        `
        ${subProblemIndex === null ? this.renderProblemStatement() : ""}

        ${
          subProblemIndex !== null
            ? this.renderSubProblem(subProblemIndex, true)
            : ""
        }

        Solution components to filter and rank:
        ${JSON.stringify(solutionsToRank, null, 2)}

        Filtered and ranked solution components as a JSON string array:
       `
      ),
    ];
  }

  async rankWebSolutions(
    subProblemIndex: number
  ) {
    let offset = 0;
    const limit = 100;

    while (true) {
      try {
        const results = await this.webPageVectorStore.getWebPagesForProcessing(
          this.memory.groupId,
          subProblemIndex,
          undefined,
          undefined,
          limit,
          offset
        );

        this.logger.debug(`Got ${results.data.Get["WebPage"].length} WebPage results from Weaviate`);

        if (results.data.Get["WebPage"].length === 0) {
          this.logger.info("Exiting");
          break;
        };

        let pageCounter = 0;
        for (const retrievedObject of results.data.Get["WebPage"]) {
          const webPage = retrievedObject as IEngineWebPageAnalysisData;
          const id = webPage._additional!.id!;

          /*this.logger.debug(
            `${id} - Solutions before ranking:
             ${JSON.stringify(
              webPage.solutionsIdentifiedInTextContext,
              null,
              2
            )}`
          );*/

          let rankedSolutions = await this.callLLM(
            "rank-web-solutions",
            IEngineConstants.rankWebSolutionsModel,
            await this.renderProblemPrompt(
              webPage.solutionsIdentifiedInTextContext,
              subProblemIndex
            )
          );

          this.logger.debug(
            `${id} - Solutions after ranking:
             ${JSON.stringify(
              rankedSolutions,
              null,
              2
            )}`
          );

          await this.webPageVectorStore.updateWebSolutions(id, rankedSolutions, true);

          this.logger.info(`${subProblemIndex} - (+${offset + (pageCounter++)}) - ${id} - Updated`);

          if (false) {
            const testWebPageBack = await this.webPageVectorStore.getWebPage(id);
            if (testWebPageBack) {
              this.logger.debug(
                `${id} - Solutions Test Get ${JSON.stringify(
                  testWebPageBack.solutionsIdentifiedInTextContext,
                  null,
                  2
                )}`
              );
            } else {
              this.logger.error(`${id} - Solutions Test Get Failed`)
            }
          }
        }

        offset+=limit;
      } catch (error: any) {
        this.logger.error(error.stack  || error);
        throw error;
      }
    }
  }

  async process() {
    this.logger.info("Rank web solutions Processor");
    super.process();

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.rankWebSolutionsModel.temperature,
      maxTokens: IEngineConstants.rankWebSolutionsModel.maxOutputTokens,
      modelName: IEngineConstants.rankWebSolutionsModel.name,
      verbose: IEngineConstants.rankWebSolutionsModel.verbose,
    });

    //TODO: Get working after null check is working in the weaviate index
    //this.logger.info("Ranking problem statement solutions");
    //await this.rankWebSolutions(null, null);

    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      IEngineConstants.maxSubProblems
    );

    const skipSubProblemsIndexes: number[] = [];

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        this.logger.info(`Ranking sub problem ${subProblemIndex}`);

        if (!skipSubProblemsIndexes.includes(subProblemIndex)) {
          try {
            await this.rankWebSolutions(subProblemIndex);
            this.logger.debug(`Finished ranking sub problem ${subProblemIndex}`)
          } catch (error: any) {
            this.logger.error(error.stack || error);
            throw error;
          }
        } else {
          this.logger.info(`Skipping sub problem ${subProblemIndex}`);
        }

        //TODO: Get working after null check is working in the weaviate index
        /*for (
          let e = 0;
          e <
          Math.min(
            this.memory.subProblems[subProblemIndex].entities.length,
            IEngineConstants.maxTopEntitiesToSearch
          );
          e++
        ) {
          this.logger.info(
            `Ranking entity ${e + 1} for sub problem ${subProblemIndex}`
          );
          await this.rankWebSolutions(subProblemIndex, e);
        }*/
      }
    );

    await Promise.all(subProblemsPromises);
    this.logger.info("Finished ranking all web solutions");
  }
}
