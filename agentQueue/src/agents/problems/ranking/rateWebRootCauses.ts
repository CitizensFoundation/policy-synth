import { BaseProcessor } from "../../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";

export class RateWebRootCausesProcessor extends BaseProcessor {
  rootCauseWebPageVectorStore = new RootCauseWebPageVectorStore();
  simplifyRootCauseType(rootCauseType: string) {
    return rootCauseType.replace(/allPossible/g, "").replace(/IdentifiedInTextContext/g, "");
  }
  async renderProblemPrompt(
    rawWebData: PSRootCauseRawWebPageData,
    rootCausesToRank: string[],
    rootCauseType: keyof PSRootCauseRawWebPageData,
  ) {
    return [
      new SystemChatMessage(`
        You are an expert in rating root causes for a problem statement on multiple attributes.

        Instructions:
        1. Rate how well the root cause does with a score from 0-100, on the score attributes provided in the JSON format below.

        Always output your ratings in the following JSON format:
        {
          rootCauseRelevanceToProblemStatementScore,
          rootCauseRelevanceToTypeScore,
          rootCauseConfidenceScore,
          rootCauseQualityScore
        }

       Let's think step by step.`),
      new HumanChatMessage(`
        ${this.renderProblemStatement()}

        Root Cause type:
        ${this.simplifyRootCauseType(rootCauseType)}

        Root Cause Source URL:
        ${rawWebData.url}

        Root Causes to Rate:
        ${JSON.stringify(rootCausesToRank.slice(0, IEngineConstants.maxRootCausesToUseForRatingRootCauses), null, 2)}

        Your ratings in JSON format:
       `),
    ];
  }
  async rateWebRootCauses() {
    this.logger.info("Rating all web root causes");
    try {
      for (const rootCauseType of IEngineConstants.rootCauseFieldTypes) {
        let offset = 0;
        const limit = 100;
        const searchType = IEngineConstants.simplifyEvidenceType(rootCauseType);
        while (true) {
          const results = await this.rootCauseWebPageVectorStore.getWebPagesForProcessing(
            this.memory.groupId,
            searchType,
            limit,
            offset,
          );
          this.logger.debug(`Got ${results.data.Get["RootCauseWebPage"].length} WebPage results from Weaviate`);
          if (results.data.Get["RootCauseWebPage"].length === 0) {
            this.logger.info("Exiting");
            break;
          }
          let pageCounter = 0;
          for (const retrievedObject of results.data.Get["RootCauseWebPage"]) {
            const webPage = retrievedObject as PSRootCauseRawWebPageData;
            const id = webPage._additional!.id!;
            const fieldKey = rootCauseType as keyof PSRootCauseRawWebPageData;
            if (webPage[fieldKey] && Array.isArray(webPage[fieldKey]) && (webPage[fieldKey] as string[]).length > 0) {
              const rootCausesToRank = webPage[fieldKey] as string[];
              let ratedRootCauses = await this.callLLM(
                "rate-web-root-causes",
                IEngineConstants.rateWebRootCausesModel,
                await this.renderProblemPrompt(webPage, rootCausesToRank, fieldKey),
              );
              await this.rootCauseWebPageVectorStore.updateScores(id, ratedRootCauses, true);
              this.logger.debug(`${id} - Evident ratings (${rootCauseType}):\n${JSON.stringify(ratedRootCauses, null, 2)}`);
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
    this.logger.info("Rate web root causes Processor");
    super.process();
    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.rateWebRootCausesModel.temperature,
      maxTokens: IEngineConstants.rateWebRootCausesModel.maxOutputTokens,
      modelName: IEngineConstants.rateWebRootCausesModel.name,
      verbose: IEngineConstants.rateWebRootCausesModel.verbose,
    });
    try {
      await this.rateWebRootCauses();
      this.logger.debug("Finished rating all web root causes");
    } catch (error: any) {
      this.logger.error(error.stack || error);
      throw error;
    }
  }
}
