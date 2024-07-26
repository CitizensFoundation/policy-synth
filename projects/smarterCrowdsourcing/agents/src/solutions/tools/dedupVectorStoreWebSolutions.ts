import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";

import ioredis from "ioredis";

const redis = new ioredis(
  process.env.REDIS_AGENT_URL || "redis://localhost:6379"
);

export class RemoveDuplicateVectorStoreWebSolutions extends SolutionsEvolutionSmarterCrowdsourcingAgent {
  webPageVectorStore = new WebPageVectorStore();
  allUrls = new Set<string>();
  duplicateUrls: string[] = [];

  constructor(memory: PsSmarterCrowdsourcingMemoryData) {
    super(null as any, memory,1,1);
    this.memory = memory;
  }

  async removeDuplicates(subProblemIndex: number) {
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

        this.logger.debug(
          `Got ${results.data.Get["WebPage"].length} WebPage results from Weaviate`
        );

        if (results.data.Get["WebPage"].length === 0) {
          this.logger.info("Exiting");
          break;
        }

        let pageCounter = 0;
        for (const retrievedObject of results.data.Get["WebPage"]) {
          const webPage = retrievedObject as PsWebPageAnalysisData;
          const id = webPage._additional!.id!;

          if (this.allUrls.has(webPage.url)) {
            this.duplicateUrls.push(webPage.url);
            await this.webPageVectorStore.deleteWebSolution(id);
            this.logger.info(
              `${subProblemIndex} - (+${
                offset + pageCounter++
              }) - ${id} - Removed`
            );
          } else {
            this.allUrls.add(webPage.url);
          }

          this.logger.info(`${subProblemIndex} - (+${offset + pageCounter++})`);
        }

        offset += limit;
      } catch (error: any) {
        this.logger.error(error.stack || error);
        throw error;
      }
    }
  }

  async process() {
    this.logger.info("Dedup web solutions Agent");
    super.process();

    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      this.maxSubProblems
    );

    const skipSubProblemsIndexes: number[] = [];

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        this.logger.info(`Ranking sub problem ${subProblemIndex}`);

        if (!skipSubProblemsIndexes.includes(subProblemIndex)) {
          try {
            await this.removeDuplicates(subProblemIndex);
            this.logger.debug(
              `Finished deduping sub problem ${subProblemIndex}`
            );
          } catch (error: any) {
            this.logger.error(error.stack || error);
            throw error;
          }
        } else {
          this.logger.info(`Skipping sub problem ${subProblemIndex}`);
        }
      }
    );

    await Promise.all(subProblemsPromises);
    console.log(
      `Duplicate URLs: ${JSON.stringify(this.duplicateUrls, null, 2)}`
    );
    console.log(`Total URLs: ${this.allUrls.size}`)
    this.logger.info("Finished deduping all web solutions");
  }
}

const main = async () => {
  const projectId = process.argv[2];

  if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const projectMemoryData = JSON.parse((await redis.get(redisKey)) || "{}");

    if (projectMemoryData.subProblems) {
      const removeDuplicatesAgent = new RemoveDuplicateVectorStoreWebSolutions(
        projectMemoryData
      );
      await removeDuplicatesAgent.process();
      console.log("Sub problems processed successfully.");
    } else {
      console.error("No subProblems found in the project memory.");
    }
  } else {
    console.error("Project ID is required as a command-line argument.");
  }

  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
