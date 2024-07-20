import weaviate from "weaviate-ts-client";
import { WeaviateClient } from "weaviate-ts-client";
import { PolicySynthSimpleAgentBase } from "@policysynth/agents/base/simpleAgent.js";

import fs from "fs/promises";

export class EvidenceWebPageVectorStore extends PolicySynthSimpleAgentBase {
  //@ts-ignore
  static client: WeaviateClient = weaviate.client({
    scheme: process.env.WEAVIATE_HTTP_SCHEME || "http",
    host: process.env.WEAVIATE_HOST || "localhost:8080",
  });

  async addSchema() {
    let classObj;
    try {
      const data = await fs.readFile("./schemas/evidenceWebPage.json", "utf8");
      classObj = JSON.parse(data);
    } catch (err) {
      console.error(`Error reading file from disk: ${err}`);
      return;
    }

    try {
      const res = await EvidenceWebPageVectorStore.client.schema
        .classCreator()
        .withClass(classObj)
        .do();
      console.log(res);
    } catch (err) {
      console.error(`Error creating schema: ${err}`);
    }
  }

  async showScheme() {
    try {
      const res = await EvidenceWebPageVectorStore.client.schema.getter().do();
      console.log(JSON.stringify(res, null, 2));
    } catch (err) {
      console.error(`Error creating schema: ${err}`);
    }
  }

  async deleteScheme() {
    try {
      const res = await EvidenceWebPageVectorStore.client.schema
        .classDeleter()
        .withClassName("EvidenceWebPage")
        .do();
      console.log(res);
    } catch (err) {
      console.error(`Error creating schema: ${err}`);
    }
  }

  async testQuery() {
    const where: any[] = [];

    const res = await EvidenceWebPageVectorStore.client.graphql
      .get()
      .withClassName("EvidenceWebPage")
      .withFields(
        "searchType summary groupId entityIndex subProblemIndex relevanceToPolicyProposal \
        allPossiblePositiveEvidenceIdentifiedInTextContext \
        allPossibleNegativeEvidenceIdentifiedInTextContext \
        allPossibleNeutralEvidenceIdentifiedInTextContext \
        allPossibleEconomicEvidenceIdentifiedInTextContext \
        allPossibleScientificEvidenceIdentifiedInTextContext \
        allPossibleCulturalEvidenceIdentifiedInTextContext \
        allPossibleEnvironmentalEvidenceIdentifiedInTextContext \
        allPossibleLegalEvidenceIdentifiedInTextContext \
        allPossibleTechnologicalEvidenceIdentifiedInTextContext \
        allPossibleGeopoliticalEvidenceIdentifiedInTextContext \
        allPossibleCaseStudiesIdentifiedInTextContext \
        allPossibleStakeholderOpinionsIdentifiedInTextContext \
        allPossibleExpertOpinionsIdentifiedInTextContext \
        allPossiblePublicOpinionsIdentifiedInTextContext \
        allPossibleHistoricalContextIdentifiedInTextContext \
        allPossibleEthicalConsiderationsIdentifiedInTextContext \
        allPossibleLongTermImpactIdentifiedInTextContext \
        allPossibleShortTermImpactIdentifiedInTextContext \
        allPossibleLocalPerspectiveIdentifiedInTextContext \
        allPossibleGlobalPerspectiveIdentifiedInTextContext \
        allPossibleCostAnalysisIdentifiedInTextContext \
        policyTitle confidenceScore relevanceScore qualityScore totalScore relevanceToTypeScore \
        mostImportantPolicyEvidenceInTextContext prosForPolicyFoundInTextContext \
        consForPolicyFoundInTextContext whatPolicyNeedsToImplementInResponseToEvidence \
        risksForPolicy evidenceAcademicSources hasBeenRefined \
        allPossibleImplementationFeasibilityIdentifiedInTextContext \
         mostRelevantParagraphs contacts tags entities url\
        _additional { distance }"
      )
      .withNearText({ concepts: ["democracy"] })
      .withLimit(100)
      .do();

    console.log(JSON.stringify(res, null, 2));
    return res;
  }

  async postWebPage(webPageAnalysis: PSEvidenceRawWebPageData) {
    return new Promise((resolve, reject) => {
      EvidenceWebPageVectorStore.client.data
        .creator()
        .withClassName("EvidenceWebPage")
        .withProperties(webPageAnalysis as any)
        .do()
        .then((res) => {
          this.logger.info(
            `Weaviate: Have saved evidence web page ${
              (webPageAnalysis as any).url
            }`
          );
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async updateWebPage(id: string, webPageAnalysis: PSEvidenceRawWebPageData) {
    return new Promise((resolve, reject) => {
      EvidenceWebPageVectorStore.client.data
        .updater()
        .withId(id)
        .withClassName("EvidenceWebPage")
        .withProperties(webPageAnalysis as any)
        .do()
        .then((res) => {
          this.logger.info(
            `Weaviate: Have updated web page ${(webPageAnalysis as any).url}`
          );
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async updateWebSolutions(
    id: string,
    evidenceType: string,
    evidence: string[],
    quiet = false
  ) {
    const props = {} as any;
    props[evidenceType] = evidence;
    return new Promise((resolve, reject) => {
      EvidenceWebPageVectorStore.client.data
        .merger()
        .withId(id)
        .withClassName("EvidenceWebPage")
        .withProperties(props)
        .do()
        .then((res) => {
          if (!quiet)
            this.logger.info(`Weaviate: Have updated web solutions for ${id}`);
          resolve(res);
        })
        .catch((err) => {
          this.logger.error(err.stack || err);
          reject(err);
        });
    });
  }

  async saveWebPageMetadata(
    id: string,
    metadata: PSWebPageMetadata,
    quiet = false
  ) {
    const props = {} as any;
    return new Promise((resolve, reject) => {
      EvidenceWebPageVectorStore.client.data
        .merger()
        .withId(id)
        .withClassName("EvidenceWebPage")
        .withProperties(metadata as any)
        .do()
        .then((res) => {
          if (!quiet)
            this.logger.info(`Weaviate: Have updated web solutions for ${id}`);
          resolve(res);
        })
        .catch((err) => {
          this.logger.error(err.stack || err);
          reject(err);
        });
    });
  }

  async updateRefinedAnalysis(
    id: string,
    refinedEvidence: PSRefinedPolicyEvidence,
    quiet = false
  ) {
    const totalScore =
      refinedEvidence.qualityScore +
      refinedEvidence.confidenceScore +
      refinedEvidence.relevanceScore +
      refinedEvidence.relevanceToTypeScore;
    refinedEvidence.totalScore = totalScore;
    this.logger.debug(`Total score is ${totalScore} for ${id}`);
    return new Promise((resolve, reject) => {
      EvidenceWebPageVectorStore.client.data
        .merger()
        .withId(id)
        .withClassName("EvidenceWebPage")
        .withProperties(refinedEvidence as any)
        .do()
        .then((res) => {
          if (!quiet)
            this.logger.info(
              `Weaviate: Have updated refined evidence type for ${id}`
            );
          resolve(res);
        })
        .catch((err) => {
          this.logger.error(err.stack || err);
          reject(err);
        });
    });
  }

  async updateScores(id: string, scores: PSPolicyRating, quiet = false) {
    return new Promise((resolve, reject) => {
      EvidenceWebPageVectorStore.client.data
        .merger()
        .withId(id)
        .withClassName("EvidenceWebPage")
        .withProperties({
          qualityScore: scores.evidenceQualityScore,
          relevanceScore: scores.evidenceRelevanceToPolicyProposalScore,
          confidenceScore: scores.evidenceConfidenceScore,
          relevanceToTypeScore: scores.evidenceRelevanceToEvidenceTypeScore,
          totalScore:
            scores.evidenceQualityScore +
            scores.evidenceRelevanceToPolicyProposalScore +
            scores.evidenceConfidenceScore +
            scores.evidenceRelevanceToEvidenceTypeScore,
        })
        .do()
        .then((res) => {
          if (!quiet)
            this.logger.info(`Weaviate: Have updated scores for ${id}`);
          resolve(res);
        })
        .catch((err) => {
          this.logger.error(err.stack || err);
          reject(err);
        });
    });
  }

  async getWebPage(id: string): Promise<PSEvidenceRawWebPageData> {
    return new Promise((resolve, reject) => {
      EvidenceWebPageVectorStore.client.data
        .getterById()
        .withId(id)
        .withClassName("EvidenceWebPage")
        .do()
        .then((res) => {
          this.logger.info(`Weaviate: Have got web page ${id}`);
          const webData = (res as PsWebPageGraphQlSingleResult)
            .properties as PSEvidenceRawWebPageData;
          resolve(webData);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getTopPagesForProcessing(
    groupId: number,
    subProblemIndex: number | undefined | null = undefined,
    policyTitle: string | undefined,
    searchType: string | undefined,
    limit = 10
  ): Promise<PSEvidenceWebPageGraphQlResults> {
    let query;
    let where: any[] | undefined = undefined;
    where = [
      {
        path: ["groupId"],
        operator: "Equal",
        valueInt: groupId,
      },
    ];

    if (subProblemIndex !== undefined && subProblemIndex !== null) {
      where.push({
        path: ["subProblemIndex"],
        operator: "Equal",
        valueInt: subProblemIndex,
      });
    } else if (subProblemIndex === null) {
      where.push({
        path: ["subProblemIndex"],
        operator: "IsNull",
        valueBoolean: true,
      });
    }

    if (searchType) {
      where.push({
        path: ["searchType"],
        operator: "Equal",
        valueString: searchType,
      });
    }

    if (policyTitle) {
      where.push({
        path: ["policyTitle"],
        operator: "Equal",
        valueString: policyTitle,
      });
    }

    try {
      query = EvidenceWebPageVectorStore.client.graphql
        .get()
        .withClassName("EvidenceWebPage")
        .withLimit(limit)
        .withSort([{ path: ["totalScore"], order: "desc" }])
        .withWhere({
          operator: "And",
          operands: where,
        })
        .withFields(
          "searchType summary groupId entityIndex subProblemIndex relevanceToPolicyProposal \
          allPossiblePositiveEvidenceIdentifiedInTextContext \
          allPossibleNegativeEvidenceIdentifiedInTextContext \
          allPossibleNeutralEvidenceIdentifiedInTextContext \
          allPossibleEconomicEvidenceIdentifiedInTextContext \
          allPossibleScientificEvidenceIdentifiedInTextContext \
          allPossibleCulturalEvidenceIdentifiedInTextContext \
          allPossibleEnvironmentalEvidenceIdentifiedInTextContext \
          allPossibleLegalEvidenceIdentifiedInTextContext \
          allPossibleTechnologicalEvidenceIdentifiedInTextContext \
          allPossibleGeopoliticalEvidenceIdentifiedInTextContext \
          allPossibleCaseStudiesIdentifiedInTextContext \
          allPossibleStakeholderOpinionsIdentifiedInTextContext \
          allPossibleExpertOpinionsIdentifiedInTextContext \
          allPossiblePublicOpinionsIdentifiedInTextContext \
          allPossibleHistoricalContextIdentifiedInTextContext \
          allPossibleEthicalConsiderationsIdentifiedInTextContext \
          allPossibleLongTermImpactIdentifiedInTextContext \
          allPossibleShortTermImpactIdentifiedInTextContext \
          allPossibleLocalPerspectiveIdentifiedInTextContext \
          allPossibleGlobalPerspectiveIdentifiedInTextContext \
          allPossibleCostAnalysisIdentifiedInTextContext \
          allPossibleImplementationFeasibilityIdentifiedInTextContext \
          policyTitle confidenceScore relevanceScore qualityScore totalScore relevanceToTypeScore \
          mostImportantPolicyEvidenceInTextContext prosForPolicyFoundInTextContext \
          consForPolicyFoundInTextContext whatPolicyNeedsToImplementInResponseToEvidence \
          risksForPolicy evidenceAcademicSources hasBeenRefined \
          metaDate metaTitle metaDescription metaPublisher \
          metaImageUrl metaLogoUrl metaAuthor \
          evidenceOrganizationSources evidenceHumanSources \
          mostRelevantParagraphs contacts tags entities url\
          _additional { distance, id }"
        );
      return await query.do();
    } catch (err) {
      throw err;
    }
  }

  async getTopWebPagesForProcessing(
    groupId: number,
    subProblemIndex: number | undefined | null = undefined,
    searchType: string | undefined = undefined,
    policyTitle: string | undefined,
    limit = 10,
    offset = 0,
    evidenceCountLimit: number | undefined = 0,
    onlyRefined = false
  ): Promise<PSEvidenceWebPageGraphQlResults> {
    let where: any[] | undefined = undefined;
    where = [
      {
        path: ["groupId"],
        operator: "Equal",
        valueInt: groupId,
      },
    ];

    if (subProblemIndex !== undefined && subProblemIndex !== null) {
      where.push({
        path: ["subProblemIndex"],
        operator: "Equal",
        valueInt: subProblemIndex,
      });
    } else if (subProblemIndex === null) {
      where.push({
        path: ["subProblemIndex"],
        operator: "IsNull",
        valueBoolean: true,
      });
    }

    if (searchType) {
      where.push({
        path: ["searchType"],
        operator: "Equal",
        valueString: searchType,
      });
    }

    if (onlyRefined) {
      where.push({
        path: ["hasBeenRefined"],
        operator: "Equal",
        valueBoolean: true,
      });
    }

    if (policyTitle) {
      where.push({
        path: ["policyTitle"],
        operator: "Equal",
        valueString: policyTitle,
      });
    }

    if (evidenceCountLimit !== undefined) {
    }

    let query;

    try {
      query = EvidenceWebPageVectorStore.client.graphql
        .get()
        .withClassName("EvidenceWebPage")
        .withLimit(limit)
        .withOffset(offset)
        .withSort([{ path: ["totalScore"], order: "desc" }])
        .withWhere({
          operator: "And",
          operands: where,
        })
        .withFields(
          "searchType summary groupId entityIndex subProblemIndex relevanceToPolicyProposal \
          allPossiblePositiveEvidenceIdentifiedInTextContext \
          allPossibleNegativeEvidenceIdentifiedInTextContext \
          allPossibleNeutralEvidenceIdentifiedInTextContext \
          allPossibleEconomicEvidenceIdentifiedInTextContext \
          allPossibleScientificEvidenceIdentifiedInTextContext \
          allPossibleCulturalEvidenceIdentifiedInTextContext \
          allPossibleEnvironmentalEvidenceIdentifiedInTextContext \
          allPossibleLegalEvidenceIdentifiedInTextContext \
          allPossibleTechnologicalEvidenceIdentifiedInTextContext \
          allPossibleGeopoliticalEvidenceIdentifiedInTextContext \
          allPossibleCaseStudiesIdentifiedInTextContext \
          allPossibleStakeholderOpinionsIdentifiedInTextContext \
          allPossibleExpertOpinionsIdentifiedInTextContext \
          allPossiblePublicOpinionsIdentifiedInTextContext \
          allPossibleHistoricalContextIdentifiedInTextContext \
          allPossibleEthicalConsiderationsIdentifiedInTextContext \
          allPossibleLongTermImpactIdentifiedInTextContext \
          allPossibleShortTermImpactIdentifiedInTextContext \
          allPossibleLocalPerspectiveIdentifiedInTextContext \
          allPossibleGlobalPerspectiveIdentifiedInTextContext \
          allPossibleCostAnalysisIdentifiedInTextContext \
          allPossibleImplementationFeasibilityIdentifiedInTextContext \
          policyTitle confidenceScore relevanceScore qualityScore totalScore relevanceToTypeScore \
          mostImportantPolicyEvidenceInTextContext prosForPolicyFoundInTextContext \
          consForPolicyFoundInTextContext whatPolicyNeedsToImplementInResponseToEvidence \
          risksForPolicy evidenceAcademicSources \
          metaDate metaTitle metaDescription metaPublisher \
          metaImageUrl metaLogoUrl metaAuthor \
          hasBeenRefined \
          evidenceOrganizationSources evidenceHumanSources \
          mostRelevantParagraphs contacts tags entities url\
          _additional { distance, id }"
        );
      return await query.do();
    } catch (err) {
      throw err;
    }
  }


  async getWebPagesForProcessing(
    groupId: number,
    subProblemIndex: number | undefined | null = undefined,
    searchType: string | undefined = undefined,
    policyTitle: string | undefined,
    limit = 10,
    offset = 0,
    evidenceCountLimit: number | undefined = 0
  ): Promise<PSEvidenceWebPageGraphQlResults> {
    let where: any[] | undefined = undefined;
    where = [
      {
        path: ["groupId"],
        operator: "Equal",
        valueInt: groupId,
      },
    ];

    if (subProblemIndex !== undefined && subProblemIndex !== null) {
      where.push({
        path: ["subProblemIndex"],
        operator: "Equal",
        valueInt: subProblemIndex,
      });
    } else if (subProblemIndex === null) {
      where.push({
        path: ["subProblemIndex"],
        operator: "IsNull",
        valueBoolean: true,
      });
    }

    if (searchType) {
      where.push({
        path: ["searchType"],
        operator: "Equal",
        valueString: searchType,
      });
    }

    if (policyTitle) {
      where.push({
        path: ["policyTitle"],
        operator: "Equal",
        valueString: policyTitle,
      });
    }

    if (evidenceCountLimit !== undefined) {
    }

    let query;

    try {
      query = EvidenceWebPageVectorStore.client.graphql
        .get()
        .withClassName("EvidenceWebPage")
        .withLimit(limit)
        .withOffset(offset)
        .withWhere({
          operator: "And",
          operands: where,
        })
        .withFields(
          "searchType summary groupId entityIndex subProblemIndex relevanceToPolicyProposal \
          allPossiblePositiveEvidenceIdentifiedInTextContext \
          allPossibleNegativeEvidenceIdentifiedInTextContext \
          allPossibleNeutralEvidenceIdentifiedInTextContext \
          allPossibleEconomicEvidenceIdentifiedInTextContext \
          allPossibleScientificEvidenceIdentifiedInTextContext \
          allPossibleCulturalEvidenceIdentifiedInTextContext \
          allPossibleEnvironmentalEvidenceIdentifiedInTextContext \
          allPossibleLegalEvidenceIdentifiedInTextContext \
          allPossibleTechnologicalEvidenceIdentifiedInTextContext \
          allPossibleGeopoliticalEvidenceIdentifiedInTextContext \
          allPossibleCaseStudiesIdentifiedInTextContext \
          allPossibleStakeholderOpinionsIdentifiedInTextContext \
          allPossibleExpertOpinionsIdentifiedInTextContext \
          allPossiblePublicOpinionsIdentifiedInTextContext \
          allPossibleHistoricalContextIdentifiedInTextContext \
          allPossibleEthicalConsiderationsIdentifiedInTextContext \
          allPossibleLongTermImpactIdentifiedInTextContext \
          allPossibleShortTermImpactIdentifiedInTextContext \
          allPossibleLocalPerspectiveIdentifiedInTextContext \
          allPossibleGlobalPerspectiveIdentifiedInTextContext \
          allPossibleCostAnalysisIdentifiedInTextContext \
          allPossibleImplementationFeasibilityIdentifiedInTextContext \
          policyTitle confidenceScore relevanceScore qualityScore totalScore relevanceToTypeScore \
          mostImportantPolicyEvidenceInTextContext prosForPolicyFoundInTextContext \
          consForPolicyFoundInTextContext whatPolicyNeedsToImplementInResponseToEvidence \
          risksForPolicy evidenceAcademicSources hasBeenRefined \
          evidenceOrganizationSources evidenceHumanSources \
          mostRelevantParagraphs contacts tags entities url\
          _additional { distance, id }"
        );
      return await query.do();
    } catch (err) {
      throw err;
    }
  }

  async webPageExist(
    groupId: number,
    url: string,
    searchType: PSEvidenceWebPageTypes,
    subProblemIndex: number | undefined,
    entityIndex: number | undefined
  ): Promise<Boolean> {
    //TODO: Fix any here
    const where: any[] = [];

    where.push({
      path: ["groupId"],
      operator: "Equal",
      valueInt: groupId,
    });

    where.push({
      path: ["url"],
      operator: "Equal",
      valueString: url,
    });

    where.push({
      path: ["searchType"],
      operator: "Equal",
      valueString: searchType,
    });

    if (subProblemIndex !== undefined) {
      where.push({
        path: ["subProblemIndex"],
        operator: "Equal",
        valueInt: subProblemIndex,
      });
    } else {
      where.push({
        path: ["subProblemIndex"],
        operator: "IsNull",
        valueBoolean: true,
      });
    }

    if (entityIndex !== undefined) {
      where.push({
        path: ["entityIndex"],
        operator: "Equal",
        valueInt: entityIndex,
      });
    } else {
      where.push({
        path: ["entityIndex"],
        operator: "IsNull",
        valueBoolean: true,
      });
    }

    let results;

    try {
      results = await EvidenceWebPageVectorStore.client.graphql
        .get()
        .withClassName("EvidenceWebPage")
        .withLimit(20)
        .withWhere({
          operator: "And",
          operands: where,
        })
        .withFields(
          "searchType subProblemIndex summary relevanceToPolicyProposal \
           url mostRelevantParagraphs tags entities \
          _additional { distance }"
        )
        .do();

      const resultPages = results.data.Get[
        "EvidenceWebPage"
      ] as PsWebPageAnalysisData[];

      if (resultPages.length > 0) {
        let allSubProblems = true;
        let allEntities = true;

        resultPages.forEach((page) => {
          if (page.subProblemIndex === undefined) {
            allSubProblems = false;
          }
          if (page.entityIndex === undefined) {
            allEntities = false;
          }
        });

        if (subProblemIndex === undefined) {
          if (!allSubProblems) {
            return true;
          }
        }

        if (entityIndex === undefined && subProblemIndex !== undefined) {
          if (!allEntities) {
            return true;
          }
        }

        if (subProblemIndex !== undefined && entityIndex !== undefined) {
          return true;
        }
      }

      return false;
    } catch (err) {
      throw err;
    }
  }

  async searchWebPages(
    query: string,
    groupId: number | undefined,
    subProblemIndex: number | undefined,
    searchType: PSEvidenceWebPageTypes | undefined
  ): Promise<PSEvidenceWebPageGraphQlResults> {
    //TODO: Fix any here
    const where: any[] = [];

    if (groupId) {
      where.push({
        path: ["groupId"],
        operator: "Equal",
        valueInt: groupId,
      });
    }

    if (subProblemIndex) {
      where.push({
        path: ["subProblemIndex"],
        operator: "Equal",
        valueInt: subProblemIndex,
      });
    }

    if (searchType) {
      where.push({
        path: ["searchType"],
        operator: "Equal",
        valueString: searchType,
      });
    }

    let results;

    try {
      results = await EvidenceWebPageVectorStore.client.graphql
        .get()
        .withClassName("EvidenceWebPage")
        .withNearText({ concepts: [query] })
        .withLimit(25) //TODO: Get this from a config
        .withWhere({
          operator: "And",
          operands: where,
        })
        .withFields(
          "searchType subProblemIndex summary relevanceToPolicyProposal \
           url mostRelevantParagraphs tags entities \
          _additional { distance }"
        )
        .do();
    } catch (err) {
      throw err;
    }

    return results as PSEvidenceWebPageGraphQlResults;
  }
}
