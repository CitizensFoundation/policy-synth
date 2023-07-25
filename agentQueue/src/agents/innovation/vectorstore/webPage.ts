import weaviate from 'weaviate-ts-client';
import { WeaviateClient } from "weaviate-ts-client";
import { Base } from "../../../base.js";
import { IEngineConstants } from "../../../constants.js";
import fs from 'fs/promises';

export class WebPageVectorStore extends Base {
  //@ts-ignore
  static client: WeaviateClient = weaviate.client({
    scheme: process.env.WEAVIATE_HTTP_SCHEME || "http",
    host: process.env.WEAVIATE_HOST || "localhost:8080",
  });


  async addSchema() {
    let classObj;
    try {
      const data = await fs.readFile('./schemas/webPage.json', 'utf8');
      classObj = JSON.parse(data);
    } catch (err) {
      console.error(`Error reading file from disk: ${err}`);
      return;
    }

    try {
      const res = await WebPageVectorStore.client.schema.classCreator().withClass(classObj).do();
      console.log(res);
    } catch (err) {
      console.error(`Error creating schema: ${err}`);
    }
  }

  async showScheme() {
    try {
      const res = await WebPageVectorStore.client.schema.getter().do()
      console.log(JSON.stringify(res, null, 2));
    } catch (err) {
      console.error(`Error creating schema: ${err}`);
    }
  }

  async deleteScheme() {
    try {
      const res = await WebPageVectorStore.client.schema.classDeleter()
      .withClassName("WebPage")
      .do();
      console.log(res);
    } catch (err) {
      console.error(`Error creating schema: ${err}`);
    }
  }


  async testQuery() {
    const res = await WebPageVectorStore.client.graphql
      .get()
      .withClassName('WebPage')
      .withFields('summary relevanceToProblem \
        solutionsIdentifiedInTextContext mostRelevantParagraphs tags entities \
        _additional { distance }')
      .withNearText({concepts: ['democracy']})
      .withLimit(100)
      .do();

    console.log(JSON.stringify(res, null, 2));
    return res;
  }

  async postWebPage(webPageAnalysis: IEngineWebPageAnalysisData) {
    return new Promise((resolve, reject) => {
      WebPageVectorStore.client.data
        .creator()
        .withClassName("WebPage")
        .withProperties(webPageAnalysis as any)
        .do()
        .then((res) => {
          this.logger.info(`Weaviate: Have saved web page ${(webPageAnalysis as any).url}`)
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async searchWebPages(
    query: string,
    groupId: number | undefined,
    subProblemIndex: number | undefined,
    searchType: IEngineWebPageTypes | undefined
  ): Promise<IEngineWebPageGraphQlResults> {
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
      results = await WebPageVectorStore.client.graphql
        .get()
        .withClassName("WebPage")
        .withNearText({ concepts: [query] })
        .withLimit(IEngineConstants.limits.webPageVectorResultsForNewSolutions)
        .withWhere({
          operator: "And",
          operands: where,
        })
        .withFields(
          "searchType subProblemIndex summary relevanceToProblem \
          solutionsIdentifiedInTextContext url mostRelevantParagraphs tags entities \
          _additional { distance }"
        )
        .do();
    } catch (err) {
      throw err;
    }

    return results as IEngineWebPageGraphQlResults;
  }
}
