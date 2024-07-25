import { ProblemsSmarterCrowdsourcingAgent } from "../../base/scBaseProblemsAgent.js";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";

export class RateWebRootCausesAgent extends ProblemsSmarterCrowdsourcingAgent {
  rootCauseWebPageVectorStore = new RootCauseWebPageVectorStore();
  simplifyRootCauseType(rootCauseType: string) {
    return rootCauseType
      .replace(/allPossible/g, "")
      .replace(/IdentifiedInTextContext/g, "");
  }
  async renderProblemPrompt(
    rawWebData: PSRootCauseRawWebPageData,
    rootCausesToRank: string[],
    rootCauseType: keyof PSRootCauseRawWebPageData
  ) {
    return [
      this.createSystemMessage(`
        You are an expert in rating websites with root causes for a problem statement, on multiple attributes.

        Instructions:
        1. Rate the website on how well on the importance of the root causes with a score from 0-100, on the score attributes provided in the JSON format below.

        Always output one set of raitings for the whole website and all the root causes given and return your ratings in the following JSON format:
        {
          rootCauseRelevanceToProblemStatementScore,
          rootCauseRelevanceToTypeScore,
          rootCauseConfidenceScore,
          rootCauseQualityScore
        }

        Never explain only output JSON.

        Let's think step by step.`),
      this.createHumanMessage(`
        ${this.renderProblemStatement()}

        Root Cause type:
        ${this.simplifyRootCauseType(rootCauseType)}

        Website Source URL:
        ${rawWebData.url}

        Root Causes found on the website:
        ${JSON.stringify(
          rootCausesToRank.slice(0, this.maxRootCausesToUseForRatingRootCauses),
          null,
          2
        )}

        Your ratings in JSON format:
       `),
    ];
  }
  async rateWebRootCauses() {
    this.logger.info("Rating all web root causes");
    try {
      for (const rootCauseType of this.rootCauseFieldTypes) {
        let offset = 0;
        const limit = 100;
        const searchType = this.simplifyRootCauseType(rootCauseType);
        while (true) {
          const results =
            await this.rootCauseWebPageVectorStore.getWebPagesForProcessing(
              this.memory.groupId,
              searchType,
              limit,
              offset
            );
          this.logger.debug(
            `Got ${results.data.Get["RootCauseWebPage"].length} WebPage results from Weaviate`
          );
          if (results.data.Get["RootCauseWebPage"].length === 0) {
            this.logger.info("Exiting");
            break;
          }
          let pageCounter = 0;
          for (const retrievedObject of results.data.Get["RootCauseWebPage"]) {
            const webPage = retrievedObject as PSRootCauseRawWebPageData;
            const id = webPage._additional!.id!;
            const fieldKey = rootCauseType as keyof PSRootCauseRawWebPageData;
            if (
              webPage[fieldKey] &&
              Array.isArray(webPage[fieldKey]) &&
              (webPage[fieldKey] as string[]).length > 0
            ) {
              const rootCausesToRank = webPage[fieldKey] as string[];
              this.logger.debug(
                `${id} - Root causes to rate (${rootCauseType}):\n${JSON.stringify(
                  rootCausesToRank,
                  null,
                  2
                )}`
              );
              let ratedRootCauses = await this.callModel(
                PsAiModelType.Text,
                PsAiModelSize.Medium,
                await this.renderProblemPrompt(
                  webPage,
                  rootCausesToRank,
                  fieldKey
                )
              );
              await this.rootCauseWebPageVectorStore.updateScores(
                id,
                ratedRootCauses,
                true
              );
              this.logger.debug(
                `${id} - Root Causes ratings (${rootCauseType}):\n${JSON.stringify(
                  ratedRootCauses,
                  null,
                  2
                )}`
              );
            }
            this.logger.info(`(+${offset + pageCounter++}) - ${id} - Updated`);
          }
          offset += limit;
        }
      }
    } catch (error: any) {
      this.logger.error(error.stack || error);
      throw error;
    }
  }
  async process() {
    this.logger.info("Rate web root causes Agent");
    super.process();

    try {
      await this.rateWebRootCauses();
      this.logger.debug("Finished rating all web root causes");
    } catch (error: any) {
      this.logger.error(error.stack || error);
      throw error;
    }
  }
}
