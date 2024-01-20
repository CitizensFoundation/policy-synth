import { Base } from "../../../base.js";
import { IEngineConstants } from "../../../constants.js";
import { BaseProcessor } from "../../baseProcessor.js";
import { WebPageVectorStore } from "../webPage.js";
import ioredis from "ioredis";
import fs from "fs/promises";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

class ShowCounts extends BaseProcessor {
  webPageVectorStore = new WebPageVectorStore();

  foundIds = new Set<string>();
  foundUrls = new Set<string>();
  totalWebPageCount = 0;
  totalSolutionsFound = 0;
  totalEmptySolutions = 0;
  totalNonEmptySolutions = 0;

  async countWebPages(subProblemIndex: number | undefined) {
    let webPageCount = 0;
    let solutionsCount = 0;
    let offset = 0;
    const limit = 100;

    while (true) {
      const results = await this.webPageVectorStore.getWebPagesForProcessing(
        this.memory.groupId,
        subProblemIndex,
        undefined,
        undefined,
        limit,
        offset
      );

      if (results.data.Get["WebPage"].length === 0) break;

      for (const retrievedObject of results.data.Get["WebPage"]) {
        const webPage = retrievedObject as IEngineWebPageAnalysisData;
        const id = webPage._additional!.id!;

        this.foundIds.add(id);
        this.foundUrls.add(webPage.url);

        webPageCount++;
        this.totalWebPageCount++;

        if (webPage.solutionsIdentifiedInTextContext &&
          webPage.solutionsIdentifiedInTextContext instanceof Array) {
          solutionsCount += webPage.solutionsIdentifiedInTextContext.length;
          if (webPage.solutionsIdentifiedInTextContext.length === 0) {
            this.totalEmptySolutions++;
          } else {
            this.totalNonEmptySolutions++
          }
          //this.logger.debug(`Solutions found: ${webPage.solutionsIdentifiedInTextContext.length}`)
        }

        this.totalSolutionsFound += solutionsCount;
      }

      offset+=limit;
      //this.logger.debug(`Offset: ${offset}`)
    }

    return { webPageCount, solutionsCount };
  }

  async process() {
    this.logger.info("Show counts Processor");
    super.process();

    let totalWebPages = 0;
    let totalSolutions = 0;

    const counts = await this.countWebPages(undefined);
    totalSolutions += counts.solutionsCount;
    totalWebPages += counts.webPageCount;

    this.logger.debug("+++++++++++++++++++++++++++++++++++++");
    this.logger.debug(
      `Problem Statement Web Page Count: ${counts.webPageCount}`
    );
    this.logger.debug(
      `Problem Statement Solutions Count: ${counts.solutionsCount}`
    );
    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      IEngineConstants.maxSubProblems
    );

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        this.logger.info(`Count sub problem ${subProblemIndex + 1}`);

        const subProblemTitle = this.memory.subProblems[subProblemIndex].title;

        const counts = await this.countWebPages(subProblemIndex);

        totalSolutions += counts.solutionsCount;
        totalWebPages += counts.webPageCount;

        this.logger.debug("--------------------------------------");
        this.logger.debug(
          `${subProblemTitle} Web Page Count: ${counts.webPageCount}`
        );
        this.logger.debug(
          `${subProblemTitle} Solutions Count: ${counts.solutionsCount}`
        );
      }
    );

    await Promise.all(subProblemsPromises);

    this.logger.debug("============================");
    this.logger.debug(`Total Web Page Count: ${totalWebPages}`);
    this.logger.debug(`Total Solutions Count: ${totalSolutions}`);

    this.logger.debug(`Total Unique Web Page Ids Count: ${this.foundIds.size}`);
    this.logger.debug(`Total Uinque URLs Count: ${this.foundUrls.size}`);
    this.logger.debug(`Total Unique Solutions Count: ${this.totalSolutionsFound}`);
    this.logger.debug(`Total Web Pages Count: ${this.totalWebPageCount}`);

    this.logger.debug(`Total Empty Solutions Count: ${this.totalEmptySolutions}`);
    this.logger.debug(`Total Non Empty Solutions Count: ${this.totalNonEmptySolutions}`);

    this.logger.info("Finished counting all solutions");
  }
}

async function run() {
  const projectId = process.argv[2];

  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as IEngineInnovationMemoryData;

    const counts = new ShowCounts({} as any, memory);
    await counts.process();
    process.exit(0);
  } else {
    console.log("No project id provided");
    process.exit(1);
  }
}

run();