import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { IEngineConstants } from "../../constants.js";
import { EvidenceWebPageVectorStore } from "../../vectorstore/evidenceWebPage.js";

export class RateWebEvidenceProcessor extends BaseProblemSolvingAgent {
  evidenceWebPageVectorStore = new EvidenceWebPageVectorStore();

  simplifyEvidenceType(evidenceType: string){
    return evidenceType.replace(/allPossible/g, "").replace(/IdentifiedInTextContext/g, "")
  }

  async renderProblemPrompt(
    subProblemIndex: number | null,
    policy: PSPolicy,
    rawWebData: PSEvidenceRawWebPageData,
    evidenceToRank: string[],
    evidenceType: keyof PSEvidenceRawWebPageData
  ) {
    return [
      new SystemMessage(
        `
        You are an expert in rating evidence for policy proposals on multiple attributes.

        Instructions:
        1. Rate how well the policy evidence does with a score from 0-100, on the score attributes provided in the JSON format below.

        Always output your ratings in the following JSON format:
        {
          evidenceRelevanceToPolicyProposalScore,
          evidenceRelevanceToEvidenceTypeScore,
          evidenceConfidenceScore,
          evidenceQualityScore
        }

       Let's think step by step.`
     ),
      new HumanMessage(
        `
        Problem:
        ${this.renderSubProblemSimple(subProblemIndex!)}

        Policy Proposal:
        ${policy.title}
        ${policy.description}

        Policy Evidence type:
        ${this.simplifyEvidenceType(evidenceType)}

        Policy Evidence Source Summary:
        ${rawWebData.summary}

        Policy Evidence Source URL:
        ${rawWebData.url}

        Policy Evidence to Rate:
        ${JSON.stringify(
          evidenceToRank.slice(0, IEngineConstants.maxEvidenceToUseForRatingEvidence),
          null, 2)}

        Your ratings in JSON format:
       `
      ),
    ];
  }

  async rateWebEvidence(policy: PSPolicy, subProblemIndex: number) {
    this.logger.info(`Rating all web evidence for policy ${policy.title}`);

    try {
      for (const evidenceType of IEngineConstants.policyEvidenceFieldTypes) {
        let offset = 0;
        const limit = 100;
        const searchType = IEngineConstants.simplifyEvidenceType(evidenceType);

        while (true) {
          const results = await this.evidenceWebPageVectorStore.getWebPagesForProcessing(
            this.memory.groupId,
            subProblemIndex,
            searchType,
            policy.title,
            limit,
            offset
          );

          this.logger.debug(`Got ${results.data.Get["EvidenceWebPage"].length} WebPage results from Weaviate`);

          if (results.data.Get["EvidenceWebPage"].length === 0) {
            this.logger.info("Exiting");
            break;
          }

          let pageCounter = 0;
          for (const retrievedObject of results.data.Get["EvidenceWebPage"]) {
            const webPage = retrievedObject as PSEvidenceRawWebPageData;
            const id = webPage._additional!.id!;

            const fieldKey = evidenceType as keyof PSEvidenceRawWebPageData;

            if (
              webPage[fieldKey] &&
              Array.isArray(webPage[fieldKey]) &&
              (webPage[fieldKey] as string[]).length > 0
            ) {
              const evidenceToRank = webPage[fieldKey] as string[];

              let ratedEvidence: PSPolicyRating = await this.callLLM(
                "rate-web-evidence",
                IEngineConstants.rateWebEvidenceModel,
                await this.renderProblemPrompt(
                  subProblemIndex,
                  policy,
                  webPage,
                  evidenceToRank,
                  fieldKey
                )
              );

              await this.evidenceWebPageVectorStore.updateScores(
                id,
                ratedEvidence,
                true
              );

              this.logger.debug(
                `${id} - Evident ratings (${evidenceType}):\n${JSON.stringify(ratedEvidence, null, 2)}`
              );
            }

            this.logger.info(
              `${subProblemIndex} - (+${offset + pageCounter++}) - ${id} - Updated`
            );
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
    this.logger.info("Rate web evidence Processor");
    super.process();

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.rateWebEvidenceModel.temperature,
      maxTokens: IEngineConstants.rateWebEvidenceModel.maxOutputTokens,
      modelName: IEngineConstants.rateWebEvidenceModel.name,
      verbose: IEngineConstants.rateWebEvidenceModel.verbose,
    });

    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      IEngineConstants.maxSubProblems
    );

    const skipSubProblemsIndexes: number[] = [];

    const currentGeneration = 0;

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        this.logger.info(`Rating sub problem ${subProblemIndex}`);
        const subProblem = this.memory.subProblems[subProblemIndex];
        if (!skipSubProblemsIndexes.includes(subProblemIndex)) {
          if (subProblem.policies) {
            const policies = subProblem.policies.populations[currentGeneration];
            for (
              let p = 0;
              p <
              Math.min(
                policies.length,
                IEngineConstants.maxTopPoliciesToProcess
              );
              p++
            ) {
              const policy = policies[p];
              try {
                await this.rateWebEvidence(policy, subProblemIndex);
                this.logger.debug(
                  `Finished ranking sub problem ${subProblemIndex} for policy ${policy}`
                );
              } catch (error: any) {
                this.logger.error(error.stack || error);
                throw error;
              }
            }
          }
        } else {
          this.logger.info(`Skipping sub problem ${subProblemIndex}`);
        }
      }
    );

    await Promise.all(subProblemsPromises);
    this.logger.info("Finished rating all web evidence");
  }
}
