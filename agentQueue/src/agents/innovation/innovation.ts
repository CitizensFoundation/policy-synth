import { BaseAgent } from "../baseAgent.js";
import { Worker, Job } from "bullmq";
import { CreateSubProblemsProcessor } from "./create/createSubProblems.js";
import { CreateEntitiesProcessor } from "./create/createEntities.js";
import { CreateProsConsProcessor } from "./create/createProsCons.js";
import { CreateSearchQueriesProcessor } from "./create/createSearchQueries.js";
import { CreateSolutionsProcessor } from "./create/createSolutions.js";
import { RankEntitiesProcessor } from "./ranking/rankEntities.js";
import { RankProsConsProcessor } from "./ranking/rankProsCons.js";
import { RankSearchQueriesProcessor } from "./ranking/rankSearchQueries.js";
import { RankSearchResultsProcessor } from "./ranking/rankSearchResults.js";
import { RankSolutionsProcessor } from "./ranking/rankSolutions.js";
import { RankSubProblemsProcessor } from "./ranking/rankSubProblems.js";
import { GetWebPagesProcessor } from "./web/getWebPages.js";
import { SearchWebProcessor } from "./web/searchWeb.js";
import { EvolvePopulationProcessor } from "./evolve/evolvePopulation.js";

export class AgentInnovation extends BaseAgent {
  declare memory: IEngineInnovationMemoryData;

  override async initializeMemory(job: Job) {
    const jobData = job.data as IEngineWorkerData;

    this.memory = {
      redisKey: this.getRedisKey(jobData.groupId),
      groupId: jobData.groupId,
      communityId: jobData.communityId,
      domainId: jobData.domainId,
      currentStage: "create-sub-problems",
      stages: {
        // Break the main problem down into smaller, more manageable sub-problems
        "create-sub-problems": {},

        // Determine the order of importance or priority of the sub-problems
        "rank-sub-problems": {},

        // Establish the entities (objects, individuals, concepts, etc.) relevant to the problem
        "create-entities": {},

        // Determine the order of importance or priority of the entities
        "rank-entities": {},

        // Formulate search queries to gather relevant data or information
        "create-search-queries": {},

        // Prioritize the search queries based on their expected relevance or importance
        "rank-search-queries": {},

        // Perform web search based on the prioritized queries
        "web-search": {},

        // Rank the search results based on their relevance or usefulness
        "rank-search-results": {},

        // Retrieve web pages obtained from the search
        "web-get-pages": {},

        // Create initial or seed solutions based on the gathered information
        "create-seed-solutions": {},

        // Analyze the advantages and disadvantages of each solution
        "create-pros-cons": {},

        // Rank the pros and cons based on their impact on the solution
        "rank-pros-cons": {},

        // Rank the potential solutions based on their efficacy
        "rank-solutions": {},

        // Initiate a population of solutions for evolutionary computation
        "evolve-create-population": {},

        // Apply mutation operator in the population to introduce variation
        "evolve-mutate-population": {},

        // Apply recombination operator in the population to create new solutions
        "evolve-recombine-population": {},

        // Evaluate and rank the population after mutation and recombination
        "evolve-rank-population": {},

        // Parse the solution into a human-readable format
        parse: {},

        // Save the final solution for future use or reference
        save: {},

        // Indicate the end of the process
        done: {},
      },
      timeStart: Date.now(),
      totalCost: 0,
      systemInstructions: {
       createSolutions: "",
       rankSolutions: ""
      },
      problemStatement: {
        description: jobData.initialProblemStatement,
        searchQueries: {
          general: [],
          scientific: [],
          news: [],
          openData: [],
        },
        searchResults: {
          pages: {
            general: [],
            scientific: [],
            news: [],
            openData: [],
          }
        },
      },
      subProblems: [],
      currentStageData: undefined,
    } as IEngineInnovationMemoryData;
    await this.saveMemory();
  }

  async setStage(stage: IEngineStageTypes) {
    this.memory.currentStage = stage;
    this.memory.stages[stage].timeStart = Date.now();

    await this.saveMemory();
  }

  async processSubProblems() {
    const subProblemsProcessor = new CreateSubProblemsProcessor(
      this.job,
      this.memory
    );

    await subProblemsProcessor.process();
  }

  async process() {
    switch (this.memory.currentStage) {
      case "create-sub-problems":
        await this.processSubProblems();
        break;
      case "create-entities":
        const createEntitiesProcessor = new CreateEntitiesProcessor(
          this.job,
          this.memory
        );
        await createEntitiesProcessor.process();
        break;
      case "create-pros-cons":
        const createProsConsProcessor = new CreateProsConsProcessor(
          this.job,
          this.memory
        );
        await createProsConsProcessor.process();
        break;
      case "create-search-queries":
        const createSearchQueriesProcessor = new CreateSearchQueriesProcessor(
          this.job,
          this.memory
        );
        await createSearchQueriesProcessor.process();
        break;
      case "create-seed-solutions":
        const createSolutionsProcessor = new CreateSolutionsProcessor(
          this.job,
          this.memory
        );
        await createSolutionsProcessor.process();
        break;
      case "rank-entities":
        const rankEntitiesProcessor = new RankEntitiesProcessor(
          this.job,
          this.memory
        );
        await rankEntitiesProcessor.process();
        break;
      case "rank-pros-cons":
        const rankProsConsProcessor = new RankProsConsProcessor(
          this.job,
          this.memory
        );
        await rankProsConsProcessor.process();
        break;
      case "rank-search-queries":
        const rankSearchQueriesProcessor = new RankSearchQueriesProcessor(
          this.job,
          this.memory
        );
        await rankSearchQueriesProcessor.process();
        break;
      case "rank-search-results":
        const rankSearchResultsProcessor = new RankSearchResultsProcessor(
          this.job,
          this.memory
        );
        await rankSearchResultsProcessor.process();
        break;
      case "rank-solutions":
        const rankSolutionsProcessor = new RankSolutionsProcessor(
          this.job,
          this.memory
        );
        await rankSolutionsProcessor.process();
        break;
      case "rank-sub-problems":
        const rankSubProblemsProcessor = new RankSubProblemsProcessor(
          this.job,
          this.memory
        );
        await rankSubProblemsProcessor.process();
        break;
      case "web-get-pages":
        const getWebPagesProcessor = new GetWebPagesProcessor(
          this.job,
          this.memory
        );
        await getWebPagesProcessor.process();
        break;
      case "web-search":
        const searchWebProcessor = new SearchWebProcessor(
          this.job,
          this.memory
        );
        await searchWebProcessor.process();
        break;
      case "evolve-create-population":
        const createPopulationProcessor = new EvolvePopulationProcessor(
          this.job,
          this.memory
        );
        await createPopulationProcessor.process();
        break;
      default:
      console.log("No stage matched");
    }
  }
}

const agent = new Worker(
  "agent-innovation",
  async (job: Job) => {
    console.log(`Processing job ${job.id}`);
    const agent = new AgentInnovation();
    await agent.setup(job);
    await agent.process();
    return job.data;
  },
  { concurrency: parseInt(process.env.AGENT_INNOVATION_CONCURRENCY || "1") }
);

process.on("SIGINT", async () => {
  await agent.close();
});
